import {MutableRefObject, RefObject, useContext, useEffect, useRef, useState} from "react";
import VectorSource from "ol/source/Vector";
import {Feature, Geolocation, Overlay} from "ol";
import Map from "ol/Map";
import "ol/ol.css";
import {get, set, update} from 'idb-keyval';
import {GeoJSON} from "ol/format";
import {BottomToolbar} from "./BottomToolbar";
import {InteractionType} from "../core/InteractionType";
import UndoRedo from 'ol-ext/interaction/UndoRedo';
import log from "../core/Logger";
import style from "./MapContainer.module.css";
import SideToolbar from "./SideToolbar";
import {StorageContext} from "./StorageContext";
import {initGeolocation, initLocationFeatureRef} from "../core/controller/GeolocationController";
import {Note} from "../core/Note";
import LayerGroup from "ol/layer/Group";
import TileLayerToolbar from "./TileLayerToolbar";
import {TileLayerType} from "../core/TileLayerType";
import useMapInteractions from "../hooks/useMapInteractions";
import VectorLayer from "ol/layer/Vector";

export const updateNoteMeta = (note: Note) => {
  return {
    ...note,
    modifiedOn: new Date().toISOString()
  }
}

export default function MapContainer(props: {
  noteId: string,
  mapRef: {
    mapRef: MutableRefObject<Map | undefined>,
    mapContainerRef: RefObject<HTMLDivElement>
  },
  sourcesRef: {
    featuresSourceRef: MutableRefObject<VectorSource | undefined>,
    locationSourceRef: MutableRefObject<VectorSource | undefined>
  },
  layersRef: {
    featuresLayerRef: MutableRefObject<VectorLayer<VectorSource> | undefined>,
    locationLayerRef: MutableRefObject<VectorLayer<VectorSource> | undefined>
    tileLayerGroupRef: MutableRefObject<LayerGroup | undefined>
  }
  popupRef: {
    popupContainerRef: RefObject<HTMLDivElement>,
    popupCloserRef: RefObject<HTMLAnchorElement>,
    popupContentRef: RefObject<HTMLDivElement>,
    popupOverlayRef: MutableRefObject<Overlay|undefined>,
  }
}) {

  const noteId = props.noteId;

  const storageContext = useContext(StorageContext);

  const mapRef = props.mapRef.mapRef;
  const mapContainerRef = props.mapRef.mapContainerRef;
  const popupContainerRef = props.popupRef.popupContainerRef;
  const popupCloserRef = props.popupRef.popupCloserRef;
  const popupContentRef = props.popupRef.popupContentRef;

  const featuresSourceRef = props.sourcesRef.featuresSourceRef;
  const locationSourceRef = props.sourcesRef.locationSourceRef;
  const featuresLayerRef = props.layersRef.featuresLayerRef;

  // Interactions
  // @ts-ignore
  const undoRedoInteractionRef = useRef<UndoRedo>();
  const {updateInteraction, selectedFeatureRef, selectedFeature, setSelectedFeature} = useMapInteractions(
    noteId,
    mapRef,
    featuresSourceRef,
    featuresLayerRef,
    props.popupRef);

  // Geolocation
  const geolocationRef = useRef<Geolocation>();

  const drawTypeRef = useRef<InteractionType>(InteractionType.None);
  const freeHandRef = useRef<boolean>(true);
  const [currentLayer, setCurrentLayer] = useState<TileLayerType|undefined>(undefined);

  const onFreeHandToggle = (isActive: boolean) => {
    freeHandRef.current = isActive;
    log("[UPDATE] FreeHand:", freeHandRef.current);
    updateInteraction(drawTypeRef.current, freeHandRef.current);
  }
  const onInteractionTypeChange = (type: InteractionType) => {
    drawTypeRef.current = type;
    updateInteraction(drawTypeRef.current, freeHandRef.current);
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
  const onDeleteFeature = () => {
    if (selectedFeatureRef.current) {
      featuresSourceRef.current?.removeFeature(selectedFeatureRef.current);
      selectedFeatureRef.current = undefined;
      setSelectedFeature(false);
      updateNotesStore();
    }
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

    if (mapRef.current) {

      // TODO: refactor undo interaction
      //initUndoInteraction(undoRedoInteractionRef, mapRef, featuresLayerRef);

      // TODO: refactor featch initial layer
      //getInitialLayer();

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
      log("[INIT] Geolocation initialized");
    }
  }

  const getInitialLayer = () => {

    get(noteId, storageContext?.notePrefsStoreRef.current).then((view: any) => {
      let lastLayer = TileLayerType.PAPER;
      if (view) {
        lastLayer = view?.layer || TileLayerType.PAPER;
      }
      setCurrentLayer(lastLayer);
    });

  }

  const onTileLayerToggle = (tileLayerType: TileLayerType) => {
    if (mapRef.current) {
      update(noteId, (note) => {return {...note, layer: tileLayerType.valueOf()}}, storageContext?.notePrefsStoreRef.current).then(() => {
        log("[UPDATE] TileLayer:", tileLayerType);
      })
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
      setCurrentLayer(tileLayerType);
    }
  }

  return (
    <div>
      <div ref={mapContainerRef} className={`${style.mapContainer} -z-50`}></div>
      <div ref={popupContainerRef} className={style.olPopup}>
        <a href="#" ref={popupCloserRef} className={style.olPopupCloser}></a>
        <div ref={popupContentRef}></div>
      </div>
      <BottomToolbar
        interactionType={drawTypeRef.current}
        isFreeHand={freeHandRef.current}
        onInteractionTypeChange={onInteractionTypeChange}
        onFreeHandToggle={onFreeHandToggle}
        onUndo={onUndo}
        onRedo={onRedo}
      />
      <SideToolbar onLocate={onLocate} onDeleteFeature={onDeleteFeature} selectedFeature={selectedFeature} />
      <TileLayerToolbar onTileLayerToggle={onTileLayerToggle} currentLayer={currentLayer} />
    </div>
  );

}