import VectorLayer from "ol/layer/Vector";
import {MutableRefObject} from "react";
import VectorSource from "ol/source/Vector";
import TileLayer from "ol/layer/Tile";
import {BingMaps, Stamen} from "ol/source";
import LayerGroup from "ol/layer/Group";
import {getStyleByFeature} from "./FeatureStyleController";
import {get} from "idb-keyval";
import {StorageContextInterface} from "../../components/StorageContext";
import log from "../Logger";

function initVectorLayer(
  layer: MutableRefObject<VectorLayer<VectorSource>>,
  source: MutableRefObject<VectorSource>
): void {

  if (!layer.current) {
    layer.current = new VectorLayer({
      source: source.current,
      // @ts-ignore
      style: getStyleByFeature
    });
  }

}

function initTileLayerGroup(
  noteId: string,
  layer: MutableRefObject<LayerGroup>,
  storageContext: StorageContextInterface|null
): void {

  if (!layer.current) {
    layer.current = new LayerGroup({
      layers: [
        // TODO: load tiles from own proxy
        new TileLayer({
          visible: true,
          preload: Infinity,
          source: new Stamen({
            layer: 'toner',
          }),
        }),
        new TileLayer({
          visible: false,
          preload: Infinity,
          source: new BingMaps({
            key: import.meta.env.VITE_BING_API_KEY,
            imagerySet: 'RoadOnDemand'
          }),
        }),
        new TileLayer({
          visible: false,
          preload: Infinity,
          source: new BingMaps({
            key: import.meta.env.VITE_BING_API_KEY,
            imagerySet: 'AerialWithLabelsOnDemand'
          }),
        })
      ]
    })
    get(noteId, storageContext?.notePrefsStoreRef.current).then((view: any) => {
      let lastLayer = 0;
      if (view) {
        lastLayer = view?.layer || 0;
      }
      layer.current?.getLayers().forEach((l, i) => {
        l.setVisible(i === lastLayer);
      });
      log("[LOAD] Load last layer:", noteId, lastLayer);
    });
  }

}

function initLayers(
  noteId: string,
  featuresLayer: MutableRefObject<VectorLayer<VectorSource>>,
  locationLayer: MutableRefObject<VectorLayer<VectorSource>>,
  tileLayer: MutableRefObject<LayerGroup>,
  featuresSource: MutableRefObject<VectorSource>,
  locationSource: MutableRefObject<VectorSource>,
  storageContext: StorageContextInterface|null
): void {

  initVectorLayer(featuresLayer, featuresSource);
  initVectorLayer(locationLayer, locationSource);
  initTileLayerGroup(noteId, tileLayer, storageContext);

}

export { initLayers };