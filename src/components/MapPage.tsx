import {useRef} from "react";
import {useParams} from "react-router-dom";
import MapContainer from "./MapContainer";
import Map from "ol/Map";
import VectorSource from "ol/source/Vector";
import MapPageNavigation from "./MapPageNavigation";

export default function MapPage() {

  const noteId = useParams().noteId || "";

  const mapRef = useRef<Map>();
  const featuresSourceRef = useRef<VectorSource>();

  return (
    <>
      <MapPageNavigation
        mapRef={mapRef}
        featuresSourceRef={featuresSourceRef}
      />
      <MapContainer noteId={noteId} mapRef={mapRef} featuresSourceRef={featuresSourceRef} />
    </>
  );

}