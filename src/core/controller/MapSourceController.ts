import {get, UseStore} from "idb-keyval";
import {GeoJSON} from "ol/format";
import log from "../Logger";
import VectorSource from "ol/source/Vector";
import {MutableRefObject} from "react";

function initFeaturesSource(
  noteId: string,
  noteStoreRef: MutableRefObject<UseStore|undefined>,
  sourceRef: MutableRefObject<VectorSource>
): void {

  if (!sourceRef.current) {
    sourceRef.current = new VectorSource({
      wrapX: false,
      loader: async () => {
        const features = await get(noteId, noteStoreRef?.current);
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
  noteStoreRef: MutableRefObject<UseStore|undefined>,
  featuresSourceRef: MutableRefObject<VectorSource>,
  locationSourceRef: MutableRefObject<VectorSource>
): void {

  initFeaturesSource(noteId, noteStoreRef, featuresSourceRef);
  initLocationSource(locationSourceRef);

}

export { initSources };