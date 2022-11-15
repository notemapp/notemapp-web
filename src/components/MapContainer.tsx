import {useContext, useEffect, useRef} from "react";
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import {Feature, Geolocation} from "ol";
import Map from "ol/Map";
import {Draw} from "ol/interaction";
import "ol/ol.css";
import {set, update} from 'idb-keyval';
import {GeoJSON} from "ol/format";
import {BottomToolbar} from "./BottomToolbar";
import {DrawType} from "../core/DrawType";
import UndoRedo from 'ol-ext/interaction/UndoRedo';
import log from "../core/Logger";
import style from "./MapContainer.module.css";
import SideToolbar from "./SideToolbar";
import {StorageContext} from "./StorageContext";
import {initGeolocation, initLocationFeatureRef} from "../core/controller/GeolocationController";
import {initSources} from "../core/controller/MapSourceController";
import {initLayers} from "../core/controller/MapLayerController";
import {initMap} from "../core/controller/MapController";
import {initUndoInteraction, updateDrawInteraction} from "../core/controller/MapInteractionController";
import {Note} from "../core/Note";
import LayerGroup from "ol/layer/Group";
import LayerToolbar from "./LayerToolbar";
import {TileLayerType} from "../core/TileLayerType";

export const updateNoteMeta = (note: Note) => {
  return {
    ...note,
    modifiedOn: new Date().toISOString()
  }
}

export default function MapContainer(props: { noteId: string }) {

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
  const tileLayerGroupRef = useRef<LayerGroup>();

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
    ).then(() =>
      update(noteId, (note) => updateNoteMeta(note), storageContext?.noteMetaStoreRef.current)
    );
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
    initLayers(featuresLayerRef, locationLayerRef, tileLayerGroupRef, featuresSourceRef, locationSourceRef);

    if (!mapRef.current
      && mapContainerRef.current && featuresLayerRef.current && locationLayerRef.current && tileLayerGroupRef.current) {
      initMap(mapRef, mapContainerRef, tileLayerGroupRef, featuresLayerRef, locationLayerRef, noteId, storageContext);
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
      log("[INIT] Geolocation initialized");
    }
  }

  const onTileLayerToggle = (tileLayerType: TileLayerType) => {
    if (mapRef.current) {
      mapRef.current.getLayerGroup().getLayers().forEach((layer) => {
        if (layer instanceof LayerGroup) {
          layer.getLayers().forEach((l, i) => {
            if (i === tileLayerType.valueOf()) {
              l.setVisible(true);
            } else {
              l.setVisible(false);
            }
          });
        }
      });
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
      <LayerToolbar onTileLayerToggle={onTileLayerToggle} />
    </div>
  );

}