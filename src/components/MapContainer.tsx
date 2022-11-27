import {MutableRefObject, RefObject, useEffect, useRef, useState} from "react";
import VectorSource from "ol/source/Vector";
import {Overlay} from "ol";
import Map from "ol/Map";
import "ol/ol.css";
import {BottomToolbar} from "./BottomToolbar";
import {InteractionType} from "../core/InteractionType";
import SideToolbar from "./SideToolbar";
import LayerGroup from "ol/layer/Group";
import TileLayerToolbar from "./TileLayerToolbar";
import {TileLayerType} from "../core/TileLayerType";
import useMapInteractions from "../hooks/useMapInteractions";
import VectorLayer from "ol/layer/Vector";
import AnnotationMarkerPopup from "./AnnotationMarkerPopup";
import useStorage from "../hooks/useStorage";
import useMapGeolocation from "../hooks/useMapGeolocation";

export default function MapContainer(props: {
  noteId: string,
  mapRef: {
    mapRef: MutableRefObject<Map | undefined>,
    mapContainerRef: RefObject<HTMLDivElement>
  },
  sourcesRef: {
    featuresSourceRef: MutableRefObject<VectorSource | undefined>,
    locationSourceRef: MutableRefObject<VectorSource | undefined>
  },
  layersRef: {
    featuresLayerRef: MutableRefObject<VectorLayer<VectorSource> | undefined>,
    locationLayerRef: MutableRefObject<VectorLayer<VectorSource> | undefined>
    tileLayerGroupRef: MutableRefObject<LayerGroup | undefined>
  }
  popupRef: {
    popupContainerRef: RefObject<HTMLDivElement>,
    popupCloserRef: RefObject<HTMLDivElement>,
    popupContentRef: RefObject<HTMLDivElement>,
    popupOverlayRef: MutableRefObject<Overlay | undefined>,
  }
}) {

  const noteId = props.noteId;

  const storage = useStorage();

  const mapRef = props.mapRef.mapRef;
  const mapContainerRef = props.mapRef.mapContainerRef;

  const featuresSourceRef = props.sourcesRef.featuresSourceRef;
  const featuresLayerRef = props.layersRef.featuresLayerRef;

  const {onGeolocation} = useMapGeolocation(mapRef, props.sourcesRef.locationSourceRef);

  const [currentLayer, setCurrentLayer] = useState<TileLayerType|undefined>(undefined);

  const {updateInteraction, undoRedoInteractionRef, selectedFeatureRef, selectedFeature, setSelectedFeature} =
    useMapInteractions(noteId, mapRef, featuresSourceRef, featuresLayerRef, props.popupRef);
  const interactionTypeRef = useRef<InteractionType>(InteractionType.None);
  const isFreeHandRef = useRef<boolean>(true);

  const onFreeHandToggle = (isActive: boolean) => {
    isFreeHandRef.current = isActive;
    updateInteraction(interactionTypeRef.current, isFreeHandRef.current);
  }
  const onInteractionTypeChange = (type: InteractionType) => {
    interactionTypeRef.current = type;
    updateInteraction(interactionTypeRef.current, isFreeHandRef.current);
  }

  const onDeleteFeature = () => {
    if (selectedFeatureRef.current) {
      featuresSourceRef.current?.removeFeature(selectedFeatureRef.current);
      selectedFeatureRef.current = undefined;
      setSelectedFeature(false);
      storage.updateFeatures(noteId, featuresSourceRef.current?.getFeatures() || []);
    }
  }
  const onUndo = () => {
    undoRedoInteractionRef.current?.undo();
    storage.updateFeatures(noteId, featuresSourceRef.current?.getFeatures() || []);
  }
  const onRedo = () => {
    undoRedoInteractionRef.current?.redo();
    storage.updateFeatures(noteId, featuresSourceRef.current?.getFeatures() || []);
  }

  useEffect(() => {
    storage.fetchLastUsedLayer(noteId, (layer: TileLayerType) => setCurrentLayer(layer))
  }, []);

  const onTileLayerToggle = (tileLayerType: TileLayerType) => {

    if (mapRef.current) {
      storage.updateLastUsedLayer(noteId, tileLayerType);
      mapRef.current.getLayerGroup().getLayers().forEach((layer) => {
        if (layer instanceof LayerGroup) {
          layer.getLayers().forEach((l, i) => l.setVisible(i === tileLayerType.valueOf()));
        }
      });
      setCurrentLayer(tileLayerType);
    }

  }

  return (
    <div>
      <div ref={mapContainerRef} className="w-screen h-screen -z-50" />
      <AnnotationMarkerPopup popupRef={props.popupRef} />
      <BottomToolbar
        interactionType={interactionTypeRef.current}
        isFreeHand={isFreeHandRef.current}
        onInteractionTypeChange={onInteractionTypeChange}
        onFreeHandToggle={onFreeHandToggle}
        onUndo={onUndo}
        onRedo={onRedo}
      />
      <SideToolbar onLocate={onGeolocation} onDeleteFeature={onDeleteFeature} selectedFeature={selectedFeature} />
      <TileLayerToolbar currentLayer={currentLayer} onTileLayerToggle={onTileLayerToggle} />
    </div>
  );

}