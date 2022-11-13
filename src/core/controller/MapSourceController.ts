import {get, UseStore} from "idb-keyval";
import {GeoJSON} from "ol/format";
import log from "../Logger";
import VectorSource from "ol/source/Vector";
import {MutableRefObject} from "react";

function initFeaturesSource(
  noteId: string,
  noteStoreRef: MutableRefObject<UseStore|undefined>,
  source: MutableRefObject<VectorSource>
): void {

  if (!source.current) {
    source.current = new VectorSource({
      wrapX: false,
      loader: async () => {
        const features = await get(noteId, noteStoreRef?.current);
        if (source.current && features) {
          source.current.addFeatures(new GeoJSON().readFeatures(features));
          log("[INIT] Loaded features from store");
        }
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
  noteStoreRef: MutableRefObject<UseStore|undefined>,
  featuresSource: MutableRefObject<VectorSource>,
  locationSource: MutableRefObject<VectorSource>
): void {

  initFeaturesSource(noteId, noteStoreRef, featuresSource);
  initLocationSource(locationSource);

}

export { initSources };