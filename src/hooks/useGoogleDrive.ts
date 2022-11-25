interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  kind: string;
  appProperties: any;
}

interface GoogleDriveError {
  message: string;
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
  getFilesByName: (fileName: string) => Promise<GoogleDriveFile[]>;
  getFileByName: (fileName: string) => Promise<GoogleDriveFile|null>;
  getFileContentById: (fileId: string) => Promise<string>;
  getFileMetaById: (fileId: string) => Promise<GoogleDriveFileMeta>;
  deleteFileById: (fileId: string) => Promise<void>;
  deleteFileByName: (fileName: string) => Promise<void>;
  createFile: (fileName: string, content: string, title: string) => Promise<GoogleDriveFile>;
  updateFileById: (fileId: string, fileName: string, content: string, mimeType: string) => Promise<GoogleDriveFile>;
  getFilesInAppDataFolder: () => Promise<GoogleDriveFile[]>;
}

const useGoogleDrive = (getToken: () => Promise<string>) => {

  async function getFilesInAppDataFolder(): Promise<GoogleDriveFile[]> {

    try {

      const token = await getToken();
      const response = await fetch(`https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&fields=files`, {
        method: "GET",
        headers: new Headers({Authorization: `Bearer ${token}`}),
      });
      const json = await response.json();
      const files = json.files as GoogleDriveFile[];

      console.log("[INFO] Google Drive files in appdata folder:", files);
      return files.filter((file) => file.mimeType === "application/json");

    } catch (error) {
      console.log(error);
      throw error;
    }

  }

  async function getFilesByName(fileName: string): Promise<GoogleDriveFile[]> {

    try {

      const token = await getToken();
      const response = await fetch(`https://www.googleapis.com/drive/v3/files?q=name='${fileName}'&spaces=appDataFolder`, {
        method: "GET",
        headers: new Headers({Authorization: `Bearer ${token}`}),
      });
      const json = await response.json();
      return json.files as GoogleDriveFile[];

    } catch (error) {
      console.log(error);
      throw error;
    }

  }

  async function getFileByName(fileName: string): Promise<GoogleDriveFile|null> {

    return await getFilesByName(fileName)
      .then((files) => {
        return files.length > 0 ? files[0] : null;
      });

  }

  async function getFileContentById(fileId: string): Promise<string> {

    try {
      const token = await getToken();
      const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
        method: "GET",
        headers: new Headers({ Authorization: `Bearer ${token}` }),
      });
      return await response.text();
    } catch (error) {
      console.log(error);
      throw error;
    }

  }

  async function getFileMetaById(fileId: string): Promise<GoogleDriveFileMeta> {

    try {
      const token = await getToken();
      const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?fields=id,name,mimeType,createdTime,modifiedTime,appProperties`, {
        method: "GET",
        headers: new Headers({ Authorization: `Bearer ${token}` }),
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
    } catch (error) {
      console.log(error);
      throw error;
    }

  }

  async function deleteFileById(fileId: string): Promise<void> {

    try {
      console.log("[DELETE] Requesting delete file with id:", fileId);
      const token = await getToken();
      await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
        method: "DELETE",
        headers: new Headers({ Authorization: `Bearer ${token}` }),
      });
    } catch (error) {
      console.log(error);
      throw error;
    }

  }

  async function deleteFileByName(fileName: string): Promise<void> {

    try {
      const file = await getFileByName(fileName);
      if (file) {
        //await deleteFileById(file.id);
        await updateFileById(file.id, fileName, "[deleted]", "application/json");
      }
    } catch (error) {
      console.log(error);
      throw error;
    }

  }

  async function createFile(
    fileName: string,
    content: string,
    title: string = "Untitled note",
    mimeType: string = "application/json",
  ): Promise<GoogleDriveFile> {

    try {

      const token = await getToken();
      const metadata = {
        name: fileName,
        mimeType: mimeType,
        parents: ['appDataFolder'],
        appProperties: {
          title: title
        }
      };
      const form = new FormData();
      form.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
      form.append("file", content);
      const response = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&supportsAllDrives=true", {
        method: "POST",
        headers: new Headers({ Authorization: `Bearer ${token}` }),
        body: form,
      });
      const json = await response.json();
      return {
        id: json.id,
        name: json.name,
        mimeType: json.mimeType,
        kind: json.kind,
      } as GoogleDriveFile;

    } catch (error) {
      console.log(error);
      throw error;
    }

  }

  async function updateFileById(
    fileId: string,
    fileName: string,
    content: string,
    mimeType: string = "application/json"
  ): Promise<GoogleDriveFile> {

    try {

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
        headers: new Headers({ Authorization: `Bearer ${token}` }),
        body: form,
      });
      const json = await response.json();
      return {
        id: json.id,
        name: json.name,
        mimeType: json.mimeType,
        kind: json.kind,
      } as GoogleDriveFile;

    } catch (error) {
      console.log(error);
      throw error;
    }

  }

  async function updateFileMetaById(
    fileId: string,
    title: string,
  ): Promise<GoogleDriveFile> {

    try {

      const token = await getToken();
      const metadata = {
        appProperties: {
          title: title
        }
      };
      const form = new FormData();
      form.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
      const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
        method: "PATCH",
        headers: new Headers({ Authorization: `Bearer ${token}` }),
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

    } catch (error) {
      console.log(error);
      throw error;
    }

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