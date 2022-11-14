import MapContainer from "./MapContainer";
import {useParams} from "react-router-dom";
import Navbar from "./Navbar";

export default function MapPage() {

  const noteId = useParams().noteId || "";

  return (
    <>
      <Navbar />
      <MapContainer noteId={noteId}/>
    </>
  );

}