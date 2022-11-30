import {useEffect, useState} from "react";
import log from "../core/Logger";
import useGoogleDrive, {GoogleDrive} from "./useGoogleDrive";

export interface Token {
  value: string;
  expiration: number
}

const GOOGLE_SIGN_IN_TOKEN = 'googleSignInToken';

const useGoogle = () => {

  const SCOPES = [
    'https://www.googleapis.com/auth/drive.appdata',
    'https://www.googleapis.com/auth/drive.file'
  ];

  const [client, setClient] = useState<google.accounts.oauth2.TokenClient|null>(null);
  const [token, setToken] = useState<Token|null>(null);

  const [isSignedIn, setSignedIn] = useState<boolean>(false);

  const googleDrive: GoogleDrive = useGoogleDrive(getToken);

  function revokeSignIn() {
    setSignedIn(false);
    setToken(null);
    localStorage.removeItem(GOOGLE_SIGN_IN_TOKEN);
  }

  async function getToken(): Promise<Token> {
    if (isSignedIn && token) {
      return Promise.resolve(token);
    } else {
      requestSignIn();
      return new Promise<Token>((resolve) => {
        const interval = setInterval(() => {
          // Wait for the token to be fetched:
          if (token) {
            clearInterval(interval);
            resolve(token);
          }
        }, 100);
      });
    }
  }

  function requestSignIn() {

    let token: Token|null = null;
    const tokenFromLocalStorage: string|null = localStorage.getItem(GOOGLE_SIGN_IN_TOKEN);

    if (tokenFromLocalStorage) {
      const parsedToken = JSON.parse(tokenFromLocalStorage) as Token;
      const parsedTokenExpiration = Number(parsedToken.expiration);
      if (Date.now() < parsedTokenExpiration) {
        token = {
          value: parsedToken.value,
          expiration: parsedTokenExpiration
        };
        setToken(token);
        log("Using token from local storage");
      } else {
        log("Token in local storage has expired");
      }
    }

    if (client && !token) {
      log("Requesting new access token");
      client.requestAccessToken();
    }

  }

  function signIn() {
    requestSignIn();
  }

  function signOut() {
    if (client && token) {
      google.accounts.oauth2.revoke(token.value, () => revokeSignIn());
    }
  }

  useEffect(() => {

    function onGisLoad() {

      const client = google.accounts.oauth2.initTokenClient({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        scope: SCOPES.join(' '),
        prompt: '',
        callback: (response: any) => {
          if (response && response.access_token) {
            if (google.accounts.oauth2.hasGrantedAllScopes(response, SCOPES[0], ...SCOPES.slice(1))) {
              const expiration = new Date().getTime() + response.expires_in * 1000;
              const newToken = {
                value: response.access_token,
                expiration: expiration
              };
              setToken(newToken);
              log("Saving token in local storage");
              localStorage.setItem(GOOGLE_SIGN_IN_TOKEN, JSON.stringify(newToken));
            } else {
              log("Missing at least one grant from user, scopes:", SCOPES);
            }
          } else {
            log("No access token in response for auth request:", response);
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
    const hasPreviouslySignedIn = localStorage.getItem(GOOGLE_SIGN_IN_TOKEN) !== null;
    if (client && token === null && hasPreviouslySignedIn) {
      requestSignIn();
    }
  }, [client]);

  useEffect(() => {
    setSignedIn(token !== null && token.value !== null && token.expiration > new Date().getTime());
  }, [token]);

  return {
    signIn,
    signOut,
    isSignedIn,
    googleDrive
  };

};

export default useGoogle;