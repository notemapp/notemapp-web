import {Note} from "../Note";
import {GoogleDrive} from "../../hooks/useGoogleDrive";
import {StorageContextInterface} from "../../components/StorageContext";
import {get, update} from "idb-keyval";

async function syncLocalNote(googleDrive: GoogleDrive, note: Note, storageContext: StorageContextInterface,
                             onSyncProgress: (noteId: string, progress: number) => void) {

  try {

    onSyncProgress(note.id, 0);
    console.log("[SYNC] Syncing note", note);

    const file = await googleDrive.getFileByName(note.id + ".json");
    if (file) {
      console.log("[SYNC] Note exists on GDrive", file);
      const fileMeta = await googleDrive.getFileMetaById(file.id);
      const remoteModifiedOn = fileMeta.modifiedOn.getTime();
      const localModifiedOn = new Date(note.modifiedOn).getTime();
      if (remoteModifiedOn > localModifiedOn) {
        console.log("[SYNC] Remote note is more recent, downloading", note.id);
        const remoteNote = await googleDrive.getFileContentById(file.id);
        await update(note.id, (oldValue) => JSON.parse(remoteNote), storageContext.noteStoreRef.current);
        console.log("[SYNC] Note downloaded", note.id);
      } else {
        console.log("[SYNC] Local note is more recent, uploading", note.id);
        const noteContent = await get(note.id, storageContext.noteStoreRef.current);
        await googleDrive.updateFileById(file.id, JSON.stringify(noteContent));
        console.log("[SYNC] Note uploaded", note.id);
      }
    } else {
      console.log("[SYNC] Note does not exist on GDrive, uploading", note.id);
      const noteContent = await get(note.id, storageContext.noteStoreRef.current);
      await googleDrive.createFile(note.id + ".json", JSON.stringify(noteContent));
      console.log("[SYNC] Note uploaded", note.id);
    }

    onSyncProgress(note.id, 100);

  } catch (error) {
    console.log(error);
    onSyncProgress(note.id, -1);
  }

}

async function syncLocalNotes(
  googleDrive: GoogleDrive,
  notes: Note[],
  storageContext: StorageContextInterface,
  onSyncProgress: (noteId: string, progress: number) => void
) {

  for (const note of notes) {
    await syncLocalNote(googleDrive, note, storageContext, onSyncProgress);
  }

}

export {syncLocalNotes};