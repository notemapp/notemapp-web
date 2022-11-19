import {get as getProjection} from "ol/proj";
import Map from "ol/Map";
import {Overlay, View} from "ol";
import {MutableRefObject, RefObject} from "react";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import {get, set, update} from "idb-keyval";
import log from "../Logger";
import {StorageContextInterface} from "../../components/StorageContext";
import LayerGroup from "ol/layer/Group";
import {EventsKey} from "ol/events";
import {fileSave} from "browser-fs-access";

function initMap(
  mapRef: MutableRefObject<Map|undefined>,
  mapInteractionKeys: MutableRefObject<EventsKey[]>,
  popupOverlayRef: MutableRefObject<Overlay|undefined>,
  popupContentRef: RefObject<HTMLDivElement|undefined>,
  mapContainerRef: any,
  tileLayerGroupRef: MutableRefObject<LayerGroup|undefined>,
  featuresLayerRef: MutableRefObject<VectorLayer<VectorSource>|undefined>,
  locationLayerRef: MutableRefObject<VectorLayer<VectorSource>|undefined>,
  noteId: string,
  storageContext: StorageContextInterface|null
): void {

  if (!mapRef.current && tileLayerGroupRef.current && featuresLayerRef.current && locationLayerRef.current && popupOverlayRef.current) {

    // Avoid panning too much
    // @ts-ignore
    const extent = getProjection('EPSG:3857').getExtent().slice();
    extent[0] += extent[0];
    extent[2] += extent[2];

    // Instantiate map
    mapRef.current = new Map({
      target: mapContainerRef.current,
      layers: [tileLayerGroupRef.current, featuresLayerRef.current, locationLayerRef.current],
      overlays: [popupOverlayRef.current],
      view: new View({
        center: [-11000000, 4600000],
        zoom: 4,
        extent: extent,
        maxZoom: 19,
      })
    });

    mapRef.current.on('moveend', () => {
      const currentView = {
        center: mapRef.current?.getView().getCenter(),
        zoom: mapRef.current?.getView().getZoom(),
        rotation: mapRef.current?.getView().getRotation()
      };
      update(noteId, (prevView) => {return {layer: 0, ...prevView, ...currentView}}, storageContext?.notePrefsStoreRef.current)
        .then(() => log("[UPDATE] Save current view"));
    });

    mapInteractionKeys.current.push(
        mapRef.current.on('click', function (evt) {
          const feature = mapRef.current?.forEachFeatureAtPixel(evt.pixel, function (feature) {
            return feature;
          });
          popupOverlayRef.current?.setPosition(undefined);
          if (!feature || !feature.get("label")) {
            return;
          }
          popupOverlayRef.current?.setPosition(evt.coordinate);
          if (popupContentRef.current) popupContentRef.current.innerHTML = `<p>${feature?.get("label")}</p>`;
        })
    );

    get(noteId, storageContext?.notePrefsStoreRef.current).then((previousView: any) => {
      if (previousView) {
        mapRef.current?.getView().setCenter(previousView.center);
        mapRef.current?.getView().setZoom(previousView.zoom);
        mapRef.current?.getView().setRotation(previousView.rotation||0);
        log("[LOAD] Restore previous view");
      }
    });

  }

}

function exportAsImage(
  map: Map
): void {

  map.once('rendercomplete', function () {
    const mapCanvas = document.createElement('canvas');
    const size = map.getSize();
    // @ts-ignore
    mapCanvas.width = size[0];
    // @ts-ignore
    mapCanvas.height = size[1];
    const mapContext = mapCanvas.getContext('2d');
    Array.prototype.forEach.call(
      map.getViewport().querySelectorAll('.ol-layer canvas, canvas.ol-layer'),
      function (canvas) {
        if (canvas.width > 0) {
          const opacity =
            canvas.parentNode.style.opacity || canvas.style.opacity;
          // @ts-ignore
          mapContext.globalAlpha = opacity === '' ? 1 : Number(opacity);
          let matrix;
          const transform = canvas.style.transform;
          if (transform) {
            // Get the transform parameters from the style's transform matrix
            matrix = transform
              .match(/^matrix\(([^\(]*)\)$/)[1]
              .split(',')
              .map(Number);
          } else {
            matrix = [
              parseFloat(canvas.style.width) / canvas.width,
              0,
              0,
              parseFloat(canvas.style.height) / canvas.height,
              0,
              0,
            ];
          }
          // Apply the transform to the export map context
          CanvasRenderingContext2D.prototype.setTransform.apply(
            mapContext,
            matrix
          );
          const backgroundColor = canvas.parentNode.style.backgroundColor;
          if (backgroundColor) {
            // @ts-ignore
            mapContext.fillStyle = backgroundColor;
            // @ts-ignore
            mapContext.fillRect(0, 0, canvas.width, canvas.height);
          }
          // @ts-ignore
          mapContext.drawImage(canvas, 0, 0);
        }
      }
    );
    // @ts-ignore
    mapContext.globalAlpha = 1;
    // @ts-ignore
    mapContext.setTransform(1, 0, 0, 1, 0, 0);
    mapCanvas.toBlob((imageBlob) => {
      imageBlob &&
      fileSave(imageBlob, {
        fileName: 'map.png',
        description: 'Map image',
        extensions: ['.png'],
      });
    })
  });

  map.renderSync();

}

export { initMap, exportAsImage };