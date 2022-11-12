import './App.css'
import {useEffect, useRef, useState} from "react";
import TileLayer from "ol/layer/Tile";
import {OSM} from "ol/source";
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import {View} from "ol";
import Map from "ol/Map";
import {Draw} from "ol/interaction";
import "ol/ol.css";
import {createStore, get, set, UseStore} from 'idb-keyval';
import {GeoJSON} from "ol/format";
import {Toolbar} from "./components/Toolbar";
import {DrawType} from "./core/DrawType";
import UndoRedo from 'ol-ext/interaction/UndoRedo';
import {DB_NOTES, STORE_NOTES} from "./core/Keys";
import log from "./core/Logger";
import {createBox, DrawEvent} from "ol/interaction/Draw";
import {get as getProjection} from "ol/proj";

function App() {

  const id = 'my-note-id';

  const notesStoreRef = useRef<UseStore>();
  const mapRef = useRef<Map>();
  const vectorSourceRef = useRef<VectorSource>();

  const vectorLayerRef = useRef<VectorLayer<VectorSource>>();
  const tileLayerRef = useRef<TileLayer<OSM>>();

  const drawInteractionRef = useRef<Draw>();
  // @ts-ignore
  const undoRedoInteractionRef = useRef<UndoRedo>();

  const drawTypeRef = useRef<DrawType>(DrawType.None);
  const freeHandRef = useRef<boolean>(false);

  const updateDrawInteraction = () => {

    log('Changing draw interaction to', drawTypeRef.current);

    if (!mapRef.current) return;

    if (drawInteractionRef.current) {
      mapRef.current.removeInteraction(drawInteractionRef.current);
    }

    if (drawTypeRef.current === DrawType.None) return;

    let geometryFunction = undefined;
    let type = 'LineString';
    switch (drawTypeRef.current) {
      case DrawType.Polygon:
        type = 'Polygon';
        break;
      case DrawType.Rectangle:
        type = 'Circle';
        geometryFunction = createBox();
        break;
    }

    drawInteractionRef.current = new Draw({
      source: vectorSourceRef.current,
      // @ts-ignore
      type: type,
      geometryFunction: geometryFunction,
      freehand: freeHandRef.current
    });
    mapRef.current.addInteraction(drawInteractionRef.current);

    drawInteractionRef.current.on('drawend', (event: DrawEvent) => {
      let features = vectorSourceRef.current?.getFeatures() || [];
      features = features.concat(event.feature);  // Source is not updated yet, add the new feature manually
      set(id, new GeoJSON().writeFeatures(features), notesStoreRef.current).then(() => log("Local note updated"));
    });

  }

  const onFreeHandToggle = () => {
    freeHandRef.current = !freeHandRef.current;
    log("FreeHand mode:", freeHandRef.current);
    updateDrawInteraction();
  }
  const onDrawTypeChange = (type: DrawType) => {
    drawTypeRef.current = type;
    updateDrawInteraction();
  }
  const onUndo = () => {
    undoRedoInteractionRef.current.undo();
    set(id, new GeoJSON().writeFeatures(vectorSourceRef.current?.getFeatures() || []), notesStoreRef.current).then(() => log("Local note updated on undo"));
  }
  const onRedo = () => {
    undoRedoInteractionRef.current.redo();
    set(id, new GeoJSON().writeFeatures(vectorSourceRef.current?.getFeatures() || []), notesStoreRef.current).then(() => log("Local note updated on redo"));
  }

  // Initialization
  useEffect(() => {

    // Initialize notes store
    if (!notesStoreRef.current)
      notesStoreRef.current = createStore(DB_NOTES, STORE_NOTES);

    // Initialize vector source
    if (!vectorSourceRef.current) {

      const loadFeatures = async () => {
        const features = await get(id, notesStoreRef.current);
        if (vectorSourceRef.current && features) {
          vectorSourceRef.current.addFeatures(new GeoJSON().readFeatures(features));
          log("Loaded features from IndexedDB");
        }
      }

      vectorSourceRef.current = new VectorSource({
        wrapX: false,
        loader: loadFeatures
      });

    }

    // Initialize layers
    if (!vectorLayerRef.current) {
      vectorLayerRef.current = new VectorLayer({
        source: vectorSourceRef.current,
        style: {
          'fill-color': 'rgba(255, 255, 255, 0.2)',
          'stroke-color': '#000000',
          'stroke-width': 5,
          'circle-radius': 7,
          'circle-fill-color': '#000000',
        },
      });
    }
    if (!tileLayerRef.current) {
      tileLayerRef.current = new TileLayer({
        source: new OSM()
      });
    }

    if (!mapRef.current) {

      // Limit multi-world panning
      // @ts-ignore
      const extent = getProjection('EPSG:3857').getExtent().slice();
      extent[0] += extent[0];
      extent[2] += extent[2];

      mapRef.current = new Map({
        target: 'map',
        layers: [tileLayerRef.current, vectorLayerRef.current],
        view: new View({
          center: [-11000000, 4600000],
          zoom: 4,
          extent: extent
        })
      });

    }

    if (!vectorSourceRef.current) {
      get(id).then((value) => {
        if (value === undefined && vectorSourceRef.current) {
          set(id, new GeoJSON().writeFeatures(vectorSourceRef.current.getFeatures()), notesStoreRef.current)
            .then(() => log("Initialized new note"));
        }
      });
    }

    if (!undoRedoInteractionRef.current) {
      undoRedoInteractionRef.current = new UndoRedo({
        maxLength: 20,
        layers: [vectorLayerRef.current],
      });
      mapRef.current.addInteraction(undoRedoInteractionRef.current);
    }

  }, []);

  return (
    <div>
      <div id="map" className="map"></div>
      <Toolbar
        drawType={drawTypeRef.current}
        freeHand={freeHandRef.current}
        onDrawTypeChange={onDrawTypeChange}
        onFreeHandToggle={onFreeHandToggle}
        onUndo={onUndo}
        onRedo={onRedo}
      />
    </div>
  );

}

export default App
