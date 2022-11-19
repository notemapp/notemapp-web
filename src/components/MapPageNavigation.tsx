import {MutableRefObject, useContext, useState} from "react";
import Navbar from "./Navbar";
import MapPageDrawer from "./MapPageDrawer";
import {exportAsImage} from "../core/controller/MapController";
import {GeoJSON} from "ol/format";
import Map from "ol/Map";
import VectorSource from "ol/source/Vector";
import {fileOpen, fileSave} from "browser-fs-access";
import {updateLocalFeatures} from "../core/controller/MapInteractionController";
import {StorageContext} from "./StorageContext";

export default function MapPageNavigation(props: {
  mapRef: MutableRefObject<Map|undefined>,
  featuresSourceRef: MutableRefObject<VectorSource|undefined>,
  noteId: string
}) {

  const storageContext = useContext(StorageContext);
  const noteId = props.noteId;
  const mapRef = props.mapRef;
  const featuresSourceRef = props.featuresSourceRef;

  const [isDrawerOpen, setDrawerOpen] = useState(false);

  const onExportAsImage = () => {
    if (mapRef.current) {
      exportAsImage(mapRef.current);
      setDrawerOpen(false);
    }
  }

  const onImportFromFile = async () => {
    if (featuresSourceRef.current) {
      const file = await fileOpen();
      const text = await file.text();
      try {
        const features = new GeoJSON().readFeatures(text);
        featuresSourceRef.current.addFeatures(features);
        updateLocalFeatures(noteId, featuresSourceRef.current.getFeatures(), storageContext);
      } catch (e) {
        alert('Invalid GeoJSON');
      }
      setDrawerOpen(false);
    }
  }

  const onExportToFile = async () => {
    if (featuresSourceRef.current) {
      const features = featuresSourceRef.current.getFeatures();
      const text = new GeoJSON().writeFeatures(features);
      await fileSave(new Blob([text], {type: 'application/json'}), {
        fileName: 'map.json',
        extensions: ['.json'],
      });
      setDrawerOpen(false);
    }
  }

  return (
    <>
      <Navbar onOpenDrawer={() => setDrawerOpen(true)} />
      <MapPageDrawer
        isOpen={isDrawerOpen}
        onClose={() => setDrawerOpen(false)}
        onExportAsImage={onExportAsImage}
        onImportFromFileClick={onImportFromFile}
        onExportToFileClick={onExportToFile}
      />
    </>
  );

}