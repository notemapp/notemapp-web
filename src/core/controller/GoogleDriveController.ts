import {Note} from "../Note";
import {GoogleDrive} from "../../hooks/useGoogleDrive";
import {StorageContextInterface} from "../../components/StorageContext";
import {del, get, keys, set, update} from "idb-keyval";
import {GeoJSON} from "ol/format";

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

        if (remoteNote !== '[deleted]') {
          await update(note.id, (oldValue) => JSON.parse(remoteNote), storageContext.noteStoreRef.current);
          await update(note.id, (oldValue) => {
            return {...oldValue, modifiedOn: new Date(remoteModifiedOn).toISOString()}
          }, storageContext.noteMetaStoreRef.current);
          console.log("[SYNC] Note downloaded", note.id);
        } else {
          console.log("[SYNC] Note deleted on remote, deleting local", note.id);
          await del(note.id, storageContext.noteStoreRef.current);
          await del(note.id, storageContext.noteMetaStoreRef.current);
          await del(note.id, storageContext.notePrefsStoreRef.current);
        }

      } else {
        console.log("[SYNC] Local note is more recent, uploading", note.id);
        const noteContent = await get(note.id, storageContext.noteStoreRef.current);
        await googleDrive.updateFileById(file.id, note.id + '.json', JSON.stringify(noteContent));
        console.log("[SYNC] Note uploaded", note.id);
      }
    } else {
      console.log("[SYNC] Note does not exist on GDrive, uploading", note.id);
      const noteContent = await get(note.id, storageContext.noteStoreRef.current);
      await googleDrive.createFile(note.id + ".json", JSON.stringify(noteContent), {title: note.title});
      console.log("[SYNC] Note uploaded", note.id);
    }

    onSyncProgress(note.id, 100);

  } catch (error) {
    console.log(error);
    onSyncProgress(note.id, -1);
  }

}

/**
 * Create local notes that exist only on drive
 */
async function syncRemoteNotes(
  googleDrive: GoogleDrive,
  notes: Note[],
  storageContext: StorageContextInterface,
  onAddNote: (note: Note) => void,
) {

  try {

    const files = await googleDrive.getFilesInAppDataFolder();
    let localNotesIds = await keys<string>(storageContext.noteMetaStoreRef.current);
    const remoteNotes = files
      .filter((file) => file.name.endsWith(".json"))
      .filter((file) => !localNotesIds.includes(file.name.replace(".json", "")));

    console.log("[SYNC] Remote notes not on local:", remoteNotes);

    for (const remoteNote of remoteNotes) {
      const noteId = remoteNote.name.replace(".json", "");
      const noteContent = await googleDrive.getFileContentById(remoteNote.id);
      const noteMeta = await googleDrive.getFileMetaById(remoteNote.id);
      try {
        const noteJson = JSON.parse(noteContent);
        const noteFeatures = new GeoJSON().readFeatures(noteJson);
        console.log("[SYNC-remote] Creating new local note meta with features", noteId, noteFeatures);
        // TODO: propagate also note title and previous view
        const note: Note = {
          id: noteId,
          title: noteMeta.appProperties?.title || "Untitled note",
          createdOn: new Date(noteMeta.createdOn).toISOString(),
          modifiedOn: new Date(noteMeta.modifiedOn).toISOString(),
          syncProgress: 100,
        };
        set(noteId, note, storageContext?.noteMetaStoreRef.current);
        set(noteId, new GeoJSON().writeFeatures(noteFeatures), storageContext?.noteStoreRef.current);
        onAddNote(note);
      } catch (error) {
        console.log("[SYNC-remote] Ignoring note with invalid content:", noteId);
        continue;
      }
    }

    // remove local notes that do not exist on drive

    const remoteNotesIds = files.filter((file) => file.name.endsWith(".json")).map((file) => file.name.replace(".json", ""));
    const localNotesToDelete = localNotesIds.filter((noteId) => !remoteNotesIds.includes(noteId));
    console.log("[SYNC] Local notes to delete:", localNotesToDelete);
    for (const noteId of localNotesToDelete) {
      console.log("[SYNC] Deleting local note", noteId);
      await del(noteId, storageContext.noteStoreRef.current);
      await del(noteId, storageContext.noteMetaStoreRef.current);
      await del(noteId, storageContext.notePrefsStoreRef.current);
    }

  } catch (error) {
    console.log(error);
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

  return Promise.resolve();

}

export {syncLocalNotes, syncLocalNote, syncRemoteNotes};