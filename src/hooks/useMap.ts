import {useContext, useEffect, useRef} from "react";
import Map from "ol/Map";
import useMapSources from "./useMapSources";
import useMapLayers from "./useMapLayers";
import {View} from "ol";
import useMapPopup from "./useMapPopup";
import {get, update} from "idb-keyval";
import {NotePrefs, StorageContext} from "../components/StorageContext";
import log from "../core/Logger";

const useMap = (id: string) => {

  const storageContext = useContext(StorageContext);

  const mapRef = useRef<Map>();
  const mapContainerRef = useRef<HTMLDivElement|undefined>(undefined);

  const {popupOverlayRef, popupContainerRef, popupCloserRef, initMapPopup} = useMapPopup();

  const {featuresSourceRef, locationSourceRef, initMapSources} = useMapSources(id);
  const {featuresLayerRef, locationLayerRef, tileLayerGroupRef, initMapLayers} = useMapLayers(id, featuresSourceRef, locationSourceRef);

  const EXTENT = [-20037508.34, -20037508.34, 20037508.34, 20037508.34];

  function updatePrefs(map: Map, prevPrefs: NotePrefs|undefined): NotePrefs {
    return  {
      ...prevPrefs,
      ...{
        center: map.getView().getCenter(),
        zoom: map.getView().getZoom(),
        rotation: map.getView().getRotation()
      }
    } as NotePrefs;
  }

  function initMap() {

    if (!mapRef.current) {

      mapRef.current = new Map({
        target: mapContainerRef.current,
        layers: [tileLayerGroupRef.current!, featuresLayerRef.current!, locationLayerRef.current!],
        overlays: [popupOverlayRef.current!],
        view: new View({
          center: [-11000000, 4600000],
          zoom: 4,
          extent: EXTENT,
          maxZoom: 19
        })
      });

      mapRef.current.on('moveend', () => {
        update(id, (prevPrefs: NotePrefs|undefined) => updatePrefs(mapRef.current!, prevPrefs), storageContext?.notePrefsStoreRef.current)
          .then(() => log("[UPDATE] Save current view"));
      });

      get(id, storageContext?.notePrefsStoreRef.current).then((prefs: NotePrefs) => {
        if (prefs) {
          mapRef.current!.getView().setCenter(prefs.center);
          mapRef.current!.getView().setZoom(prefs.zoom);
          mapRef.current!.getView().setRotation(prefs.rotation||0);
          log("[INIT] Restored previous view from store");
        }
      });

    }

  }

  useEffect(() => {

    initMapSources();
    initMapLayers();
    initMap();
    initMapPopup(mapRef.current!);

  }, []);

  return {mapRef, popupRef: {popupContainerRef, popupCloserRef}};

};

export default useMap;