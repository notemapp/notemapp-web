import {useEffect, useState} from "react";
import log from "../core/Logger";
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

  function setLogout() {
    setIsSignedIn(false);
    setToken(null);
    setTokenExpiration(null);
  }

  function requestAuth() {
    if (client) {
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
              setTokenExpiration(new Date().getTime() + response.expires_in * 1000);
              setIsSignedIn(true);
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

    if (client && token === null) {
      log("[INFO] Try silent refresh");
      client.requestAccessToken();
    }

  }, [client]);

  useEffect(() => {
    setIsSignedIn(token !== null && tokenExpiration !== null && tokenExpiration > new Date().getTime());
  })

  return {requestAuth, isSignedIn, signOut};

};

export default useGoogle;