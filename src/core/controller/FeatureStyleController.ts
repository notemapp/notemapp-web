import {Feature} from "ol";
import {Fill, Stroke, Style} from "ol/style";
import {MARKER_STYLE} from "../../hooks/useMapInteractions";

const STYLES = {
  'Point': MARKER_STYLE,
  'LineString': new Style({
    stroke: new Stroke({
      color: 'green',
      width: 4,
    }),
  }),
  'Polygon': new Style({
    stroke: new Stroke({
      color: 'blue',
      lineDash: [4],
      width: 3,
    }),
    fill: new Fill({
      color: 'rgba(0, 0, 255, 0.1)',
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