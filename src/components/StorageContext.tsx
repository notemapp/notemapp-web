import {createContext, MutableRefObject, ReactNode, useLayoutEffect, useRef} from "react";
import {createStore, UseStore} from "idb-keyval";
import {DB_NOTES, DB_NOTES_META, DB_NOTES_PREFS, STORE_NOTES, STORE_NOTES_META, STORE_NOTES_PREFS} from "../core/Keys";
import {TileLayerType} from "../core/TileLayerType";
import {Coordinate} from "ol/coordinate";

export interface StorageContextInterface {
  noteStoreRef: MutableRefObject<UseStore|undefined>;
  notePrefsStoreRef: MutableRefObject<UseStore|undefined>;
  noteMetaStoreRef: MutableRefObject<UseStore|undefined>;
}

export interface NotePrefs {
  layer: TileLayerType;
  center: Coordinate;
  zoom: number;
  rotation: number;
}

export const StorageContext = createContext<StorageContextInterface|null>(null);

export const StorageContextProvider = (props: {children: ReactNode}) => {

  const noteStoreRef = useRef<UseStore>();
  const notePrefsStoreRef = useRef<UseStore>();
  const noteMetaStoreRef = useRef<UseStore>();

  // We are using useLayoutEffect to trigger the creation of the stores before the children useEffect are called
  useLayoutEffect(() => {
    if (!noteStoreRef.current)
      noteStoreRef.current = createStore(DB_NOTES, STORE_NOTES);
    if (!notePrefsStoreRef.current)
      notePrefsStoreRef.current = createStore(DB_NOTES_PREFS, STORE_NOTES_PREFS);
    if (!noteMetaStoreRef.current)
      noteMetaStoreRef.current = createStore(DB_NOTES_META, STORE_NOTES_META);
  }, []);

  return (
    <StorageContext.Provider value={{noteStoreRef: noteStoreRef, notePrefsStoreRef: notePrefsStoreRef, noteMetaStoreRef: noteMetaStoreRef}}>
      {props.children}
    </StorageContext.Provider>
  );

}