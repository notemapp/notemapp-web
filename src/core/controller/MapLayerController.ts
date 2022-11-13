import VectorLayer from "ol/layer/Vector";
import {MutableRefObject} from "react";
import VectorSource from "ol/source/Vector";
import TileLayer from "ol/layer/Tile";
import {OSM} from "ol/source";

function initVectorLayer(
  layer: MutableRefObject<VectorLayer<VectorSource>>,
  source: MutableRefObject<VectorSource>
): void {

  if (!layer.current) {
    layer.current = new VectorLayer({
      source: source.current
    });
  }

}

function initTileLayer(
  layer: MutableRefObject<TileLayer<OSM>>,
): void {

  if (!layer.current) {
    layer.current = new TileLayer({
      source: new OSM({
        crossOrigin: 'anonymous',
        // TODO: load tiles from own proxy
        /*
        tileLoadFunction: (imageTile, src) => {
          const {pathname} = new URL(src);
          // @ts-ignore
          imageTile.getImage().src = `https://proxy.notemapp.com${pathname}`;
        }
        */
      })
    });
  }

}

function initLayers(
  featuresLayer: MutableRefObject<VectorLayer<VectorSource>>,
  locationLayer: MutableRefObject<VectorLayer<VectorSource>>,
  tileLayer: MutableRefObject<TileLayer<OSM>>,
  featuresSource: MutableRefObject<VectorSource>,
  locationSource: MutableRefObject<VectorSource>
): void {

  initVectorLayer(featuresLayer, featuresSource);
  initVectorLayer(locationLayer, locationSource);
  initTileLayer(tileLayer);

}

export { initLayers };