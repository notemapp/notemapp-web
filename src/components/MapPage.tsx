import {useContext, useEffect, useRef} from "react";
import TileLayer from "ol/layer/Tile";
import {OSM} from "ol/source";
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import {Feature, Geolocation} from "ol";
import Map from "ol/Map";
import {Draw} from "ol/interaction";
import "ol/ol.css";
import {set} from 'idb-keyval';
import {GeoJSON} from "ol/format";
import {BottomToolbar} from "./BottomToolbar";
import {DrawType} from "../core/DrawType";
import UndoRedo from 'ol-ext/interaction/UndoRedo';
import log from "../core/Logger";
import style from "./MapPage.module.css";
import SideToolbar from "./SideToolbar";
import {StorageContext} from "./StorageContext";
import {initGeolocation, initLocationFeatureRef} from "../core/controller/GeolocationController";
import {initSources} from "../core/controller/MapSourceController";
import {initLayers} from "../core/controller/MapLayerController";
import {initMap} from "../core/controller/MapController";
import {initUndoInteraction, updateDrawInteraction} from "../core/controller/MapInteractionController";

export default function MapPage(props: { noteId: string }) {

  const noteId = props.noteId;

  const storageContext = useContext(StorageContext);

  // Map
  const mapRef = useRef<Map>();
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Sources
  const featuresSourceRef = useRef<VectorSource>();
  const locationSourceRef = useRef<VectorSource>();

  // Layers
  const featuresLayerRef = useRef<VectorLayer<VectorSource>>();
  const locationLayerRef = useRef<VectorLayer<VectorSource>>();
  const tileLayerRef = useRef<TileLayer<OSM>>();

  // Interactions
  // @ts-ignore
  const undoRedoInteractionRef = useRef<UndoRedo>();
  const drawInteractionRef = useRef<Draw>();

  // Geolocation
  const geolocationRef = useRef<Geolocation>();

  const drawTypeRef = useRef<DrawType>(DrawType.None);
  const freeHandRef = useRef<boolean>(false);

  const onFreeHandToggle = () => {
    freeHandRef.current = !freeHandRef.current;
    log("[UPDATE] FreeHand:", freeHandRef.current);
    updateDrawInteraction(drawTypeRef.current, freeHandRef.current,
      mapRef, drawInteractionRef, featuresSourceRef, noteId, storageContext);
  }
  const onDrawTypeChange = (type: DrawType) => {
    drawTypeRef.current = type;
    updateDrawInteraction(drawTypeRef.current, freeHandRef.current,
      mapRef, drawInteractionRef, featuresSourceRef, noteId, storageContext);
  }
  const updateNotesStore = () => {
    set(
      noteId,
      new GeoJSON().writeFeatures(featuresSourceRef.current?.getFeatures() || []),
      storageContext?.noteStoreRef.current
    ).then(() => log("[UPDATE] Update features"));
  }
  const onUndo = () => {
    undoRedoInteractionRef.current.undo();
    updateNotesStore();
  }
  const onRedo = () => {
    undoRedoInteractionRef.current.redo();
    updateNotesStore();
  }

  useEffect(() => {

    // @ts-ignore
    initSources(noteId, storageContext, featuresSourceRef, locationSourceRef);
    // @ts-ignore
    initLayers(featuresLayerRef, locationLayerRef, tileLayerRef, featuresSourceRef, locationSourceRef);

    if (!mapRef.current
      && mapContainerRef.current && featuresLayerRef.current && locationLayerRef.current && tileLayerRef.current) {
      initMap(mapRef, mapContainerRef, tileLayerRef, featuresLayerRef, locationLayerRef, noteId, storageContext);
    }

    initUndoInteraction(undoRedoInteractionRef, mapRef, featuresLayerRef);

  }, []);

  // Geolocation
  // -----------
  const locationFeatureRef = useRef<Feature>();
  useEffect(() => initLocationFeatureRef(locationFeatureRef), []);

  const onLocate = () => {
    if (!geolocationRef.current) {
      locationFeatureRef.current && locationSourceRef.current?.addFeature(locationFeatureRef.current);
      initGeolocation(geolocationRef, mapRef, locationFeatureRef);
    }
  }

  return (
    <div>
      <div ref={mapContainerRef} className={style.mapContainer}></div>
      <BottomToolbar
        drawType={drawTypeRef.current}
        freeHand={freeHandRef.current}
        onDrawTypeChange={onDrawTypeChange}
        onFreeHandToggle={onFreeHandToggle}
        onUndo={onUndo}
        onRedo={onRedo}
      />
      <SideToolbar onLocate={onLocate}/>
    </div>
  );

}