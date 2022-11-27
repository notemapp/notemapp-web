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
  const mapContainerRef = useRef<HTMLDivElement>(null);

  const {popupOverlayRef, popupContainerRef, popupContentRef, popupCloserRef, initMapPopup} = useMapPopup();

  const {featuresSourceRef, locationSourceRef, initMapSources} = useMapSources(id);
  const {featuresLayerRef, locationLayerRef, tileLayerGroupRef, initMapLayers} =
    useMapLayers(id, featuresSourceRef, locationSourceRef);

  // Limit map panning to this extent:
  const EXTENT = [-20037508.34, -20037508.34, 20037508.34, 20037508.34];

  function updatePrefsWithCurrentView(map: Map, prevPrefs: NotePrefs|undefined): NotePrefs {
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

    if (!mapRef.current && mapContainerRef.current) {

      mapRef.current = new Map({
        target: mapContainerRef.current,
        layers: [tileLayerGroupRef.current!, featuresLayerRef.current!, locationLayerRef.current!],
        view: new View({
          center: [-11000000, 4600000],
          zoom: 4,
          extent: EXTENT,
          maxZoom: 19
        })
      });

      mapRef.current.on('moveend', () => {
        update(id, (prevPrefs: NotePrefs|undefined) =>
          updatePrefsWithCurrentView(mapRef.current!, prevPrefs), storageContext?.notePrefsStoreRef.current)
          .then(() => log("[UPDATE] Save current view into store"));
      });

      get(id, storageContext?.notePrefsStoreRef.current).then((prefs: NotePrefs) => {
        if (prefs) {
          mapRef.current!.getView().setCenter(prefs.center);
          mapRef.current!.getView().setZoom(prefs.zoom);
          mapRef.current!.getView().setRotation(prefs.rotation || 0);
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

  return {
    mapRef: {mapRef, mapContainerRef},
    sourcesRef: {featuresSourceRef, locationSourceRef},
    layersRef: {featuresLayerRef, locationLayerRef, tileLayerGroupRef},
    popupRef: {popupContainerRef, popupContentRef, popupCloserRef, popupOverlayRef}
  };

};

export default useMap;