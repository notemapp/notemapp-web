import {useEffect, useRef} from "react";
import Map from "ol/Map";
import useMapSources from "./useMapSources";

const useMap = (id: string) => {

  const mapRef = useRef<Map>();
  const {featuresSourceRef, locationSourceRef, initMapSources} = useMapSources(id);

  useEffect(() => {

    initMapSources();

  }, []);

  return {mapRef};

}

export default useMap;