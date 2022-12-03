import {InteractionType, toGeometryFeature} from "../core/InteractionType";
import {MutableRefObject, RefObject, useEffect, useRef, useState} from "react";
import Map from "ol/Map";
import {Draw, Select} from "ol/interaction";
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import {Feature, MapBrowserEvent, Overlay} from "ol";
import {EventsKey} from "ol/events";
import {SelectEvent} from "ol/interaction/Select";
import {unByKey} from "ol/Observable";
import {Fill, Icon, Stroke, Style} from "ol/style";
import CircleStyle from "ol/style/Circle";
import {DrawEvent} from "ol/interaction/Draw";
import log from "../core/Logger";
import {Point} from "ol/geom";
import UndoRedo from "ol-ext/interaction/UndoRedo";
import useStorage from "./useStorage";
import {renderToString} from "react-dom/server";
import AnnotationMarkerPopupContent, {
  ID_MARKER_BUTTON_CREATE,
  ID_MARKER_CONTENT
} from "../components/AnnotationMarkerPopupContent";
import useMarkdownRenderer from "./useMarkdownRenderer";

function getIconStyle(assetSrc: string) {
  return new Style({
    image: new Icon({
      anchor: [0, 0],
      anchorXUnits: 'fraction',
      anchorYUnits: 'pixels',
      src: assetSrc,
    }),
  });
}

export const MARKER_STYLE = getIconStyle('/assets/icons/note.svg');

const useMapInteractions = (
  id: string,
  mapRef: MutableRefObject<Map|undefined>,
  featuresSourceRef: MutableRefObject<VectorSource|undefined>,
  featuresLayerRef: MutableRefObject<VectorLayer<VectorSource>|undefined>,
  popupRef: {
    popupOverlayRef: MutableRefObject<Overlay|undefined>
    popupContainerRef: RefObject<HTMLDivElement>,
    popupContentRef: RefObject<HTMLDivElement>,
    popupCloserRef: RefObject<HTMLDivElement>,
  }
) => {

  const storage = useStorage();

  const drawInteractionRef = useRef<Draw>();
  const selectInteractionRef = useRef<Select>();
  const undoRedoInteractionRef = useRef<UndoRedo>();

  const mapInteractionKeys = useRef<EventsKey[]>([]);

  const selectedFeatureRef = useRef<Feature>();
  const [selectedFeature, setSelectedFeature] = useState<boolean>(false);

  function onFeatureSelect(event: SelectEvent) {
    if (event.selected.length > 0) {
      selectedFeatureRef.current = event.selected[0];
      setSelectedFeature(true);
    } else {
      selectedFeatureRef.current = undefined;
      setSelectedFeature(false);
    }
  }

  function addAnnotationMarker(coordinates: number[], content: string|null|undefined): void {

    if (!featuresSourceRef.current) return;

    const markerFeature = new Feature({content: content});
    markerFeature.setStyle(MARKER_STYLE);
    markerFeature.setGeometry(new Point(coordinates));
    featuresSourceRef.current.addFeature(markerFeature);

    storage.saveFeatures(id, featuresSourceRef.current.getFeatures());

  }

  function showAnnotationMarkerPopup(coordinates: number[]) {

    const popupContentRef = popupRef!.popupContentRef;
    const popupOverlayRef = popupRef!.popupOverlayRef;

    if (popupContentRef.current && popupOverlayRef.current) {
      popupContentRef.current.innerHTML = renderToString(AnnotationMarkerPopupContent({content: '', isEditing: true}));
      window.document.getElementById(ID_MARKER_BUTTON_CREATE)?.addEventListener("click", () => {
        const input = window.document.getElementById(ID_MARKER_CONTENT) as HTMLInputElement;
        addAnnotationMarker(coordinates, input.value);
        popupOverlayRef.current?.setPosition(undefined);
      });
      popupOverlayRef.current.setPosition(coordinates);
    }

  }

  function updateInteraction(interactionType: InteractionType, isFreeHand: boolean): void {

    if (!mapRef.current) return;

    if (mapInteractionKeys.current) {
      mapInteractionKeys.current.forEach(key => unByKey(key));
      mapInteractionKeys.current = [];
    }

    if (drawInteractionRef.current) {
      mapRef.current.removeInteraction(drawInteractionRef.current);
    }
    if (selectInteractionRef.current) {
      mapRef.current.removeInteraction(selectInteractionRef.current);
    }

    if (interactionType === InteractionType.None) {
      initAnnotationMarkerPopupInteraction(mapRef.current);
      return;
    }

    if (interactionType === InteractionType.Select && featuresLayerRef.current) {

      const selectedPolyStyle = new Style({
        fill: new Fill({
          color: 'rgba(204,148,20,0.50)',
        }),
        stroke: new Stroke({
          color: 'rgba(204,148,20,0.60)',
          width: 3,
        })
      });

      const selectedLineStringStyle = new Style({
        stroke: new Stroke({
          color: 'rgba(224,28,28,1)',
          width: 3,
        })
      });
      
      const selectedMarkerStyle = getIconStyle('/assets/icons/selected-note.svg');

      function selectStyle(feature: any) {

        const featureType = feature.getGeometry().getType().toString();

        if ('Point' === featureType) {
          return selectedMarkerStyle;
        } else if ('LineString' === featureType) {
          return selectedLineStringStyle;
        } else {
          return selectedPolyStyle;
        }

      }
      selectInteractionRef.current = new Select({
        style: selectStyle,
        layers: [featuresLayerRef.current],
      });
      selectInteractionRef.current?.setHitTolerance(10);
      mapRef.current?.addInteraction(selectInteractionRef.current);
      selectInteractionRef.current?.on('select', function (e) {
        onFeatureSelect(e);
      });
      return;
    }

    if (interactionType === InteractionType.Marker) {
      mapInteractionKeys.current?.push(mapRef.current.on('singleclick', (event: MapBrowserEvent<UIEvent>) => showAnnotationMarkerPopup(event.coordinate)));
      return;
    }

    const {type, geometryFunction} = toGeometryFeature(interactionType);

    drawInteractionRef.current = new Draw({
      source: featuresSourceRef.current,
      // @ts-ignore
      type: type,
      geometryFunction: geometryFunction,
      freehand: isFreeHand,
      //style: getStyleByInteractionType(drawType),
    });
    mapRef.current.addInteraction(drawInteractionRef.current);

    drawInteractionRef.current.on('drawend', (event: DrawEvent) => {
      let features = featuresSourceRef.current?.getFeatures() || [];
      features = features.concat(event.feature); // Source is not updated yet, add the new feature manually
      storage.saveFeatures(id, features);
      storage.updateModifiedOn(id);
    });

    log('[UPDATE] Change drawType:', interactionType);

  }

  const markdownRenderer = useMarkdownRenderer();

  function initAnnotationMarkerPopupInteraction(map: Map) {

    mapInteractionKeys.current?.push(map.on('click', function (evt) {
      const feature = mapRef.current?.forEachFeatureAtPixel(evt.pixel, function (feature) {
        return feature;
      });
      popupRef.popupOverlayRef.current?.setPosition(undefined);
      if (!feature || !feature.get("content")) {
        return;
      }
      popupRef.popupOverlayRef.current?.setPosition(evt.coordinate);
      if (popupRef.popupContentRef.current) {
        let markerContentMarkdown = feature.get("content");
        if (markerContentMarkdown) {
          const renderedMarkerContent = markdownRenderer.render(markerContentMarkdown);
          popupRef.popupContentRef.current.innerHTML = renderToString(AnnotationMarkerPopupContent({
            content: renderedMarkerContent,
            isEditing: false
          }));
        }
      }
    }));

  }

  function initUndoRedoInteraction(map: Map, layer: VectorLayer<VectorSource>): void {

    if (!undoRedoInteractionRef.current) {
      undoRedoInteractionRef.current = new UndoRedo({
        maxLength: 20,
        layers: [layer],
      });
      map.addInteraction(undoRedoInteractionRef.current);
    }

  }

  useEffect(() => {
    if (mapRef.current) {
      initAnnotationMarkerPopupInteraction(mapRef.current);
      initUndoRedoInteraction(mapRef.current, featuresLayerRef.current!);
    }
  }, [mapRef.current])

  return {updateInteraction, undoRedoInteractionRef, selectedFeatureRef, selectedFeature, setSelectedFeature};

};

export default useMapInteractions;