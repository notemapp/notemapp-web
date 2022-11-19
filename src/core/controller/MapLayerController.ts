import VectorLayer from "ol/layer/Vector";
import {MutableRefObject} from "react";
import VectorSource from "ol/source/Vector";
import TileLayer from "ol/layer/Tile";
import {OSM, XYZ} from "ol/source";
import LayerGroup from "ol/layer/Group";
import {getStyleByFeature} from "./FeatureStyleController";

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
  layer: MutableRefObject<LayerGroup>,
): void {

  if (!layer.current) {
    layer.current = new LayerGroup({
      layers: [
        // TODO: load tiles from own proxy
        new TileLayer({
          source: new XYZ({url: 'https://stamen-tiles.a.ssl.fastly.net/toner/{z}/{x}/{y}.png', crossOrigin: 'anonymous'}),
          preload: 4
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
  }

}

function initLayers(
  featuresLayer: MutableRefObject<VectorLayer<VectorSource>>,
  locationLayer: MutableRefObject<VectorLayer<VectorSource>>,
  tileLayer: MutableRefObject<LayerGroup>,
  featuresSource: MutableRefObject<VectorSource>,
  locationSource: MutableRefObject<VectorSource>
): void {

  initVectorLayer(featuresLayer, featuresSource);
  initVectorLayer(locationLayer, locationSource);
  initTileLayerGroup(tileLayer);

}

export { initLayers };