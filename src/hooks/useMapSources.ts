import {useContext, useRef} from "react";
import {StorageContext} from "../components/StorageContext";
import VectorSource from "ol/source/Vector";
import {set} from "idb-keyval";
import {GeoJSON} from "ol/format";
import log from "../core/Logger";
import useStorage from "./useStorage";

const useMapSources = (id: string) => {

  const featuresSourceRef = useRef<VectorSource>();
  const locationSourceRef = useRef<VectorSource>();

  const storage = useStorage();
  const storageContext = useContext(StorageContext);

  function initMapSources(): void {

    if (!featuresSourceRef.current) {
      featuresSourceRef.current = new VectorSource({
        wrapX: false,
        loader: async () => {
          const features = await storage.getNoteContent(id);
          if (features) {
            featuresSourceRef.current?.addFeatures(new GeoJSON().readFeatures(features));
            log("[INIT] Loaded features from store");
          } else {
            set(id, new GeoJSON().writeFeatures(featuresSourceRef.current?.getFeatures() || []), storageContext?.noteStoreRef.current)
              .then(() => log("[INIT] No features found in store - created new note"));
          }
        }
      });
    }

    if (!locationSourceRef.current) {
      locationSourceRef.current = new VectorSource({wrapX: false});
    }

  }

  return {featuresSourceRef, locationSourceRef, initMapSources};

};

export default useMapSources;