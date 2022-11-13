import MapContainer from "./MapContainer";
import {useParams} from "react-router-dom";

export default function MapPage() {

  const noteId = useParams().noteId || "";

  return (
    <MapContainer noteId={noteId}/>
  );

}