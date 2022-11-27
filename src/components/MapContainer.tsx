import {MutableRefObject, useContext, useEffect, useRef, useState} from "react";
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import {Feature, Geolocation, Overlay} from "ol";
import Map from "ol/Map";
import {Draw, Select} from "ol/interaction";
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
import {initLayers} from "../core/controller/MapLayerController";
import {initMap} from "../core/controller/MapController";
import {initUndoInteraction, updateDrawInteraction} from "../core/controller/MapInteractionController";
import {Note} from "../core/Note";
import LayerGroup from "ol/layer/Group";
import TileLayerToolbar from "./TileLayerToolbar";
import {TileLayerType} from "../core/TileLayerType";
import {EventsKey} from "ol/events";
import {SelectEvent} from "ol/interaction/Select";
import useMapSources from "../hooks/useMapSources";

export const updateNoteMeta = (note: Note) => {
  return {
    ...note,
    modifiedOn: new Date().toISOString()
  }
}

export default function MapContainer(props: {
  noteId: string,
  mapRef: MutableRefObject<Map|undefined>,
  featuresSourceRef: MutableRefObject<VectorSource|undefined>,
}) {

  const noteId = props.noteId;

  const storageContext = useContext(StorageContext);

  // Map
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const popupContainerRef = useRef<HTMLDivElement>(null);
  const popupCloserRef = useRef<HTMLAnchorElement>(null);
  const popupContentRef = useRef<HTMLDivElement>(null);
  const mapRef = props.mapRef;

  // Sources
  const {featuresSourceRef, locationSourceRef, initMapSources} = useMapSources(noteId);

  // Layers
  const featuresLayerRef = useRef<VectorLayer<VectorSource>>();
  const locationLayerRef = useRef<VectorLayer<VectorSource>>();
  const tileLayerGroupRef = useRef<LayerGroup>();

  // Overlays
  const popupOverlayRef = useRef<Overlay>();

  // Interactions
  // @ts-ignore
  const undoRedoInteractionRef = useRef<UndoRedo>();
  const drawInteractionRef = useRef<Draw>();
  const selectInteractionRef = useRef<Select>();
  const mapInteractionKeys = useRef<EventsKey[]>([]);

  const selectedFeatureRef = useRef<Feature>();

  // Geolocation
  const geolocationRef = useRef<Geolocation>();

  const drawTypeRef = useRef<InteractionType>(InteractionType.None);
  const freeHandRef = useRef<boolean>(true);
  const [currentLayer, setCurrentLayer] = useState<TileLayerType|undefined>(undefined);

  const [selectedFeature, setSelectedFeature] = useState<boolean>(false);
  const onSelectedFeature = (event: SelectEvent) => {
    if (event.selected.length > 0) {
      selectedFeatureRef.current = event.selected[0];
      setSelectedFeature(true);
    } else {
      selectedFeatureRef.current = undefined;
      setSelectedFeature(false);
    }
  }

  const onFreeHandToggle = (isActive: boolean) => {
    freeHandRef.current = isActive;
    log("[UPDATE] FreeHand:", freeHandRef.current);
    updateDrawInteraction(drawTypeRef.current, freeHandRef.current,
      mapRef, drawInteractionRef, selectInteractionRef, featuresSourceRef, featuresLayerRef, noteId, storageContext,
        popupContentRef, popupOverlayRef, mapInteractionKeys, selectedFeatureRef, onSelectedFeature);
  }
  const onInteractionTypeChange = (type: InteractionType) => {
    drawTypeRef.current = type;
    updateDrawInteraction(drawTypeRef.current, freeHandRef.current,
      mapRef, drawInteractionRef, selectInteractionRef, featuresSourceRef, featuresLayerRef, noteId, storageContext,
        popupContentRef, popupOverlayRef, mapInteractionKeys, selectedFeatureRef, onSelectedFeature);
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

    initMapSources();
    // @ts-ignore
    initLayers(noteId, featuresLayerRef, locationLayerRef, tileLayerGroupRef, featuresSourceRef, locationSourceRef, storageContext);

    if (!popupOverlayRef.current) {
      popupOverlayRef.current = new Overlay({
        element: popupContainerRef.current || undefined,
        autoPan: {
          animation: {
            duration: 250,
          },
        },
      });
    }

    if (!mapRef.current
      && mapContainerRef.current && featuresLayerRef.current && locationLayerRef.current && tileLayerGroupRef.current) {
      initMap(mapRef, mapInteractionKeys, popupOverlayRef, popupContentRef, mapContainerRef, tileLayerGroupRef, featuresLayerRef, locationLayerRef, noteId, storageContext);
    }

    initUndoInteraction(undoRedoInteractionRef, mapRef, featuresLayerRef);

    getInitialLayer();

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

  useEffect(() => {
    if (popupContainerRef.current && popupCloserRef.current && popupContentRef.current) {
      popupCloserRef.current.onclick = function () {
        popupOverlayRef.current?.setPosition(undefined);
        popupCloserRef.current?.blur();
        return false;
      };
    }
  }, []);

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