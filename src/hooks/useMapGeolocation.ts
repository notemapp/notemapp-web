import {MutableRefObject, useEffect, useRef} from "react";
import {Feature, Geolocation} from "ol";
import {Fill, Stroke, Style} from "ol/style";
import CircleStyle from "ol/style/Circle";
import log from "../core/Logger";
import Point from "ol/geom/Point";
import Map from "ol/Map";
import VectorSource from "ol/source/Vector";

const useMapGeolocation = (
  mapRef: MutableRefObject<Map|undefined>,
  locationSourceRef: MutableRefObject<VectorSource|undefined>
) => {

  const geolocationRef = useRef<Geolocation>();
  const locationFeatureRef = useRef<Feature>();

  function initGeolocation(): void {

    if (!geolocationRef.current) {
      geolocationRef.current = new Geolocation({
        tracking: true,
        trackingOptions: { enableHighAccuracy: true },
        projection: mapRef.current?.getView().getProjection(),
      });
      geolocationRef.current.on("change:position", () => {
        const coordinates = geolocationRef.current!.getPosition();
        log("[UPDATE] Updating current location:", coordinates);
        locationFeatureRef.current!.setGeometry(coordinates ? new Point(coordinates) : undefined);
      });
    }

  }

  function initLocationFeature(): void {

    if (!locationFeatureRef.current) {
      const feature = new Feature();
      feature.setStyle(
        new Style({
          image: new CircleStyle({
            radius: 6,
            fill: new Fill({color: '#3399CC'}),
            stroke: new Stroke({color: '#fff', width: 2}),
          })
        })
      );
      locationFeatureRef.current = feature;
    }

  }

  function onGeolocate(): void {
    locationFeatureRef.current && locationSourceRef.current?.addFeature(locationFeatureRef.current);
    initGeolocation();
  }

  useEffect(() => {
    initLocationFeature();
  }, []);

  return {onGeolocate};

};

export default useMapGeolocation;