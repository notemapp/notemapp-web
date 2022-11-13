import {get as getProjection} from "ol/proj";
import Map from "ol/Map";
import {View} from "ol";
import {MutableRefObject, RefObject} from "react";
import BaseLayer from "ol/layer/Base";
import {get, set} from "idb-keyval";
import log from "../Logger";
import {StorageContextInterface} from "../../components/StorageContext";

function initMap(
  mapRef: MutableRefObject<Map|undefined>,
  mapContainerRef: RefObject<HTMLDivElement>,
  layers: BaseLayer[]
): void {

  if (!mapRef.current) {
    // Limit world map area
    // @ts-ignore
    const extent = getProjection('EPSG:3857').getExtent().slice();
    extent[0] += extent[0];
    extent[2] += extent[2];

    mapRef.current = new Map({
      target: 'map',
      layers: layers,
      view: new View({
        center: [-11000000, 4600000],
        zoom: 4,
        extent: extent
      })
    });
  }

}

function initMapEvents(
  noteId: string,
  mapRef: MutableRefObject<Map|undefined>,
  storageContext: StorageContextInterface,
): void {

  mapRef.current?.on('moveend', () => {
    const currentView = {
      center: mapRef.current?.getView().getCenter(),
      zoom: mapRef.current?.getView().getZoom()
    };
    set(noteId, JSON.stringify(currentView), storageContext?.notePrefsStoreRef.current)
      .then(() => log("[UPDATE] Save current view"));
  });

}

function loadPreviousMapState(
  noteId: string,
  mapRef: MutableRefObject<Map|undefined>,
  storageContext: StorageContextInterface,
): void {

  get(noteId, storageContext?.notePrefsStoreRef.current).then((view: string) => {
    if (view) {
      const previousView = JSON.parse(view);
      mapRef.current?.getView().setCenter(previousView.center);
      mapRef.current?.getView().setZoom(previousView.zoom);
      log("[LOAD] Restored previous map state");
    }
  });

}

export { initMap, initMapEvents, loadPreviousMapState };