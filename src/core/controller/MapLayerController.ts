import VectorLayer from "ol/layer/Vector";
import {MutableRefObject} from "react";
import VectorSource from "ol/source/Vector";
import TileLayer from "ol/layer/Tile";
import {OSM, XYZ} from "ol/source";
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
          source: new XYZ({url: 'https://stamen-tiles.a.ssl.fastly.net/toner/{z}/{x}/{y}.png', crossOrigin: 'anonymous'}),
          preload: 4,
          visible: true
        }),
        new TileLayer({
          source: new OSM({crossOrigin: 'anonymous'}),
          preload: 4,
          visible: false
        }),
        new TileLayer({
          source: new XYZ({url: `https://tile-proxy-bing.alessiovierti.workers.dev/Aerial/{z}/{x}/{y}.jpg?key=none`, crossOrigin: 'anonymous'}),
          preload: 4,
          visible: false
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