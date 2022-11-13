import {createContext, MutableRefObject, ReactNode, useLayoutEffect, useRef} from "react";
import {createStore, UseStore} from "idb-keyval";
import {DB_NOTES, DB_NOTES_PREFS, STORE_NOTES, STORE_NOTES_PREFS} from "../core/Keys";

interface StorageContextInterface {
  noteStoreRef: MutableRefObject<UseStore|undefined>;
  notePrefsStoreRef: MutableRefObject<UseStore|undefined>;
}

export const StorageContext = createContext<StorageContextInterface|null>(null);

export const StorageContextProvider = (props: {children: ReactNode}) => {

  const noteStoreRef = useRef<UseStore>();
  const notePrefsStoreRef = useRef<UseStore>();

  // We are using useLayoutEffect to trigger the creation of the stores before the children useEffect are called
  useLayoutEffect(() => {
    if (!noteStoreRef.current)
      noteStoreRef.current = createStore(DB_NOTES, STORE_NOTES);
    if (!notePrefsStoreRef.current)
      notePrefsStoreRef.current = createStore(DB_NOTES_PREFS, STORE_NOTES_PREFS);
  }, []);

  return (
    <StorageContext.Provider value={{noteStoreRef: noteStoreRef, notePrefsStoreRef: notePrefsStoreRef}}>
      {props.children}
    </StorageContext.Provider>
  );

}