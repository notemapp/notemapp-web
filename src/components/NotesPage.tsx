import {Note} from "../core/Note";
import {useContext, useEffect, useRef, useState} from "react";
import {StorageContext} from "./StorageContext";
import {del, entries, set} from "idb-keyval";
import {useNavigate} from "react-router-dom";
import log from "../core/Logger";
import {syncLocalNote, syncLocalNotes, syncRemoteNotes} from "../core/controller/GoogleDriveController";
import {GoogleDrive} from "../hooks/useGoogleDrive";

export default function NotesPage(props: {
  google: {
    requestAuth: () => void,
    isSignedIn: boolean,
    signOut: () => void,
    googleDrive: GoogleDrive
  }
}) {

  const {requestAuth, isSignedIn, signOut, googleDrive} = props.google;
  const {deleteFileByName} = googleDrive;

  const storageContext = useContext(StorageContext);
  const [notes, setNotes] = useState<Note[]>([]);
  const titleRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const [isSyncing, setIsSyncing] = useState(false);

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

  const createNote = () => {

    const id = (Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15))
      .slice(0, 8);
    const note: Note = {
      id: id,
      title: titleRef.current?.value || "Untitled note",
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
    note.title = newTitle || "Untitled note";
    set(note.id, note, storageContext?.noteMetaStoreRef.current).then(() => {
      setNotes(notes.map((n) => n.id === note.id ? note : n));
    });
  }

  return (
    <div className="p-4">
      {
        notes.length > 0 &&
        <h1 className="text-2xl py-2 font-bold">My notes</h1>
      }
      <ul className="py-2">
        {notes.map((note) => (
          <li key={note.id} >
            <div className="w-full px-4 py-2 my-1 border border-1 border-black">
              <span className="text-lg font-semibold">{note.title}</span>
              <span className="text-sm text-gray-500 ml-2">SYNC: {note.syncProgress !== -1 ? note.syncProgress + '%' : 'FAIL'}</span>
              <div className="text-sm text-gray-500"> created on {note.createdOn}</div>
              <div className="text-sm text-gray-500"> modified on {note.modifiedOn} </div>
              <div className="flex space-x-4">
                <button onClick={() => navigate(`/map/${note.id}`)}>View</button>
                <button onClick={() => onDeleteNote(note)}>Delete</button>
                <button onClick={() => onEditNote(note)}>Edit</button>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <h1 className="text-2xl py-2 font-bold">Create note</h1>
      <div>
        <label>
          <h2 className="font-semibold">Title</h2>
          <input
            ref={titleRef} type="text" name="title" placeholder="Untitled note"
            className="my-1 border border-1 border-black px-2 py-1"
          />
        </label>
        <button
          onClick={createNote}
          className="my-1 px-2 py-1 border border-1 border-black hover:bg-gray-300"
        >
          Create
        </button>
      </div>
      <h1 className="text-2xl py-2 font-bold">Sign In</h1>
      <div>
        {
          !isSignedIn &&
          <button
            onClick={requestAuth}
            className="my-1 px-2 py-1 border border-1 border-black hover:bg-gray-300"
          >
            Request Google Auth
          </button>
        }
        {
          isSignedIn &&
          <button
            onClick={signOut}
            className="my-1 px-2 py-1 border border-1 border-black hover:bg-gray-300"
          >
            SignOut
          </button>
        }
      </div>
    </div>
  );

}