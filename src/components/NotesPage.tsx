import {Note} from "../core/Note";
import {useContext, useEffect, useRef, useState} from "react";
import {StorageContext} from "./StorageContext";
import {entries, set} from "idb-keyval";
import {useNavigate} from "react-router-dom";

export default function NotesPage() {

  const storageContext = useContext(StorageContext);
  const [notes, setNotes] = useState<Note[]>([]);
  const titleRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    entries(storageContext?.noteMetaStoreRef.current).then((entries) => {
      setNotes(entries.map((entry) => entry[1]));
    });
  }, []);

  const createNote = () => {

    const id = (Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15))
      .slice(0, 8);
    const note: Note = {
      id: id,
      title: titleRef.current?.value || "Untitled note",
      createdOn: new Date().toISOString(),
      modifiedOn: new Date().toISOString(),
    }
    set(id, note, storageContext?.noteMetaStoreRef.current).then(() => navigate(`/map/${id}`));

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
            <button onClick={() => navigate(`/map/${note.id}`)} className="w-full px-4 py-2 my-1 border border-1 border-black hover:bg-gray-300">
              <span className="text-lg font-semibold">{note.title}</span>
              <div className="text-sm text-gray-500"> created on {note.createdOn}</div>
              <div className="text-sm text-gray-500"> modified on {note.modifiedOn} </div>
            </button>
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
    </div>
  );

}