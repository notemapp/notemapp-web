import {createBrowserRouter, RouterProvider} from "react-router-dom";
import './App.css'
import log from "./core/Logger";
import MapPage from "./components/MapPage";
import HomePage from "./components/HomePage";
import {StorageContextProvider} from "./components/StorageContext";

function App() {

  const router = createBrowserRouter([
    {
      path: "/",
      element: <HomePage />
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
    .catch((e) => log('[Service Worker] Registration failed:', e));
} else {
  log('[Service Worker] This browser does not support Service Workers');
}

export default App;
