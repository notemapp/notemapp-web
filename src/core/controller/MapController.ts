import {get as getProjection} from "ol/proj";
import Map from "ol/Map";
import {View} from "ol";
import {MutableRefObject} from "react";
import TileLayer from "ol/layer/Tile";
import {OSM} from "ol/source";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import {set} from "idb-keyval";
import log from "../Logger";
import {StorageContextInterface} from "../../components/StorageContext";

function initMap(
  mapRef: MutableRefObject<Map|undefined>,
  mapContainerRef: any,
  tileLayerRef: MutableRefObject<TileLayer<OSM>|undefined>,
  featuresLayerRef: MutableRefObject<VectorLayer<VectorSource>|undefined>,
  locationLayerRef: MutableRefObject<VectorLayer<VectorSource>|undefined>,
  noteId: string,
  storageContext: StorageContextInterface|null
): void {

  if (!mapRef.current && tileLayerRef.current && featuresLayerRef.current && locationLayerRef.current) {

    // Avoid panning too much
    // @ts-ignore
    const extent = getProjection('EPSG:3857').getExtent().slice();
    extent[0] += extent[0];
    extent[2] += extent[2];

    // Instantiate map
    mapRef.current = new Map({
      target: mapContainerRef.current,
      layers: [tileLayerRef.current, featuresLayerRef.current, locationLayerRef.current],
      view: new View({
        center: [-11000000, 4600000],
        zoom: 4,
        extent: extent
      })
    });

    mapRef.current.on('moveend', () => {
      const currentView = {
        center: mapRef.current?.getView().getCenter(),
        zoom: mapRef.current?.getView().getZoom()
      };
      set(noteId, JSON.stringify(currentView), storageContext?.notePrefsStoreRef.current)
        .then(() => log("[UPDATE] Save current view"));
    });

  }

}

export { initMap };