import {MutableRefObject, RefObject} from "react";
import UndoRedo from "ol-ext/interaction/UndoRedo";
import Map from "ol/Map";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import {DrawType, toGeometryFeature} from "../DrawType";
import {Draw} from "ol/interaction";
import {DrawEvent} from "ol/interaction/Draw";
import {set, update} from "idb-keyval";
import {GeoJSON} from "ol/format";
import log from "../Logger";
import {StorageContextInterface} from "../../components/StorageContext";
import {updateNoteMeta} from "../../components/MapContainer";
import {Feature, MapBrowserEvent, Overlay} from "ol";
import {Point} from "ol/geom";
import {Fill, Icon, Stroke, Style} from "ol/style";
import CircleStyle from "ol/style/Circle";
import {EventsKey} from "ol/events";
import {unByKey} from "ol/Observable";

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
  markerFeature.setStyle(
      new Style({
        image: new CircleStyle({
          radius: 6,
          fill: new Fill({ color: '#d32f2f' }),
          stroke: new Stroke({ color: '#fff', width: 2 }),
        })
      })
  );
  markerFeature.setGeometry(coordinates ? new Point(coordinates) : undefined);
  layerSourceRef.current.addFeature(markerFeature);

  updateLocalFeatures(
      noteId,
      layerSourceRef.current.getFeatures(),
      storageContext
  );

}

function updateDrawInteraction(
  drawType: DrawType,
  freeHand: boolean,
  mapRef: MutableRefObject<Map|undefined>,
  interactionRef: MutableRefObject<Draw|undefined>,
  sourceRef: MutableRefObject<VectorSource|undefined>,
  noteId: string,
  storageContext: StorageContextInterface|null,
  popupContentRef: RefObject<HTMLDivElement|undefined>,
  popupOverlayRef: MutableRefObject<Overlay|undefined>,
  mapInteractionKeys: MutableRefObject<Array<EventsKey>|undefined>
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

  if (interactionRef.current){
    mapRef.current.removeInteraction(interactionRef.current);
  }

  if (drawType === DrawType.None) {
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

  if (drawType === DrawType.Marker) {
    mapInteractionKeys.current?.push(mapRef.current.on('singleclick', showPopup));
    return;
  }

  const {type, geometryFunction} = toGeometryFeature(drawType);

  interactionRef.current = new Draw({
    source: sourceRef.current,
    // @ts-ignore
    type: type,
    geometryFunction: geometryFunction,
    freehand: freeHand
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