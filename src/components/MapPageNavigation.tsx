import {MutableRefObject, useState} from "react";
import Navbar from "./Navbar";
import MapPageDrawer from "./MapPageDrawer";
import {exportAsImage} from "../core/controller/MapController";
import {GeoJSON} from "ol/format";
import Map from "ol/Map";
import VectorSource from "ol/source/Vector";

export default function MapPageNavigation(props: {
  mapRef: MutableRefObject<Map|undefined>,
  featuresSourceRef: MutableRefObject<VectorSource|undefined>,
}) {

  const mapRef = props.mapRef;
  const featuresSourceRef = props.featuresSourceRef;

  const [isDrawerOpen, setDrawerOpen] = useState(false);

  const onExportAsImage = () => mapRef.current && exportAsImage(mapRef.current);

  const onImportFromFile = async () => {
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

  const onExportToFile = async () => {
    if (featuresSourceRef.current) {
      const features = featuresSourceRef.current.getFeatures();
      const text = new GeoJSON().writeFeatures(features);
      const fileHandle = await window.showSaveFilePicker({
        types: [{
          description: 'GeoJSON',
          accept: {'application/JSON': ['.json']}
        }],
      });
      const writable = await fileHandle.createWritable();
      await writable.write(text);
      await writable.close();
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