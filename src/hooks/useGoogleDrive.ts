interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  kind: string;
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
}

export interface GoogleDrive {
  getFilesByName: (fileName: string) => Promise<GoogleDriveFile[]>;
  getFileByName: (fileName: string) => Promise<GoogleDriveFile|null>;
  getFileContentById: (fileId: string) => Promise<string>;
  getFileMetaById: (fileId: string) => Promise<GoogleDriveFileMeta>;
  deleteFileById: (fileId: string) => Promise<void>;
  createFile: (fileName: string, content: string) => Promise<GoogleDriveFile>;
  updateFileById: (fileId: string, content: string) => Promise<GoogleDriveFile>;
}

const useGoogleDrive = (getToken: () => Promise<string>) => {

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
      const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?fields=id,name,mimeType,createdTime,modifiedTime`, {
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
      } as GoogleDriveFileMeta;
    } catch (error) {
      console.log(error);
      throw error;
    }

  }

  async function deleteFileById(fileId: string): Promise<void> {

    try {
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

  async function createFile(
    fileName: string,
    content: string,
    mimeType: string = "application/json"
  ): Promise<GoogleDriveFile> {

    try {

      const token = await getToken();
      const metadata = {
        name: fileName,
        mimeType: mimeType,
        parents: ['appDataFolder']
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

  return {
    getFilesByName,
    getFileByName,
    getFileContentById,
    getFileMetaById,
    deleteFileById,
    createFile,
    updateFileById
  } as GoogleDrive;

}

export default useGoogleDrive