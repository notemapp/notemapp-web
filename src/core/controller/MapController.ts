import {get as getProjection} from "ol/proj";
import Map from "ol/Map";
import {View} from "ol";
import {MutableRefObject, RefObject} from "react";
import BaseLayer from "ol/layer/Base";

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

export { initMap };