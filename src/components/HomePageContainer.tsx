import useGoogle from "../hooks/useGoogle";
import {useContext, useEffect, useState} from "react";
import {StorageContext} from "./StorageContext";
import {Note} from "../core/Note";
import {useNavigate} from "react-router-dom";
import {del, entries, set} from "idb-keyval";
import {syncLocalNote, syncLocalNotes, syncRemoteNotes} from "../core/controller/GoogleDriveController";
import log from "../core/Logger";
import {getTimeSinceAsString} from "../core/utils/TimeUtils";
import HomePageNavigation from "./HomePageNavigation";

export default function HomePageContainer() {

  const {signIn, signOut, isSignedIn, googleDrive} = useGoogle();
  const {deleteFileByName} = googleDrive;

  const onSignIn = () => {
    localStorage.setItem('hasPreviouslySignedIn', 'yep');
    signIn();
  }

  const storageContext = useContext(StorageContext);
  const [notes, setNotes] = useState<Note[]>([]);
  const navigate = useNavigate();

  const [_, setIsSyncing] = useState(false);

  useEffect(() => {
    entries(storageContext?.noteMetaStoreRef.current).then((entries) => {
      setNotes(entries.map((entry) => entry[1]));
    });
  }, []);

  function onSyncProgress(noteId: string, progress: number) {
    const note = notes.find((note) => note.id === noteId);
    if (note) {
      note.syncProgress = progress;
      setNotes([...notes]);
    }
  }

  useEffect(() => {
    if (isSignedIn && storageContext) {
      setIsSyncing(true);
      syncLocalNotes(googleDrive, notes, storageContext, onSyncProgress).then(() => {
        console.log("Synced local notes");
        return syncRemoteNotes(googleDrive, notes, storageContext, (note: Note) => {
          setNotes((oldNotes) => [...oldNotes, note]);
        })
      }).then(() => {
        console.log("Synced remote notes");
        setIsSyncing(false);
      });
    }
  }, [isSignedIn]);

  const onDeleteNote = (note: Note) => {
    if (confirm('Are you sure you want to delete this note?')) {
      del(note.id, storageContext?.noteMetaStoreRef.current).then(async () => {
        log("[DELETE] Note meta:", note.id);
        setNotes(notes.filter((n) => n.id !== note.id));
        log("[DELETE] Deleting remote:", note.id);
        await deleteFileByName(note.id + '.json');
        log("[DELETE] Deleting local note content:", note.id);
        await del(note.id, storageContext?.noteStoreRef.current);
        log("[DELETE] Deleting local note prefs:", note.id);
        await del(note.id, storageContext?.notePrefsStoreRef.current);
        log("[DELETE] Deleted local and remote:", note.id);
      });
    }
  }

  const onEditNote = (note: Note) => {
    const newTitle = prompt("Enter a new title", note.title);
    if (!newTitle) return;
    note.title = newTitle || "Untitled note";
    set(note.id, note, storageContext?.noteMetaStoreRef.current).then(() => {
      setNotes(notes.map((n) => n.id === note.id ? note : n));
    });
  }

  const onForceSync = (note: Note|undefined = undefined) => {
    onSignIn();
  }

  const onAddNote = () => {

    const title = prompt("Enter a title for your note", "Untitled note");
    if (!title) return;

    const id = (Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15))
      .slice(0, 8);
    const note: Note = {
      id: id,
      title: title,
      createdOn: new Date().toISOString(),
      modifiedOn: new Date().toISOString(),
      syncProgress: null
    }
    set(id, note, storageContext?.noteMetaStoreRef.current).then(async () => {
      if (!storageContext) return;
      setNotes([...notes, note]);
      await syncLocalNote(googleDrive, note, storageContext, onSyncProgress);
      navigate(`/map/${id}`);
    });

  }

  return (
    <div>
      <HomePageNavigation isSignedIn={isSignedIn} onForceSync={onForceSync} onSignOut={signOut} />
      <div className="p-4 max-w-4xl flex-col m-auto">
        <div>

          <div className="h-12 flex justify-between">
            <h1 className="text-2xl font-bold">My notes</h1>
            <div className="flex space-x-2">
              {
                isSignedIn &&
                <button
                  onClick={() => onForceSync()}
                  className="
                    w-12 h-full rounded flex justify-center items-center
                    bg-gray-200 hover:bg-gray-300
                  "
                >
                  <svg className="w-6 h-6" strokeWidth="1.5" viewBox="0 0 24 24" fill="none"
                       xmlns="http://www.w3.org/2000/svg">
                    <path d="M21.168 8A10.003 10.003 0 0012 2C6.815 2 2.55 5.947 2.05 11" stroke="currentColor"
                          strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M17 8h4.4a.6.6 0 00.6-.6V3M2.881 16c1.544 3.532 5.068 6 9.168 6 5.186 0 9.45-3.947 9.951-9"
                          stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M7.05 16h-4.4a.6.6 0 00-.6.6V21" stroke="currentColor" strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"/>
                  </svg>
                </button>
              }
              <button
                onClick={() => onAddNote()}
                className="
                  w-12 h-full rounded flex justify-center items-center
                  bg-gray-200 hover:bg-gray-300
                "
              >
                <svg className="w-6 h-6" strokeWidth="1.5" viewBox="0 0 24 24" fill="none"
                     xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 12h6m6 0h-6m0 0V6m0 6v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
                        strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
          <div className="w-full h-full my-4 p-4 bg-gray-200 rounded-lg space-y-2 flex-col">
            {
              notes.length > 0 && (
                notes.map((note) => (
                  <div
                    key={note.id}
                    onClick={() => navigate(`/map/${note.id}`)}
                    className="bg-gray-100 p-4 rounded-lg shadow drop-shadow-lg min-w-fit max-w-4xl mx-auto hover:bg-gray-200"
                  >
                    <div className="flex justify-between">
                      <div className="w-auto flex space-x-2 justify-start">
                        <span className="font-semibold text-lg text-ellipsis overflow-hidden max-w-2xl">{note.title}</span>
                        <button
                          className="text-gray-500 hover:text-gray-900"
                          onClick={() => onEditNote(note)}
                        >
                          <svg className="w-5 h-5" strokeWidth="1.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" color="currentColor">
                            <path d="M3 21h18M12.222 5.828L15.05 3 20 7.95l-2.828 2.828m-4.95-4.95l-5.607 5.607a1 1 0 00-.293.707v4.536h4.536a1 1 0 00.707-.293l5.607-5.607m-4.95-4.95l4.95 4.95" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                      </div>
                      <div className="space-x-2">
                        <button
                          className="text-gray-500 hover:text-gray-900"
                          onClick={() => onForceSync(note)}
                        >
                          <svg
                            className={`w-5 h-5 ${note.syncProgress && (note.syncProgress !== -1 || note.syncProgress < 100) ? "animate-spin" : ""}`}
                            strokeWidth="1.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
                          >
                            <path d="M21.168 8A10.003 10.003 0 0012 2C6.815 2 2.55 5.947 2.05 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M17 8h4.4a.6.6 0 00.6-.6V3M2.881 16c1.544 3.532 5.068 6 9.168 6 5.186 0 9.45-3.947 9.951-9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M7.05 16h-4.4a.6.6 0 00-.6.6V21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                        <button
                          className="text-gray-500 hover:text-gray-900"
                          onClick={() => onDeleteNote(note)}
                        >
                          <svg className="w-5 h-5" viewBox="0 0 24 24" strokeWidth="1.5" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M20 9l-1.995 11.346A2 2 0 0116.035 22h-8.07a2 2 0 01-1.97-1.654L4 9M21 6h-5.625M3 6h5.625m0 0V4a2 2 0 012-2h2.75a2 2 0 012 2v2m-6.75 0h6.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className="pt-2 space-x-4 font-normal text-sm">
                      <span>Created { getTimeSinceAsString(new Date(note.createdOn)) } ago</span>
                      <span>Modified { getTimeSinceAsString(new Date(note.modifiedOn)) } ago</span>
                    </div>
                  </div>
                ))
              )
            }
            {
              notes.length === 0 && (
                <div className="h-96 flex m-auto">
                  <div className="m-auto">
                    <p className="text-center text-lg">No notes yet</p>
                    <div className="space-y-2 p-4">
                      <button
                        className="w-auto p-4 flex space-x-2 justify-center bg-gray-100 hover:bg-gray-300 rounded m-auto"
                        onClick={onAddNote}
                      >
                        <span>
                          <svg className="w-6 h-6" strokeWidth="1.5" viewBox="0 0 24 24" fill="none"
                               xmlns="http://www.w3.org/2000/svg">
                            <path d="M6 12h6m6 0h-6m0 0V6m0 6v6" stroke="currentColor" strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"/>
                          </svg>
                        </span>
                        <span>Create one</span>
                      </button>
                      <button
                        className="w-auto p-4 flex space-x-2 justify-center bg-gray-100 hover:bg-gray-300 rounded m-auto"
                        onClick={() => onForceSync()}
                      >
                        <span>
                          <svg className="w-6 h-6" strokeWidth="1.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9.143 3.004L14.857 3m-5.714.004L2 15.004m7.143-12l4.902 9.496m.812-9.5L5.575 21m9.282-18l5.356 9M5.575 21L2 15.004M5.575 21h6.429M2 15.004h10.5M22.666 17.667C22.048 16.097 20.634 15 18.99 15c-1.758 0-3.252 1.255-3.793 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M20.995 17.772H22.4a.6.6 0 00.6-.6V15.55M15.334 20.333C15.952 21.903 17.366 23 19.01 23c1.758 0 3.252-1.255 3.793-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M17.005 20.228H15.6a.6.6 0 00-.6.6v1.622" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </span>
                        <span>Sync with Google</span>
                      </button>
                    </div>
                  </div>
                </div>
              )
            }
          </div>

        </div>
      </div>
    </div>
  );

}