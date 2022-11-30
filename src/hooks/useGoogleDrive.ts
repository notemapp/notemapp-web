import {Token} from "./useGoogle";
import log from "../core/Logger";

interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  kind: string;
  appProperties: any;
}

interface GoogleDriveFileMeta {
  id: string;
  name: string;
  mimeType: string;
  createdOn: Date;
  modifiedOn: Date;
  appProperties: any;
}

export interface GoogleDrive {
  getFilesInAppDataFolder: () => Promise<GoogleDriveFile[]>;
  getFilesByName: (fileName: string) => Promise<GoogleDriveFile[]>;
  getFileByName: (fileName: string) => Promise<GoogleDriveFile|null>;
  getFileContentById: (fileId: string) => Promise<string>;
  getFileMetaById: (fileId: string) => Promise<GoogleDriveFileMeta>;
  deleteFileById: (fileId: string) => Promise<void>;
  deleteFileByName: (fileName: string) => Promise<void>;
  createFile: (fileName: string, content: string, props: object) => Promise<GoogleDriveFile>;
  updateFileById: (fileId: string, fileName: string, content: string) => Promise<GoogleDriveFile>;
  updateFileMetaById: (fileId: string, props: object) => Promise<GoogleDriveFile>
}

const useGoogleDrive = (getToken: () => Promise<Token>) => {

  async function getFilesInAppDataFolder(): Promise<GoogleDriveFile[]> {

    const token = await getToken();
    const response = await fetch(`https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&fields=files`, {
      method: "GET",
      headers: new Headers({Authorization: `Bearer ${token.value}`}),
    });
    const json = await response.json();
    const files = json.files as GoogleDriveFile[];
    log(`Found ${files.length} files in appDataFolder`);

    return files.filter((file) => file.mimeType === "application/json");

  }

  async function getFilesByName(fileName: string): Promise<GoogleDriveFile[]> {

    const token = await getToken();
    const response = await fetch(`https://www.googleapis.com/drive/v3/files?q=name='${fileName}'&spaces=appDataFolder`, {
      method: "GET",
      headers: new Headers({Authorization: `Bearer ${token.value}`}),
    });
    const json = await response.json();
    return json.files as GoogleDriveFile[];

  }

  async function getFileByName(fileName: string): Promise<GoogleDriveFile|null> {

    return await getFilesByName(fileName)
      .then((files) => files.length > 0 ? files[0] : null);

  }

  async function getFileContentById(fileId: string): Promise<string> {

    const token = await getToken();
    const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
      method: "GET",
      headers: new Headers({ Authorization: `Bearer ${token.value}` }),
    });

    return await response.text();

  }

  async function getFileMetaById(fileId: string): Promise<GoogleDriveFileMeta> {

    const token = await getToken();
    const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?fields=id,name,mimeType,createdTime,modifiedTime,appProperties`, {
      method: "GET",
      headers: new Headers({ Authorization: `Bearer ${token.value}` }),
    });
    const json = await response.json();
    return {
      id: json.id,
      name: json.name,
      mimeType: json.mimeType,
      createdOn: new Date(json.createdTime),
      modifiedOn: new Date(json.modifiedTime),
      appProperties: json.appProperties,
    } as GoogleDriveFileMeta;

  }

  async function deleteFileById(fileId: string): Promise<void> {

    const token = await getToken();
    await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
      method: "DELETE",
      headers: new Headers({ Authorization: `Bearer ${token.value}` }),
    });

  }

  async function deleteFileByName(fileName: string): Promise<void> {

    const file = await getFileByName(fileName);
    if (file) {
      await updateFileById(file.id, fileName, "[deleted]", "application/json");
    }

  }

  async function createFile(fileName: string, content: string, props: object, mimeType: string = "application/json"): Promise<GoogleDriveFile> {

    const token = await getToken();
    const metadata = {
      name: fileName,
      mimeType: mimeType,
      parents: ['appDataFolder'],
      appProperties: {...props}
    };
    const form = new FormData();
    form.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
    form.append("file", content);
    const response = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&supportsAllDrives=true", {
      method: "POST",
      headers: new Headers({ Authorization: `Bearer ${token.value}` }),
      body: form,
    });
    const json = await response.json();
    return {
      id: json.id,
      name: json.name,
      mimeType: json.mimeType,
      kind: json.kind,
      appProperties: json.appProperties
    } as GoogleDriveFile;

  }

  async function updateFileById(fileId: string, fileName: string, content: string, mimeType: string = "application/json"): Promise<GoogleDriveFile> {

    const token = await getToken();
    const metadata = {
      name: fileName,
      mimeType: mimeType
    };
    const form = new FormData();
    form.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
    form.append("file", content);
    const response = await fetch(`https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=multipart&supportsAllDrives=true`, {
      method: "PATCH",
      headers: new Headers({ Authorization: `Bearer ${token.value}` }),
      body: form,
    });
    const json = await response.json();
    return {
      id: json.id,
      name: json.name,
      mimeType: json.mimeType,
      kind: json.kind,
      appProperties: json.appProperties
    } as GoogleDriveFile;

  }

  async function updateFileMetaById(fileId: string, props: object): Promise<GoogleDriveFile> {

    const token = await getToken();
    const metadata = {
      appProperties: {...props}
    };
    const form = new FormData();
    form.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
    const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
      method: "PATCH",
      headers: new Headers({ Authorization: `Bearer ${token.value}` }),
      body: form,
    });
    const json = await response.json();
    return {
      id: json.id,
      name: json.name,
      mimeType: json.mimeType,
      kind: json.kind,
      appProperties: json.appProperties
    } as GoogleDriveFile;

  }

  return {
    getFilesByName,
    getFileByName,
    getFileContentById,
    getFileMetaById,
    deleteFileById,
    deleteFileByName,
    createFile,
    updateFileById,
    getFilesInAppDataFolder,
    updateFileMetaById
  } as GoogleDrive;

}

export default useGoogleDrive