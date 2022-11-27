import {InteractionType, toGeometryFeature} from "../core/InteractionType";
import {MutableRefObject, RefObject, useContext, useRef, useState} from "react";
import Map from "ol/Map";
import {Draw, Select} from "ol/interaction";
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import {StorageContext} from "../components/StorageContext";
import {Feature, MapBrowserEvent, Overlay} from "ol";
import {EventsKey} from "ol/events";
import {SelectEvent} from "ol/interaction/Select";
import {unByKey} from "ol/Observable";
import {Fill, Stroke, Style} from "ol/style";
import CircleStyle from "ol/style/Circle";
import {DrawEvent} from "ol/interaction/Draw";
import {set, update} from "idb-keyval";
import {updateNoteMeta} from "../components/MapContainer";
import log from "../core/Logger";
import {getStyleByFeatureType} from "../core/controller/FeatureStyleController";
import {Point} from "ol/geom";
import {GeoJSON} from "ol/format";

const useMapInteractions = (
  id: string,
  mapRef: MutableRefObject<Map|undefined>,
  featuresSourceRef: MutableRefObject<VectorSource|undefined>,
  featuresLayerRef: MutableRefObject<VectorLayer<VectorSource>|undefined>,
  popupRef: {
    popupOverlayRef: MutableRefObject<Overlay|undefined>
    popupContainerRef: RefObject<HTMLDivElement>,
    popupContentRef: RefObject<HTMLDivElement>,
    popupCloserRef: RefObject<HTMLAnchorElement>,
  }
) => {

  const storageContext = useContext(StorageContext);

  const drawInteractionRef = useRef<Draw>();
  const selectInteractionRef = useRef<Select>();

  const mapInteractionKeys = useRef<EventsKey[]>([]);

  const selectedFeatureRef = useRef<Feature>();

  const [selectedFeature, setSelectedFeature] = useState<boolean>(false);
  const onSelectedFeature = (event: SelectEvent) => {
    if (event.selected.length > 0) {
      selectedFeatureRef.current = event.selected[0];
      setSelectedFeature(true);
    } else {
      selectedFeatureRef.current = undefined;
      setSelectedFeature(false);
    }
  }

  function updateLocalFeatures(features: Array<Feature>) {
    set(id, new GeoJSON().writeFeatures(features), storageContext?.noteStoreRef.current)
      .then(() => log("[UPDATE] Add new feature"));
  }

  function addMarker(coordinates: number[], label: string|null|undefined): void {

    if (!featuresSourceRef.current) return;

    const markerFeature = new Feature({
      label: label,
    });
    markerFeature.setStyle(getStyleByFeatureType("Point"));
    markerFeature.setGeometry(coordinates ? new Point(coordinates) : undefined);
    featuresSourceRef.current.addFeature(markerFeature);

    updateLocalFeatures(featuresSourceRef.current.getFeatures());

  }

  function updateInteraction(interactionType: InteractionType, isFreeHand: boolean): void {

    if (!mapRef.current) return;

    const popupContentRef = popupRef!.popupContentRef;
    const popupCloserRef = popupRef!.popupCloserRef;
    const popupOverlayRef = popupRef!.popupOverlayRef;

    function showPopup(event: MapBrowserEvent<UIEvent>) {
      const coordinate = event.coordinate;
      if (popupContentRef.current && popupOverlayRef.current) {
        popupContentRef.current.innerHTML = '<input id="popup-label" class="my-1 border border-1 border-black px-2 py-1" type="text"/><button id="popup-button" class="my-1 px-2 py-1 border border-1 border-black hover:bg-gray-300">Add</button>';
        popupOverlayRef.current.setPosition(coordinate);
        window.document.getElementById("popup-button")?.addEventListener("click", () => {
          const input = window.document.getElementById("popup-label") as HTMLInputElement;
          addMarker(coordinate, input.value);
          popupOverlayRef.current?.setPosition(undefined);
        });
      }
    }

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
      mapInteractionKeys.current?.push(mapRef.current.on('click', function (evt) {
        const feature = mapRef.current?.forEachFeatureAtPixel(evt.pixel, function (feature) {
          return feature;
        });
        popupOverlayRef.current?.setPosition(undefined);
        if (!feature || !feature.get("label")) {
          return;
        }
        popupOverlayRef.current?.setPosition(evt.coordinate);
        if (popupContentRef.current) popupContentRef.current.innerHTML = `<p>${feature?.get("label")}</p>`;
      }));
      return;
    }

    if (interactionType === InteractionType.Select && featuresLayerRef.current) {
      const selected = new Style({
        fill: new Fill({
          color: 'yellow',
        }),
        stroke: new Stroke({
          color: 'yellow',
          width: 4,
        }),
        image: new CircleStyle({
          radius: 6,
          fill: new Fill({ color: 'yellow' }),
          stroke: new Stroke({ color: 'yellow', width: 2 }),
        })
      });
      function selectStyle(feature: any) {
        return selected;
      }
      selectInteractionRef.current = new Select({
        style: selectStyle,
        layers: [featuresLayerRef.current],
      });
      selectInteractionRef.current?.setHitTolerance(10);
      mapRef.current?.addInteraction(selectInteractionRef.current);
      selectInteractionRef.current?.on('select', function (e) {
        onSelectedFeature(e);
      });
      return;
    }

    if (interactionType === InteractionType.Marker) {
      mapInteractionKeys.current?.push(mapRef.current.on('singleclick', showPopup));
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
      updateLocalFeatures(features);
      update(id, (note) => updateNoteMeta(note), storageContext?.noteMetaStoreRef.current)
        .then(() => log("[UPDATE] Updated note modifiedOn"));
    });

    log('[UPDATE] Change drawType:', interactionType);

  }

  return {updateInteraction, selectedFeatureRef, selectedFeature, setSelectedFeature};

};

export default useMapInteractions;