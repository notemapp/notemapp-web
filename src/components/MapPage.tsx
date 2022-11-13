import {useContext, useEffect, useRef} from "react";
import TileLayer from "ol/layer/Tile";
import {OSM} from "ol/source";
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import {Feature, Geolocation, View} from "ol";
import Map from "ol/Map";
import {Draw} from "ol/interaction";
import "ol/ol.css";
import {get, set} from 'idb-keyval';
import {GeoJSON} from "ol/format";
import {BottomToolbar} from "./BottomToolbar";
import {DrawType, toGeometryFeature} from "../core/DrawType";
import UndoRedo from 'ol-ext/interaction/UndoRedo';
import log from "../core/Logger";
import {DrawEvent} from "ol/interaction/Draw";
import {get as getProjection} from "ol/proj";
import style from "./MapPage.module.css";
import SideToolbar from "./SideToolbar";
import {Fill, Stroke, Style} from "ol/style";
import CircleStyle from "ol/style/Circle";
import Point from 'ol/geom/Point';
import {StorageContext} from "./StorageContext";

export default function MapPage(props: {noteId: string}) {

  const noteId = props.noteId;

  const storageContext = useContext(StorageContext);

  // Map
  const mapRef = useRef<Map>();
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Sources
  const featuresSourceRef = useRef<VectorSource>();
  const locationSourceRef = useRef<VectorSource>();

  // Layers
  const featuresLayerRef = useRef<VectorLayer<VectorSource>>();
  const locationLayerRef = useRef<VectorLayer<VectorSource>>();
  const tileLayerRef = useRef<TileLayer<OSM>>();

  // Interactions
  // @ts-ignore
  const undoRedoInteractionRef = useRef<UndoRedo>();
  const drawInteractionRef = useRef<Draw>();

  const drawTypeRef = useRef<DrawType>(DrawType.None);
  const freeHandRef = useRef<boolean>(false);

  const updateDrawInteraction = () => {

    if (!mapRef.current) return;

    if (drawInteractionRef.current) mapRef.current.removeInteraction(drawInteractionRef.current);

    if (drawTypeRef.current === DrawType.None) return;

    const {type, geometryFunction} = toGeometryFeature(drawTypeRef.current);

    drawInteractionRef.current = new Draw({
      source: featuresSourceRef.current,
      // @ts-ignore
      type: type,
      geometryFunction: geometryFunction,
      freehand: freeHandRef.current
    });
    mapRef.current.addInteraction(drawInteractionRef.current);

    drawInteractionRef.current.on('drawend', (event: DrawEvent) => {
      let features = featuresSourceRef.current?.getFeatures() || [];
      features = features.concat(event.feature); // Source is not updated yet, add the new feature manually
      set(noteId, new GeoJSON().writeFeatures(features), storageContext?.noteStoreRef.current)
        .then(() => log("[UPDATE] Add new feature"));
    });

    log('[UPDATE] Change drawType:', drawTypeRef.current);

  }

  const onFreeHandToggle = () => {
    freeHandRef.current = !freeHandRef.current;
    log("[UPDATE] FreeHand:", freeHandRef.current);
    updateDrawInteraction();
  }
  const onDrawTypeChange = (type: DrawType) => {
    drawTypeRef.current = type;
    updateDrawInteraction();
  }
  const updateNotesStore = () => {
    set(noteId, new GeoJSON().writeFeatures(featuresSourceRef.current?.getFeatures() || []), storageContext?.noteStoreRef.current)
      .then(() => log("[UPDATE] Update features"));
  }
  const onUndo = () => {
    undoRedoInteractionRef.current.undo();
    updateNotesStore();
  }
  const onRedo = () => {
    undoRedoInteractionRef.current.redo();
    updateNotesStore();
  }

  useEffect(() => {

    // Initialize vector source
    if (!featuresSourceRef.current) {

      const loadFeatures = async () => {
        const features = await get(noteId, storageContext?.noteStoreRef.current);
        if (featuresSourceRef.current && features) {
          featuresSourceRef.current.addFeatures(new GeoJSON().readFeatures(features));
          log("[INIT] Load features from store");
        }
      }

      featuresSourceRef.current = new VectorSource({
        wrapX: false,
        loader: loadFeatures
      });

    }
    if (!locationSourceRef.current) {
      locationSourceRef.current = new VectorSource({wrapX: false});
    }

    // Initialize layers
    if (!featuresLayerRef.current) {
      featuresLayerRef.current = new VectorLayer({
        source: featuresSourceRef.current
      });
    }
    if (!locationLayerRef.current) {
      locationLayerRef.current = new VectorLayer({
        source: locationSourceRef.current
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

    if (!mapRef.current && mapContainerRef.current) {

      // Limit multi-world panning
      // @ts-ignore
      const extent = getProjection('EPSG:3857').getExtent().slice();
      extent[0] += extent[0];
      extent[2] += extent[2];

      // Instantiate map
      mapRef.current = new Map({
        target: mapContainerRef.current,
        layers: [tileLayerRef.current, featuresLayerRef.current, locationLayerRef.current],
        view: new View({
          center: [-11000000, 4600000],
          zoom: 4,
          extent: extent
        })
      });

      // Restore previous map view
      get(noteId, storageContext?.notePrefsStoreRef.current).then((view: string) => {
        if (view) {
          const previousView = JSON.parse(view);
          mapRef.current?.getView().setCenter(previousView.center);
          mapRef.current?.getView().setZoom(previousView.zoom);
          log("[LOAD] Restore previous view");
        }
      });
      // Save map view on move end
      mapRef.current.on('moveend', () => {
        const currentView = {
          center: mapRef.current?.getView().getCenter(),
          zoom: mapRef.current?.getView().getZoom()
        };
        set(noteId, JSON.stringify(currentView), storageContext?.notePrefsStoreRef.current)
          .then(() => log("[UPDATE] Save current view"));
      });

    }

    if (!featuresSourceRef.current) {
      get(noteId).then((value) => {
        if (value === undefined && featuresSourceRef.current) {
          set(noteId, new GeoJSON().writeFeatures(featuresSourceRef.current.getFeatures()), storageContext?.noteStoreRef.current)
            .then(() => log("[INIT] Create new note"));
        }
      });
    }

    if (!undoRedoInteractionRef.current && mapRef.current) {
      undoRedoInteractionRef.current = new UndoRedo({
        maxLength: 20,
        layers: [featuresLayerRef.current],
      });
      mapRef.current.addInteraction(undoRedoInteractionRef.current);
    }

  }, []);

  // Geolocation:
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

      locationSourceRef.current?.addFeature(positionFeature.current);

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
      <div ref={mapContainerRef} className={style.mapContainer}></div>
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