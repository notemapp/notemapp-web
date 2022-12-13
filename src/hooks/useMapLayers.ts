import {MutableRefObject, useContext, useRef} from "react";
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import LayerGroup from "ol/layer/Group";
import {StyleLike} from "ol/style/Style";
import {NotePrefs, StorageContext} from "../components/StorageContext";
import TileLayer from "ol/layer/Tile";
import {BingMaps, Stamen} from "ol/source";
import {get} from "idb-keyval";
import log from "../core/Logger";
import {TileLayerType} from "../core/TileLayerType";
import useMapStyling from "./useMapStyling";

const useMapLayers = (
  id: string,
  featuresSourceRef: MutableRefObject<VectorSource|undefined>,
  locationSourceRef: MutableRefObject<VectorSource|undefined>,
) => {

  const storageContext = useContext(StorageContext);
  const mapStyling = useMapStyling();

  const featuresLayerRef = useRef<VectorLayer<VectorSource>>();
  const locationLayerRef = useRef<VectorLayer<VectorSource>>();
  const tileLayerGroupRef = useRef<LayerGroup>();

  function initVectorLayer(
    layer: MutableRefObject<VectorLayer<VectorSource>|undefined>,
    source: MutableRefObject<VectorSource|undefined>
  ): void {

    if (!layer.current) {
      layer.current = new VectorLayer({
        source: source.current,
        style: mapStyling.getStyleByFeature as StyleLike
      });
    }

  }

  function initTileLayerGroup(layer: MutableRefObject<LayerGroup|undefined>) {

    if (!layer.current) {

      layer.current = new LayerGroup({
        layers: [
          new TileLayer({
            visible: false,
            preload: Infinity,
            source: new Stamen({layer: 'toner'})
          }),
          new TileLayer({
            visible: true,
            preload: Infinity,
            source: new BingMaps({
              key: import.meta.env.VITE_BING_API_KEY,
              imagerySet: 'RoadOnDemand'
            })
          }),
          new TileLayer({
            visible: false,
            preload: Infinity,
            source: new BingMaps({
              key: import.meta.env.VITE_BING_API_KEY,
              imagerySet: 'AerialWithLabelsOnDemand'
            })
          })
        ]
      });

      get(id, storageContext?.notePrefsStoreRef.current).then((prefs: NotePrefs) => {
        const lastUsedLayer = prefs?.layer || TileLayerType.STREET;
        layer.current?.getLayers().forEach((l, i) => l.setVisible(i === lastUsedLayer.valueOf()));
        log("[INIT] Loaded last layer from store:", lastUsedLayer.toString());
      });

    }

  }

  function initMapLayers() {
    initVectorLayer(featuresLayerRef, featuresSourceRef);
    initVectorLayer(locationLayerRef, locationSourceRef);
    initTileLayerGroup(tileLayerGroupRef);
  }

  return {featuresLayerRef, locationLayerRef, tileLayerGroupRef, initMapLayers};

};

export default useMapLayers;