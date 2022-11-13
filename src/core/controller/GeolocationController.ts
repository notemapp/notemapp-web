import {MutableRefObject} from "react";
import Map from "ol/Map";
import {Feature, Geolocation} from "ol";
import Point from "ol/geom/Point";
import {Fill, Stroke, Style} from "ol/style";
import CircleStyle from "ol/style/Circle";

function initGeolocation(
  geolocationRef: MutableRefObject<Geolocation|undefined>,
  mapRef: MutableRefObject<Map|undefined>,
  locationFeatureRef: MutableRefObject<Feature|undefined>,
) {

  if (!geolocationRef.current) {
    geolocationRef.current = new Geolocation({
      tracking: true,
      trackingOptions: { enableHighAccuracy: true },
      projection: mapRef.current?.getView().getProjection(),
    });
    geolocationRef.current.on("change:position", () => {
      const coordinates = geolocationRef.current?.getPosition();
      locationFeatureRef.current?.setGeometry(coordinates ? new Point(coordinates) : undefined);
    });
  }

}

function initLocationFeature(): Feature {

  const feature = new Feature();
  feature.setStyle(
    new Style({
      image: new CircleStyle({
        radius: 6,
        fill: new Fill({ color: '#3399CC' }),
        stroke: new Stroke({ color: '#fff', width: 2 }),
      })
    })
  );

  return feature;

}

function initLocationFeatureRef(locationFeatureRef: MutableRefObject<Feature|undefined>): void {
  if (!locationFeatureRef.current) {
    locationFeatureRef.current = initLocationFeature();
  }
}

export { initGeolocation, initLocationFeatureRef };