import {GoogleDrive, GoogleDriveFile} from "./useGoogleDrive";
import {Note} from "../core/Note";
import {useState} from "react";
import useStorage from "./useStorage";
import log from "../core/Logger";
import {GeoJSON} from "ol/format";
import {NotePrefs} from "../components/StorageContext";

export interface SyncStatus {
  id: string,
  status: 'DONE'|'FAIL'|'SYNCING'
}

const useGoogleSync = (googleDrive: GoogleDrive, onNewNotes: () => void) => {

  const storage = useStorage();
  const [syncStatus, setSyncStatus] = useState<SyncStatus[]>([]);

  async function syncNote(note: Note) {

    const file = await googleDrive.getFileByName(`${note.id}.json`);

    try {
      setSyncStatus((currentSyncStatus) => [...currentSyncStatus, {id: note.id, status: 'SYNCING'}])
      if (file) {
        await syncWithRemote(file, note);
      } else {
        await syncNewNote(note);
      }
    } catch (e) {
      log("Failed syncing note:", e, note);
      setSyncStatus((currentSyncStatus) => [
        ...currentSyncStatus.filter(s => s.id !== note.id), {id: note.id, status: 'FAIL'}
      ]);
    }

  }

  async function syncWithRemote(file: GoogleDriveFile, note: Note) {

    log(`Found note ${note.id} on drive`);
    const fileMeta = await googleDrive.getFileMetaById(file.id);
    const remoteModifiedOn = fileMeta.modifiedOn.getTime();
    const localModifiedOn = new Date(note.modifiedOn).getTime();

    if (remoteModifiedOn > localModifiedOn) {

      log(`Note ${note.id} is more recent on drive`);
      const remoteNote = await googleDrive.getFileContentById(file.id);

      if (remoteNote === '[deleted]') {
        log(`Note ${note.id} was flagged as deleted on drive, deleting local data`);
        await storage.deleteNoteData(note.id);
      } else {

        log(`Downloading note ${note.id} from drive`);
        await storage.updateNoteContent(note.id, remoteNote);
        await storage.updateNoteMeta(note.id, {...note, modifiedOn: new Date(remoteModifiedOn).toISOString()});

        const notePropsFile = await googleDrive.getFileByName(`${note.id}.props`);
        if (notePropsFile?.id) {
          const noteProps = JSON.parse(await googleDrive.getFileContentById(notePropsFile!.id));
          const prefs = storage.getNotePrefs(note.id);
          const meta = storage.getNoteMeta(note.id);
          await storage.updateNotePrefs(note.id, {...prefs, ...(noteProps as NotePrefs)});
          await storage.updateNoteMeta(note.id, {...meta, ...(noteProps as Note)});
        }

      }

    } else {

      log(`Note ${note.id} is more recent on local, uploading`);
      const localNote = await storage.getNoteContent(note.id);
      const localNoteProps = await storage.getNoteProps(note.id);
      await googleDrive.updateFileById(file.id, `${note.id}.json`, localNote!);
      const remoteNoteProps = await googleDrive.getFileByName(`${note.id}.props`);
      await googleDrive.updateFileById(remoteNoteProps!.id, `${note.id}.props`, JSON.stringify(localNoteProps));

    }

    setSyncStatus((currentSyncStatus) => [
      ...currentSyncStatus.filter(s => s.id !== note.id), {id: note.id, status: 'DONE'}
    ]);

  }

  async function syncNewNote(note: Note) {

    log(`Note ${note.id} does not exist on drive, uploading`);

    const localNoteContent = await storage.getNoteContent(note.id);
    const localNoteProps = await storage.getNoteProps(note.id);
    await googleDrive.createFile(`${note.id}.json`, localNoteContent!, undefined);
    await googleDrive.createFile(`${note.id}.props`, JSON.stringify(localNoteProps), undefined);

    setSyncStatus((currentSyncStatus) => [
      ...currentSyncStatus.filter(s => s.id !== note.id), {id: note.id, status: 'DONE'}
    ]);

  }

  async function syncNewNotes() {

    const files = await googleDrive.getFilesInAppDataFolder();

    const localNotesIds = await storage.getNotesIds();
    const remoteNotesIds = files
      .filter(file => file.name.endsWith(".json"))
      .map(file => file.name.replace(".json", ""));

    const missingNotesOnLocal = remoteNotesIds.filter(id => !localNotesIds.includes(id));
    log(`Found ${missingNotesOnLocal.length} notes not on local`, missingNotesOnLocal);

    for (const remoteNoteId of missingNotesOnLocal) {

      setSyncStatus((currentSyncStatus) => [
        ...currentSyncStatus.filter(s => s.id !== remoteNoteId), {id: remoteNoteId, status: 'SYNCING'}
      ]);

      const remoteNote = await googleDrive.getFileByName(`${remoteNoteId}.json`);
      const remoteNoteContent = await googleDrive.getFileContentById(remoteNote!.id);
      const remoteNotePropsFile = await googleDrive.getFileByName(`${remoteNoteId}.props`);

      if (!remoteNotePropsFile?.id) continue;
      const remoteNoteProps = JSON.parse(await googleDrive.getFileContentById(remoteNotePropsFile!.id));

      try {
        const noteMeta: Note = {
          id: remoteNoteId,
          title: remoteNoteProps.title || "Untitled note",
          createdOn: new Date(remoteNoteProps.createdOn).toISOString(),
          modifiedOn: new Date(remoteNoteProps.modifiedOn).toISOString(),
          syncProgress: 100   // TODO: deprecated field
        };
        const notePrefs: NotePrefs = {
          layer: remoteNoteProps.appProperties?.layer || 0,
          center: remoteNoteProps.appProperties?.center || [-11000000, 4600000],
          zoom: remoteNoteProps.appProperties?.zoom || 4,
          rotation: remoteNoteProps.appProperties?.rotation || 0
        }

        await storage.setNoteContent(remoteNoteId, remoteNoteContent);
        await storage.setNoteMeta(remoteNoteId, noteMeta);
        await storage.setNotePrefs(remoteNoteId, notePrefs);

        setSyncStatus((currentSyncStatus) => [
          ...currentSyncStatus.filter(s => s.id !== remoteNoteId), {id: remoteNoteId, status: 'DONE'}
        ]);

      } catch (e) {
        log("Ignoring note on remote with invalid content:", remoteNoteId);
        setSyncStatus((currentSyncStatus) => [
          ...currentSyncStatus.filter(s => s.id !== remoteNoteId), {id: remoteNoteId, status: 'FAIL'}
        ]);
      }

    }

    if (missingNotesOnLocal.length > 0) onNewNotes();

  }

  async function syncAllNotes() {

    const localNotes = await storage.getNotes();
    for (const localNote of localNotes) {
      await syncNote(localNote);
    }

    await syncNewNotes();

  }

  return {syncStatus, syncNote, syncAllNotes};

};

export default useGoogleSync;
