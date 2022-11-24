interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  kind: string;
}

interface GoogleDriveError {
  message: string;
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

  return {
    getFilesByName,
    getFileByName,

  };

}

export default useGoogleDrive