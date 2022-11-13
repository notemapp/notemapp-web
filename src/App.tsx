import './App.css'
import MapPage from "./components/MapPage";
import log from "./core/Logger";
import {StorageContextProvider} from "./components/StorageContext";

function App() {

  const id = 'my-note-id'; // TODO: fetch id from path

  return (
    <StorageContextProvider>
      <MapPage id={id}/>
    </StorageContextProvider>
  )

}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('./service-worker.js')
    .then(() => log('[Service Worker] Registered successfully'))
    .catch(() => log('[Service Worker] Registration failed'));
} else {
  console.log('[Service Worker] This browser does not support Service Workers');
}

export default App
