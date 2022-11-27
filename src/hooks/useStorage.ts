import {useContext} from "react";
import {NotePrefs, StorageContext} from "../components/StorageContext";
import {Feature} from "ol";
import {get, set, update} from "idb-keyval";
import {GeoJSON} from "ol/format";
import log from "../core/Logger";
import {Note} from "../core/Note";
import {TileLayerType} from "../core/TileLayerType";

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

  function updateLastUsedLayer(id: string, layer: TileLayerType, onUpdate: (() => void)|undefined = undefined) {

    if (!onUpdate) onUpdate = () => log("[UPDATE] Updated last used layer on store");

    update(id, (note) => {return {...note, layer: layer.valueOf()}}, storageContext?.notePrefsStoreRef.current)
      .then(onUpdate)

  }

  function updateFeatures(id: string, newFeatures: Feature[], onUpdate: (() => void)|undefined = undefined) {

    if (!onUpdate) onUpdate = () => log("[UPDATE] Updated features on store");

    saveFeatures(id, newFeatures, () => {
      updateModifiedOn(id, new Date(), onUpdate);
    });

  }

  function fetchLastUsedLayer(id: string, onFetch: (layer: TileLayerType) => void) {

    get(id, storageContext?.notePrefsStoreRef.current).then((prefs: NotePrefs) => {
      onFetch(prefs?.layer || TileLayerType.PAPER);
    });

  }

  return {
    saveFeatures,
    updateFeatures,
    updateModifiedOn,
    updateLastUsedLayer,
    fetchLastUsedLayer
  };

};

export default useStorage;