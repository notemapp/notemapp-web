import {get} from "idb-keyval";
import {GeoJSON} from "ol/format";
import log from "../Logger";
import VectorSource from "ol/source/Vector";
import {MutableRefObject} from "react";
import {StorageContextInterface} from "../../components/StorageContext";

function initFeaturesSource(
  noteId: string,
  storageContext: StorageContextInterface,
  sourceRef: MutableRefObject<VectorSource>
): void {

  if (!sourceRef.current) {
    sourceRef.current = new VectorSource({
      wrapX: false,
      loader: async () => {
        const features = await get(noteId, storageContext?.noteStoreRef?.current);
        if (sourceRef.current && features) {
          sourceRef.current.addFeatures(new GeoJSON().readFeatures(features));
          log("[INIT] Loaded features from store");
        }
      }
    });
  }

}

function initLocationSource(
  sourceRef: MutableRefObject<VectorSource>
): void {

  if (!sourceRef.current) {
    sourceRef.current = new VectorSource({wrapX: false});
  }

}

function initSources(
  noteId: string,
  storageContext: StorageContextInterface,
  featuresSourceRef: MutableRefObject<VectorSource>,
  locationSourceRef: MutableRefObject<VectorSource>
): void {

  initFeaturesSource(noteId, storageContext, featuresSourceRef);
  initLocationSource(locationSourceRef);

}

export { initSources };