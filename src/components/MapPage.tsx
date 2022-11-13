import {useEffect, useRef} from "react";
import TileLayer from "ol/layer/Tile";
import {OSM} from "ol/source";
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import {Feature, Geolocation, View} from "ol";
import Map from "ol/Map";
import {Draw} from "ol/interaction";
import "ol/ol.css";
import {createStore, get, set, UseStore} from 'idb-keyval';
import {GeoJSON} from "ol/format";
import {BottomToolbar} from "./BottomToolbar";
import {DrawType} from "../core/DrawType";
import UndoRedo from 'ol-ext/interaction/UndoRedo';
import {DB_NOTES, DB_NOTES_PREFS, STORE_NOTES, STORE_NOTES_PREFS} from "../core/Keys";
import log from "../core/Logger";
import {createBox, DrawEvent} from "ol/interaction/Draw";
import {get as getProjection} from "ol/proj";
import "ol/ol.css";
import style from "./MapPage.module.css";
import SideToolbar from "./SideToolbar";
import {Fill, Stroke, Style} from "ol/style";
import CircleStyle from "ol/style/Circle";
import Point from 'ol/geom/Point';
import {Attribution, defaults} from "ol/control";

export default function MapPage(props: {id: string}) {

  const id = props.id;

  const notesStoreRef = useRef<UseStore>();         // Storage for notes features
  const notesPrefsStoreRef = useRef<UseStore>();    // Storage for map preferences (zoom, center, etc.)

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
      features = features.concat(event.feature); // Source is not updated yet, add the new feature manually
      set(id, new GeoJSON().writeFeatures(features), notesStoreRef.current)
        .then(() => log("Note updated with new feature"));
    });

    log('Drawing interaction updated to', drawTypeRef.current);

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
  const updateNotesStore = () => {
    set(id, new GeoJSON().writeFeatures(vectorSourceRef.current?.getFeatures() || []), notesStoreRef.current)
      .then(() => log("Note has been updated"));
  }
  const onUndo = () => {
    undoRedoInteractionRef.current.undo();
    updateNotesStore();
  }
  const onRedo = () => {
    undoRedoInteractionRef.current.redo();
    updateNotesStore();
  }

  // Initialization
  useEffect(() => {

    // Initialize stores
    if (!notesStoreRef.current)
      notesStoreRef.current = createStore(DB_NOTES, STORE_NOTES);
    if (!notesPrefsStoreRef.current)
      notesPrefsStoreRef.current = createStore(DB_NOTES_PREFS, STORE_NOTES_PREFS);

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
        source: new OSM({
          crossOrigin: 'anonymous',
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

    if (!mapRef.current) {

      // Limit multi-world panning
      // @ts-ignore
      const extent = getProjection('EPSG:3857').getExtent().slice();
      extent[0] += extent[0];
      extent[2] += extent[2];
      // Instantiate map
      mapRef.current = new Map({
        target: 'map',
        layers: [tileLayerRef.current, vectorLayerRef.current],
        view: new View({
          center: [-11000000, 4600000],
          zoom: 4,
          extent: extent
        })
      });

      // Restore previous map view
      get(id, notesPrefsStoreRef.current).then((view: string) => {
        if (view) {
          const previousView = JSON.parse(view);
          mapRef.current?.getView().setCenter(previousView.center);
          mapRef.current?.getView().setZoom(previousView.zoom);
          log("Restored previous view");
        }
      });
      // Save map view on move end
      mapRef.current.on('moveend', () => {
        const currentView = {
          center: mapRef.current?.getView().getCenter(),
          zoom: mapRef.current?.getView().getZoom()
        };
        set(id, JSON.stringify(currentView), notesPrefsStoreRef.current).then(() => log("Local note prefs updated"));
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

  const positionFeature = useRef<Feature>();
  useEffect(() => {
    if (positionFeature.current) return;
    positionFeature.current = new Feature();
    positionFeature.current.setStyle(
      new Style({
        image: new CircleStyle({
          radius: 6,
          fill: new Fill({
            color: '#3399CC',
          }),
          stroke: new Stroke({
            color: '#fff',
            width: 2,
          }),
        }),
      })
    );
  }, []);

  const geolocation = useRef<Geolocation>();
  const onLocate = () => {

    if (!geolocation.current && positionFeature.current) {

      vectorSourceRef.current?.addFeature(positionFeature.current);

      geolocation.current = new Geolocation({
        trackingOptions: {
          enableHighAccuracy: true,
        },
        projection: mapRef.current?.getView().getProjection()
      });

      geolocation.current.setTracking(true);

      geolocation.current.on('change:position', function () {
        const coordinates = geolocation.current?.getPosition();
        positionFeature.current?.setGeometry(coordinates ? new Point(coordinates) : undefined);
      });

    }

  }

  return (
    <div>
      <div id="map" className={style.map}></div>
      <BottomToolbar
        drawType={drawTypeRef.current}
        freeHand={freeHandRef.current}
        onDrawTypeChange={onDrawTypeChange}
        onFreeHandToggle={onFreeHandToggle}
        onUndo={onUndo}
        onRedo={onRedo}
      />
      <SideToolbar onLocate={onLocate} />
    </div>
  );

}