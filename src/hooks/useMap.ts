import {useEffect, useRef} from "react";
import Map from "ol/Map";
import useMapSources from "./useMapSources";
import useMapLayers from "./useMapLayers";

const useMap = (id: string) => {

  const mapRef = useRef<Map>();
  const {featuresSourceRef, locationSourceRef, initMapSources} = useMapSources(id);
  const {featuresLayerRef, locationLayerRef, tileLayerGroupRef, initMapLayers} = useMapLayers(id, featuresSourceRef, locationSourceRef);

  useEffect(() => {

    initMapSources();
    initMapLayers();

  }, []);

  return {mapRef};

};

export default useMap;