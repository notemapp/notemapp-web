import VectorLayer from "ol/layer/Vector";
import {MutableRefObject} from "react";
import VectorSource from "ol/source/Vector";
import TileLayer from "ol/layer/Tile";
import {OSM} from "ol/source";

function initVectorLayer(
  layerRef: MutableRefObject<VectorLayer<VectorSource>>,
  sourceRef: MutableRefObject<VectorSource>
): void {

  if (!layerRef.current) {
    layerRef.current = new VectorLayer({
      source: sourceRef.current
    });
  }

}

function initTileLayer(
  layerRef: MutableRefObject<TileLayer<OSM>>,
): void {

  if (!layerRef.current) {
    layerRef.current = new TileLayer({
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
  featuresLayerRef: MutableRefObject<VectorLayer<VectorSource>>,
  locationLayerRef: MutableRefObject<VectorLayer<VectorSource>>,
  tileLayerRef: MutableRefObject<TileLayer<OSM>>,
  featuresSourceRef: MutableRefObject<VectorSource>,
  locationSourceRef: MutableRefObject<VectorSource>
): void {

  initVectorLayer(featuresLayerRef, featuresSourceRef);
  initVectorLayer(locationLayerRef, locationSourceRef);
  initTileLayer(tileLayerRef);

}

export { initLayers };