import {MutableRefObject} from "react";
import UndoRedo from "ol-ext/interaction/UndoRedo";
import Map from "ol/Map";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import {set} from "idb-keyval";
import {GeoJSON} from "ol/format";
import log from "../Logger";
import {StorageContextInterface} from "../../components/StorageContext";
import {Feature} from "ol";

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

export { initUndoInteraction, updateLocalFeatures };