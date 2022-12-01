import {useContext} from "react";
import {NotePrefs, StorageContext} from "../components/StorageContext";
import {Feature} from "ol";
import {del, get, keys, set, update, values} from "idb-keyval";
import {GeoJSON} from "ol/format";
import log from "../core/Logger";
import {Note} from "../core/Note";
import {TileLayerType} from "../core/TileLayerType";
import {Geometry} from "ol/geom";

const useStorage = () => {

  const storageContext = useContext(StorageContext);

  function saveFeatures(id: string, features: Feature[], onSet: (() => void)|undefined = undefined) {

    if (!onSet) onSet = () => log("Saved features on store");

    set(id, new GeoJSON().writeFeatures(features), storageContext?.noteStoreRef.current).then(onSet);

  }

  function updateModifiedOn(id: string, date: Date = new Date(), onUpdate: (() => void)|undefined = undefined) {

    if (!onUpdate) onUpdate = () => log("Updated note modification date on store");

    update(id, (prefs: Note|undefined) => {
      return {
        ...prefs,
        modifiedOn: date.toISOString()
      } as Note;
    }, storageContext?.noteMetaStoreRef.current).then(onUpdate);

  }

  function updateLastUsedLayer(id: string, layer: TileLayerType, onUpdate: (() => void)|undefined = undefined) {

    if (!onUpdate) onUpdate = () => log("Updated last used layer on store");

    update(id, (note) => {return {...note, layer: layer.valueOf()}}, storageContext?.notePrefsStoreRef.current)
      .then(onUpdate)

  }

  function updateFeatures(id: string, newFeatures: Feature[], onUpdate: (() => void)|undefined = undefined) {

    if (!onUpdate) onUpdate = () => log("Updated features on store");

    saveFeatures(id, newFeatures, () => {
      updateModifiedOn(id, new Date(), onUpdate);
    });

  }

  function fetchLastUsedLayer(id: string, onFetch: (layer: TileLayerType) => void) {

    get(id, storageContext?.notePrefsStoreRef.current).then((prefs: NotePrefs) => {
      onFetch(prefs?.layer || TileLayerType.PAPER);
    });

  }

  async function deleteNoteData(id: string, onDelete: (() => void)|undefined = undefined) {

    if (!onDelete) onDelete = () => log("Deleted note:", id);

    await del(id, storageContext?.noteStoreRef.current);
    await del(id, storageContext?.noteMetaStoreRef.current);
    await del(id, storageContext?.notePrefsStoreRef.current);

    onDelete();

  }

  async function updateNoteContent(id: string, content: Feature<Geometry>[], onUpdate: (() => void)|undefined = undefined) {

    if (!onUpdate) onUpdate = () => log("Updated content for note:", id);

    await update(id, (_) => content, storageContext?.noteStoreRef.current);

    onUpdate();

  }

  async function setNoteContent(id: string, content: Feature<Geometry>[], onSet: (() => void)|undefined = undefined) {

    if (!onSet) onSet = () => log("Created content for note:", id);

    await set(id, content, storageContext?.noteStoreRef.current);

    onSet();

  }

  async function setNoteMeta(id: string, meta: Note, onSet: (() => void)|undefined = undefined) {

    if (!onSet) onSet = () => log("Created meta for note:", id);

    await set(id, meta, storageContext?.noteMetaStoreRef.current);

    onSet();

  }

  async function setNotePrefs(id: string, prefs: NotePrefs, onSet: (() => void)|undefined = undefined) {

    if (!onSet) onSet = () => log("Created prefs for note:", id);

    await set(id, prefs, storageContext?.notePrefsStoreRef.current);

    onSet();

  }

  async function updateNoteMeta(id: string, meta: Note, onUpdate: (() => void)|undefined = undefined) {

    if (!onUpdate) onUpdate = () => log("Updated meta for note:", id);

    await update(id, (_) => meta, storageContext?.noteMetaStoreRef.current);

    onUpdate();

  }

  async function updateNotePrefs(id: string, prefs: NotePrefs, onUpdate: (() => void)|undefined = undefined) {

    if (!onUpdate) onUpdate = () => log("Updated prefs for note:", id);

    await update(id, (_) => prefs, storageContext?.notePrefsStoreRef.current);

    onUpdate();

  }

  async function getNoteMeta(id: string): Promise<Note> {

    return (await get(id, storageContext?.noteMetaStoreRef.current)) as Note;

  }

  async function getNotePrefs(id: string): Promise<NotePrefs> {

    return (await get(id, storageContext?.notePrefsStoreRef.current)) as NotePrefs;

  }

  async function getNoteContent(id: string): Promise<object|undefined> {

    return await get(id, storageContext?.noteStoreRef.current);

  }

  async function getNoteProps(id: string): Promise<object> {

    const notePrefs = await getNotePrefs(id);
    const noteMeta = await getNoteMeta(id);

    return {...notePrefs, ...noteMeta};

  }

  async function getNotesIds(): Promise<string[]> {

    return await keys<string>(storageContext?.noteMetaStoreRef.current);

  }

  async function getNotes(): Promise<Note[]> {

    return await values(storageContext?.noteMetaStoreRef.current);

  }

  return {
    saveFeatures,
    updateFeatures,
    updateModifiedOn,
    updateLastUsedLayer,
    fetchLastUsedLayer,
    updateNoteContent,
    updateNoteMeta,
    updateNotePrefs,
    deleteNoteData,
    getNotePrefs,
    getNoteMeta,
    getNoteContent,
    getNoteProps,
    getNotesIds,
    setNoteContent,
    setNoteMeta,
    setNotePrefs,
    getNotes
  };

};

export default useStorage;