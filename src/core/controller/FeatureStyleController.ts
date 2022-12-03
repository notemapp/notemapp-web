import {Feature} from "ol";
import {Fill, Stroke, Style} from "ol/style";
import {MARKER_STYLE} from "../../hooks/useMapInteractions";

const STYLES = {
  'Point': MARKER_STYLE,
  'LineString': new Style({
    stroke: new Stroke({
      color: 'rgba(150,67,67,1)',
      width: 4,
    }),
  }),
  'Polygon': new Style({
    stroke: new Stroke({
      color: 'rgba(204,148,20,0.45)',
      lineDash: [4],
      width: 3,
    }),
    fill: new Fill({
      color: 'rgba(204,148,20,0.35)',
    }),
  }),
  'Circle': new Style({
    stroke: new Stroke({
      color: 'blue',
      width: 3,
    }),
    fill: new Fill({
      color: 'rgba(0, 0, 255, 0.1)',
    }),
  }),
};

function getStyleByFeature(feature: Feature): Style {
  // @ts-ignore
  return STYLES[feature.getGeometry().getType().toString()];
}

export { getStyleByFeature };