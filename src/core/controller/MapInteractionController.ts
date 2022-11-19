import {MutableRefObject, RefObject} from "react";
import UndoRedo from "ol-ext/interaction/UndoRedo";
import Map from "ol/Map";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import {InteractionType, toGeometryFeature} from "../InteractionType";
import {Draw, Select} from "ol/interaction";
import {DrawEvent} from "ol/interaction/Draw";
import {set, update} from "idb-keyval";
import {GeoJSON} from "ol/format";
import log from "../Logger";
import {StorageContextInterface} from "../../components/StorageContext";
import {updateNoteMeta} from "../../components/MapContainer";
import {Feature, MapBrowserEvent, Overlay} from "ol";
import {Point} from "ol/geom";
import {Fill, Stroke, Style} from "ol/style";
import CircleStyle from "ol/style/Circle";
import {EventsKey} from "ol/events";
import {unByKey} from "ol/Observable";
import {SelectEvent} from "ol/interaction/Select";
import {getStyleByFeatureType, getStyleByInteractionType} from "./FeatureStyleController";

function initUndoInteraction(
  interactionRef: MutableRefObject<any|undefined>,
  mapRef: MutableRefObject<Map|undefined>,
  layerRef: MutableRefObject<VectorLayer<VectorSource>|undefined>
): void {

  if (!interactionRef.current && mapRef.current) {
    interactionRef.current = new UndoRedo({
      maxLength: 20,
      layers: [layerRef.current],
    });
    mapRef.current.addInteraction(interactionRef.current);
  }

}

function updateLocalFeatures(
  noteId: string,
  features: Array<Feature>,
  storageContext: StorageContextInterface|null
) {
  set(noteId, new GeoJSON().writeFeatures(features), storageContext?.noteStoreRef.current)
      .then(() => log("[UPDATE] Add new feature"));
}

function addMarker(
    layerSourceRef: MutableRefObject<VectorSource|undefined>,
    noteId: string,
    storageContext: StorageContextInterface|null,
    coordinates: number[],
    label: string|null|undefined
): void {

  if (!layerSourceRef.current) return;

  const markerFeature = new Feature({
    label: label,
  });
  markerFeature.setStyle(getStyleByFeatureType("Point"));
  markerFeature.setGeometry(coordinates ? new Point(coordinates) : undefined);
  layerSourceRef.current.addFeature(markerFeature);

  updateLocalFeatures(
      noteId,
      layerSourceRef.current.getFeatures(),
      storageContext
  );

}

function updateDrawInteraction(
  drawType: InteractionType,
  freeHand: boolean,
  mapRef: MutableRefObject<Map|undefined>,
  interactionRef: MutableRefObject<Draw|undefined>,
  selectInteractionRef: MutableRefObject<Select|undefined>,
  sourceRef: MutableRefObject<VectorSource|undefined>,
  noteId: string,
  storageContext: StorageContextInterface|null,
  popupContentRef: RefObject<HTMLDivElement|undefined>,
  popupOverlayRef: MutableRefObject<Overlay|undefined>,
  mapInteractionKeys: MutableRefObject<Array<EventsKey>|undefined>,
  selectedFeatureRef: MutableRefObject<Feature|undefined>,
  onSelectedFeature: (event: SelectEvent) => void,
): void {

  if (!mapRef.current) return;

  function showPopup(event: MapBrowserEvent<UIEvent>) {
    const coordinate = event.coordinate;
    if (popupContentRef.current && popupOverlayRef.current) {
      popupContentRef.current.innerHTML = '<input id="popup-label" class="my-1 border border-1 border-black px-2 py-1" type="text"/><button id="popup-button" class="my-1 px-2 py-1 border border-1 border-black hover:bg-gray-300">Add</button>';
      popupOverlayRef.current.setPosition(coordinate);
      window.document.getElementById("popup-button")?.addEventListener("click", () => {
        const input = window.document.getElementById("popup-label") as HTMLInputElement;
        addMarker(sourceRef, noteId, storageContext, coordinate, input.value);
        popupOverlayRef.current?.setPosition(undefined);
      });
    }
  }

  if (mapInteractionKeys.current) {
    mapInteractionKeys.current.forEach(key => unByKey(key));
    mapInteractionKeys.current = [];
  }

  if (interactionRef.current) {
    mapRef.current.removeInteraction(interactionRef.current);
  }
  if (selectInteractionRef.current) {
    mapRef.current.removeInteraction(selectInteractionRef.current);
  }

  if (drawType === InteractionType.None) {
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

  if (drawType === InteractionType.Select) {
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
    selectInteractionRef.current = new Select({style: selectStyle});
    selectInteractionRef.current?.setHitTolerance(10);
    mapRef.current?.addInteraction(selectInteractionRef.current);
    selectInteractionRef.current?.on('select', function (e) {
      onSelectedFeature(e);
    });
    return;
  }

  if (drawType === InteractionType.Marker) {
    mapInteractionKeys.current?.push(mapRef.current.on('singleclick', showPopup));
    return;
  }

  const {type, geometryFunction} = toGeometryFeature(drawType);

  interactionRef.current = new Draw({
    source: sourceRef.current,
    // @ts-ignore
    type: type,
    geometryFunction: geometryFunction,
    freehand: freeHand,
    style: getStyleByInteractionType(drawType),
  });
  mapRef.current.addInteraction(interactionRef.current);

  interactionRef.current.on('drawend', (event: DrawEvent) => {
    let features = sourceRef.current?.getFeatures() || [];
    features = features.concat(event.feature); // Source is not updated yet, add the new feature manually
    updateLocalFeatures(noteId, features, storageContext);
    update(noteId, (note) => updateNoteMeta(note), storageContext?.noteMetaStoreRef.current)
      .then(() => log("[UPDATE] Updated note modifiedOn"));
  });

  log('[UPDATE] Change drawType:', drawType);

}

export { initUndoInteraction, updateDrawInteraction, addMarker };