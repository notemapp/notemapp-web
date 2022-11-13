import {MutableRefObject} from "react";
import UndoRedo from "ol-ext/interaction/UndoRedo";
import Map from "ol/Map";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";

function initUndoInteraction(
  interactionRef: MutableRefObject<any|undefined>,
  mapRef: MutableRefObject<Map|undefined>,
  layerRef: MutableRefObject<VectorLayer<VectorSource>|undefined>
): void {

  if (!interactionRef.current && mapRef.current) {
    interactionRef.current = new UndoRedo({
      maxLength: 20,
      layers: [layerRef.current],
    });
    mapRef.current.addInteraction(interactionRef.current);
  }

}

export { initUndoInteraction };