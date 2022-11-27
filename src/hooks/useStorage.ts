import {useContext} from "react";
import {StorageContext} from "../components/StorageContext";
import {Feature} from "ol";
import {set, update} from "idb-keyval";
import {GeoJSON} from "ol/format";
import log from "../core/Logger";
import {Note} from "../core/Note";

const useStorage = () => {

  const storageContext = useContext(StorageContext);

  function saveFeatures(id: string, features: Feature[], onSet: (() => void)|undefined = undefined) {

    if (!onSet) onSet = () => log("[SET] Saved features on store");

    set(id, new GeoJSON().writeFeatures(features), storageContext?.noteStoreRef.current).then(onSet);

  }

  function updateModifiedOn(id: string, date: Date = new Date(), onUpdate: (() => void)|undefined = undefined) {

    if (!onUpdate) onUpdate = () => log("[UPDATE] Updated note modification date on store");

    update(id, (prefs: Note|undefined) => {
      return {
        ...prefs,
        modifiedOn: date.toISOString()
      } as Note;
    }, storageContext?.noteMetaStoreRef.current).then(onUpdate);

  }

  return {
    saveFeatures,
    updateModifiedOn
  };

};

export default useStorage;