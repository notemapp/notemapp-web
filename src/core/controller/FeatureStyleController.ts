import {Feature} from "ol";
import {Fill, Stroke, Style} from "ol/style";
import CircleStyle from "ol/style/Circle";
import {InteractionType, toGeometryFeature} from "../InteractionType";

const STYLES = {
  'Point': new Style({
    image: new CircleStyle({
      radius: 6,
      fill: new Fill({color: '#d32f2f'}),
      stroke: new Stroke({color: '#d32f2f', width: 2}),
    })
  }),
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

function getStyleByFeatureType(type: string): Style {
  // @ts-ignore
  return STYLES[type];
}

function getStyleByInteractionType(interactionType: InteractionType): Style {
  console.log("getStyleByInteractionType", interactionType);
  // @ts-ignore
  return STYLES[toGeometryFeature(interactionType).type];
}

export { getStyleByFeature, getStyleByFeatureType, getStyleByInteractionType };