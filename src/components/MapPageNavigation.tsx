import {MutableRefObject, useState} from "react";
import MapPageNavbar from "./MapPageNavbar";
import MapPageDrawer from "./MapPageDrawer";
import Map from "ol/Map";
import VectorSource from "ol/source/Vector";
import useMapImportExport from "../hooks/useMapImportExport";

export default function MapPageNavigation(props: {
  noteId: string,
  mapRef: MutableRefObject<Map | undefined>,
  featuresSourceRef: MutableRefObject<VectorSource | undefined>
}) {

  const noteId = props.noteId;
  const mapRef = props.mapRef;
  const featuresSourceRef = props.featuresSourceRef;

  const importExport = useMapImportExport(mapRef, featuresSourceRef);

  const [isDrawerOpen, setDrawerOpen] = useState(false);

  const onExportAsImage = () => importExport.exportAsImage(() => setDrawerOpen(false));
  const onImportFromFile = async () => importExport.importFromFile(noteId).then(() => setDrawerOpen(false));
  const onExportToFile = async () => importExport.exportToFile(noteId).then(() => setDrawerOpen(false));

  return (
    <>
      <MapPageNavbar onOpenDrawer={() => setDrawerOpen(true)} />
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