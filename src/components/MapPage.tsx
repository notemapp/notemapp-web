import MapContainer from "./MapContainer";
import {useParams} from "react-router-dom";
import Navbar from "./Navbar";
import {useRef, useState} from "react";
import MapPageDrawer from "./MapPageDrawer";
import Map from "ol/Map";
import {exportAsImage} from "../core/controller/MapController";
import {GeoJSON} from "ol/format";
import VectorSource from "ol/source/Vector";

export default function MapPage() {

  const noteId = useParams().noteId || "";

  const mapRef = useRef<Map>();
  const featuresSourceRef = useRef<VectorSource>();

  const [isOpen, setOpen] = useState(false);

  const onOpenDrawer = () => {
    setOpen(true);
  }

  const onSaveAsImageClick = () => {
    if (mapRef.current) {
      exportAsImage(mapRef.current);
    }
  }

  const onImportClick = async () => {
    if (featuresSourceRef.current) {
      const [fileHandle] = await window.showOpenFilePicker();
      const file = await fileHandle.getFile();
      const text = await file.text();
      try {
        const features = new GeoJSON().readFeatures(text);
          featuresSourceRef.current.addFeatures(features);
      } catch (e) {
        alert('Invalid GeoJSON');
      }
    }
  }

  const onExportClick = async () => {
    if (featuresSourceRef.current) {
      const features = featuresSourceRef.current.getFeatures();
      const text = new GeoJSON().writeFeatures(features);
      const fileHandle = await window.showSaveFilePicker({
        types: [
          {
            description: 'GeoJSON',
            accept: {
              'application/JSON': ['.json'],
            },
          },
        ],
      });
      const writable = await fileHandle.createWritable();
      await writable.write(text);
      await writable.close();
    }
  }

  return (
    <>
      <Navbar onOpenDrawer={onOpenDrawer} />
      <MapContainer noteId={noteId} mapRef={mapRef} featuresSourceRef={featuresSourceRef} />
      <MapPageDrawer
        isOpen={isOpen}
        setOpen={setOpen}
        onSaveAsImageClick={onSaveAsImageClick}
        onImportClick={onImportClick}
        onExportClick={onExportClick}
      />
    </>
  );

}