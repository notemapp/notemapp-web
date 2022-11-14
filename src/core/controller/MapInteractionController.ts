import {MutableRefObject} from "react";
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

function updateDrawInteraction(
  drawType: DrawType,
  freeHand: boolean,
  mapRef: MutableRefObject<Map|undefined>,
  interactionRef: MutableRefObject<Draw|undefined>,
  sourceRef: MutableRefObject<VectorSource|undefined>,
  noteId: string,
  storageContext: StorageContextInterface|null
): void {

  if (!mapRef.current) return;

  if (interactionRef.current) mapRef.current.removeInteraction(interactionRef.current);

  if (drawType === DrawType.None) return;

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
    set(noteId, new GeoJSON().writeFeatures(features), storageContext?.noteStoreRef.current)
      .then(() => log("[UPDATE] Add new feature"));
    update(noteId, (note) => updateNoteMeta(note), storageContext?.noteMetaStoreRef.current)
      .then(() => log("[UPDATE] Updated note modifiedOn"));
  });

  log('[UPDATE] Change drawType:', drawType);

}

export { initUndoInteraction, updateDrawInteraction };