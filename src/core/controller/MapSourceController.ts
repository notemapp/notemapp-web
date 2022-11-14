import {get, set} from "idb-keyval";
import {GeoJSON} from "ol/format";
import log from "../Logger";
import VectorSource from "ol/source/Vector";
import {MutableRefObject} from "react";
import {StorageContextInterface} from "../../components/StorageContext";

function initFeaturesSource(
  noteId: string,
  storageContext: StorageContextInterface|null,
  source: MutableRefObject<VectorSource>
): void {

  if (!source.current) {
    source.current = new VectorSource({
      wrapX: false,
      loader: async () => {
        const features = await get(noteId, storageContext?.noteStoreRef?.current);
        if (source.current && features) {
          source.current.addFeatures(new GeoJSON().readFeatures(features));
          log("[INIT] Loaded features from store");
        } else {
          log("[INIT] No features found in store");
        }
      }
    });

    get(noteId).then((value) => {
      if (value === undefined && source.current) {
        set(noteId, new GeoJSON().writeFeatures(source.current.getFeatures()), storageContext?.noteStoreRef.current)
          .then(() => log("[INIT] Create new note"));
      }
    });

  }

}

function initLocationSource(
  source: MutableRefObject<VectorSource>
): void {

  if (!source.current) {
    source.current = new VectorSource({wrapX: false});
  }

}

function initSources(
  noteId: string,
  storageContext: StorageContextInterface|null,
  featuresSource: MutableRefObject<VectorSource>,
  locationSource: MutableRefObject<VectorSource>
): void {

  initFeaturesSource(noteId, storageContext, featuresSource);
  initLocationSource(locationSource);

}

export { initSources };