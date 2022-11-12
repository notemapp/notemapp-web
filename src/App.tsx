import './App.css'
import MapPage from "./components/MapPage";

function App() {

  const id = 'my-note-id'; // TODO: fetch id from path

  return (
    <MapPage id={id}/>
  )

}

export default App
