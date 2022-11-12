import './App.css'
import MapPage from "./components/MapPage";
import log from "./core/Logger";

function App() {

  const id = 'my-note-id'; // TODO: fetch id from path

  return (
    <MapPage id={id}/>
  )

}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('./service-worker.js')
    .then(() => log('Service Worker Registered'))
    .catch(() => log('Failed Service Worker Registration'));
} else {
  console.log('This browser does not support Service Workers');
}

export default App
