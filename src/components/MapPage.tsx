import MapContainer from "./MapContainer";
import {useParams} from "react-router-dom";
import Navbar from "./Navbar";
import {useRef, useState} from "react";
import MapPageDrawer from "./MapPageDrawer";
import Map from "ol/Map";
import {exportAsImage} from "../core/controller/MapController";

export default function MapPage() {

  const noteId = useParams().noteId || "";

  const mapRef = useRef<Map>();
  const [isOpen, setOpen] = useState(false);

  const onOpenDrawer = () => {
    setOpen(true);
  }

  const onSaveAsImageClick = () => {
    if (mapRef.current) {
      exportAsImage(mapRef.current);
    }
  }

  return (
    <>
      <Navbar onOpenDrawer={onOpenDrawer} />
      <MapContainer noteId={noteId} mapRef={mapRef} />
      <MapPageDrawer isOpen={isOpen} setOpen={setOpen} onSaveAsImageClick={onSaveAsImageClick} />
    </>
  );

}