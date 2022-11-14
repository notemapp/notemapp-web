import {createBrowserRouter, RouterProvider} from "react-router-dom";
import './App.css'
import log from "./core/Logger";
import MapPage from "./components/MapPage";
import NotesPage from "./components/NotesPage";
import {StorageContextProvider} from "./components/StorageContext";

const router = createBrowserRouter([
  {
    path: "/",
    element: <NotesPage />
  },
  {
    path: "/map/:noteId",
    element: <MapPage />
  }
]);

function App() {

  return (
    <StorageContextProvider>
      <RouterProvider router={router}/>
    </StorageContextProvider>
  )

}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('%PUBLIC_URL%/service-worker.js')
    .then(() => log('[Service Worker] Registered successfully'))
    .catch(() => log('[Service Worker] Registration failed'));
} else {
  console.log('[Service Worker] This browser does not support Service Workers');
}

export default App
