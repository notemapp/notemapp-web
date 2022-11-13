import {useContext, useEffect, useRef} from "react";
import TileLayer from "ol/layer/Tile";
import {OSM} from "ol/source";
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import {Feature, Geolocation} from "ol";
import Map from "ol/Map";
import {Draw} from "ol/interaction";
import "ol/ol.css";
import {get, set} from 'idb-keyval';
import {GeoJSON} from "ol/format";
import {BottomToolbar} from "./BottomToolbar";
import {DrawType, toGeometryFeature} from "../core/DrawType";
import UndoRedo from 'ol-ext/interaction/UndoRedo';
import log from "../core/Logger";
import {DrawEvent} from "ol/interaction/Draw";
import style from "./MapPage.module.css";
import SideToolbar from "./SideToolbar";
import {StorageContext} from "./StorageContext";
import {initGeolocation, initLocationFeatureRef} from "../core/controller/GeolocationController";
import {initSources} from "../core/controller/MapSourceController";
import {initLayers} from "../core/controller/MapLayerController";
import {initMap} from "../core/controller/MapController";

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

  const updateDrawInteraction = () => {

    if (!mapRef.current) return;

    if (drawInteractionRef.current) mapRef.current.removeInteraction(drawInteractionRef.current);

    if (drawTypeRef.current === DrawType.None) return;

    const {type, geometryFunction} = toGeometryFeature(drawTypeRef.current);

    drawInteractionRef.current = new Draw({
      source: featuresSourceRef.current,
      // @ts-ignore
      type: type,
      geometryFunction: geometryFunction,
      freehand: freeHandRef.current
    });
    mapRef.current.addInteraction(drawInteractionRef.current);

    drawInteractionRef.current.on('drawend', (event: DrawEvent) => {
      let features = featuresSourceRef.current?.getFeatures() || [];
      features = features.concat(event.feature); // Source is not updated yet, add the new feature manually
      set(noteId, new GeoJSON().writeFeatures(features), storageContext?.noteStoreRef.current)
        .then(() => log("[UPDATE] Add new feature"));
    });

    log('[UPDATE] Change drawType:', drawTypeRef.current);

  }

  const onFreeHandToggle = () => {
    freeHandRef.current = !freeHandRef.current;
    log("[UPDATE] FreeHand:", freeHandRef.current);
    updateDrawInteraction();
  }
  const onDrawTypeChange = (type: DrawType) => {
    drawTypeRef.current = type;
    updateDrawInteraction();
  }
  const updateNotesStore = () => {
    set(noteId, new GeoJSON().writeFeatures(featuresSourceRef.current?.getFeatures() || []), storageContext?.noteStoreRef.current)
      .then(() => log("[UPDATE] Update features"));
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

    if (!featuresSourceRef.current) {
      get(noteId).then((value) => {
        if (value === undefined && featuresSourceRef.current) {
          set(noteId, new GeoJSON().writeFeatures(featuresSourceRef.current.getFeatures()), storageContext?.noteStoreRef.current)
            .then(() => log("[INIT] Create new note"));
        }
      });
    }

    if (!undoRedoInteractionRef.current && mapRef.current) {
      undoRedoInteractionRef.current = new UndoRedo({
        maxLength: 20,
        layers: [featuresLayerRef.current],
      });
      mapRef.current.addInteraction(undoRedoInteractionRef.current);
    }

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