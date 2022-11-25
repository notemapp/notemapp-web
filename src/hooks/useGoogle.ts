import {useEffect, useState} from "react";
import log from "../core/Logger";
import useGoogleDrive, {GoogleDrive} from "./useGoogleDrive";
import TokenClient = google.accounts.oauth2.TokenClient;

const useGoogle = () => {

  const SCOPES = [
    'https://www.googleapis.com/auth/drive.appdata',
    'https://www.googleapis.com/auth/drive.file'
  ];
  const [client, setClient] = useState<TokenClient|null>(null);
  const [token, setToken] = useState<string|null>(null);
  const [tokenExpiration, setTokenExpiration] = useState<number|null>(null);
  const [isSignedIn, setIsSignedIn] = useState<boolean>(false);

  const googleDrive: GoogleDrive = useGoogleDrive(getToken);

  function setLogout() {
    setIsSignedIn(false);
    setToken(null);
    setTokenExpiration(null);
    localStorage.removeItem('googleTokenValue');
    localStorage.removeItem('googleTokenExpiration');
  }

  async function getToken(): Promise<string> {

    try {
      if (isSignedIn && token) {
        return Promise.resolve(token);
      } else {
        // Workaround :(
        requestAuth();
        return new Promise<string>((resolve) => {
          const interval = setInterval(() => {
            if (token) {
              clearInterval(interval);
              resolve(token);
            }
          }, 100);
        });
      }
    } catch (error) {
      console.error(error);
      throw error;
    }

  }

  function requestAuth() {

    // retrieve token from local storage
    const token = localStorage.getItem('googleTokenValue');
    const tokenExpiration = localStorage.getItem('googleTokenExpiration');

    let usingLocalStorage = false;
    if (token && tokenExpiration) {
      if (Date.now() < Number(tokenExpiration)) {
        console.log("[TOKEN] Token is still valid, using it");
        setToken(token);
        setTokenExpiration(Number(tokenExpiration));
        usingLocalStorage = true;
      } else {
        console.log("[INFO] Local storage token expired");
        localStorage.removeItem('googleTokenValue');
        localStorage.removeItem('googleTokenExpiration');
      }
    } else {
      console.log("[INFO] Local storage token not found");
    }

    if (client && !usingLocalStorage) {
      console.log("[INFO] Requesting auth", isSignedIn);
      client.requestAccessToken();
    } else {
      log("[ERROR] Google client not ready");
    }

  }

  function signOut() {
    if (client && token) {
      google.accounts.oauth2.revoke(token, () => {
        setLogout();
        log("[INFO] Google sign out");
      });
    } else {
      log("[ERROR] Google client not ready");
    }
  }

  useEffect(() => {

    function onGisLoad() {

      const client = google.accounts.oauth2.initTokenClient({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        scope: SCOPES.join(' '),
        prompt: '',
        callback: (response: any) => {
          log("[INFO] Google auth response:", response);
          if (response && response.access_token) {
            if (google.accounts.oauth2.hasGrantedAllScopes(response, SCOPES[0], ...SCOPES.slice(1))) {
              setToken(response.access_token);
              let expiration = new Date().getTime() + response.expires_in * 1000;
              setTokenExpiration(expiration);

              // save in local storage
              console.log("Saving token in local storage");
              localStorage.setItem('googleTokenValue', response.access_token);
              localStorage.setItem('googleTokenExpiration', expiration.toString());

              log("[INFO] Google auth success");
            } else {
              log("[ERROR] Missing at least one scope auth");
            }
          } else {
            log("[ERROR] No access token");
          }
        },
      });

      setClient(client);

    }

    const gisScript = document.createElement('script');

    gisScript.src = "https://accounts.google.com/gsi/client";
    gisScript.async = true;
    gisScript.defer = true;
    gisScript.onload = onGisLoad;

    document.body.appendChild(gisScript);

    return () => {
      document.body.removeChild(gisScript);
    };

  }, []);

  useEffect(() => {

    const hasPreviouslySignedIn = localStorage.getItem('hasPreviouslySignedIn') !== null;
    if (client && token === null && hasPreviouslySignedIn) {
      log("[INFO] Try silent refresh");
      requestAuth();
    }

  }, [client]);

  useEffect(() => {
    setIsSignedIn(token !== null && tokenExpiration !== null && tokenExpiration > new Date().getTime());
  }, [token, tokenExpiration]);

  return {
    requestAuth,
    isSignedIn,
    signOut,
    googleDrive
  };

};

export default useGoogle;