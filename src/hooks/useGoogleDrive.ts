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

  function getFilesByName(
    fileName: string,
    onSuccess: (files: GoogleDriveFile[]) => void,
    onError: (error: GoogleDriveError) => void
  ) {

    getToken()
      .then((token) => {
        return fetch(`https://www.googleapis.com/drive/v3/files?q=name='${fileName}'&spaces=appDataFolder`, {
          method: "GET",
          headers: new Headers({ Authorization: `Bearer ${token}` }),
        });
      })
      .then((response: Response) => response.json())
      .then((response: any) => onSuccess(response?.files || []))
      .catch(onError);

  }

  function getFileByName(
    fileName: string,
    onSuccess: (file: GoogleDriveFile) => void,
    onError: (error: GoogleDriveError) => void
  ) {

    getFilesByName(
      fileName,
      (files) => {
        if (files.length > 0) {
          onSuccess(files[0]);
        } else {
          onError({ message: `File '${fileName}' not found` });
        }
      },
      onError
    );

  }

  return {
    getFilesByName,
    getFileByName,

  };

}

export default useGoogleDrive