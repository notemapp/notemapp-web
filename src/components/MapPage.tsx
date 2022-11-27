import {useParams} from "react-router-dom";
import MapContainer from "./MapContainer";
import MapPageNavigation from "./MapPageNavigation";
import useMap from "../hooks/useMap";

export default function MapPage() {

  const noteId = useParams().noteId!;

  const {mapRef, sourcesRef, layersRef, popupRef} = useMap(noteId);

  return (
    <>
      <MapPageNavigation
        noteId={noteId}
        mapRef={mapRef.mapRef}
        featuresSourceRef={sourcesRef.featuresSourceRef}
      />
      <MapContainer
        noteId={noteId}
        mapRef={mapRef}
        sourcesRef={sourcesRef}
        layersRef={layersRef}
        popupRef={popupRef}
      />
    </>
  );

}