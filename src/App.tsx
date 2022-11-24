import {createBrowserRouter, RouterProvider} from "react-router-dom";
import './App.css'
import log from "./core/Logger";
import MapPage from "./components/MapPage";
import NotesPage from "./components/NotesPage";
import {StorageContextProvider} from "./components/StorageContext";
import useGoogle from "./hooks/useGoogle";

function App() {

  const google = useGoogle();

  const router = createBrowserRouter([
    {
      path: "/",
      element: <NotesPage google={google} />
    },
    {
      path: "/map/:noteId",
      element: <MapPage />
    }
  ]);

  return (
    <StorageContextProvider>
      <RouterProvider router={router}/>
    </StorageContextProvider>
  )

}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/service-worker.js')
    .then(() => log('[Service Worker] Registered successfully'))
    .catch((e) => log('[Service Worker] Registration failed', e));
} else {
  console.log('[Service Worker] This browser does not support Service Workers');
}

export default App
