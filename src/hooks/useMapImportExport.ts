import Map from "ol/Map";
import {fileOpen, fileSave} from "browser-fs-access";
import {MutableRefObject} from "react";
import {GeoJSON} from "ol/format";
import VectorSource from "ol/source/Vector";
import useStorage from "./useStorage";

const useMapImportExport = (
  mapRef: MutableRefObject<Map|undefined>,
  featuresSourceRef: MutableRefObject<VectorSource|undefined>
) => {

  const storage = useStorage();

  function exportAsImage(onExport: () => void): void {

    const map = mapRef.current;

    if (!map) return;

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

    onExport();

  }

  async function importFromFile(id: string): Promise<void> {

    if (!featuresSourceRef.current) return;

    const file = await fileOpen();
    const text = await file.text();
    try {
      const features = new GeoJSON().readFeatures(text);
      featuresSourceRef.current.addFeatures(features);
      storage.saveFeatures(id, featuresSourceRef.current.getFeatures());
    } catch (e) {
      alert('Invalid GeoJSON');
    }

  }

  async function exportToFile(id: string): Promise<void> {

    if (!featuresSourceRef.current) return;

    const features = featuresSourceRef.current.getFeatures();
    const text = new GeoJSON().writeFeatures(features);
    await fileSave(new Blob([text], {type: 'application/json'}), {
      fileName: 'map.json',
      extensions: ['.json'],
    });

  }

  return {exportAsImage, importFromFile, exportToFile};

};

export default useMapImportExport;