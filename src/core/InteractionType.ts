import {createBox, GeometryFunction} from "ol/interaction/Draw";

enum InteractionType {
  None = 0,
  Line = 1,
  Polygon = 2,
  Rectangle = 3,
  Marker = 4,
  Select = 5
}

interface GeometryFeature {
  type: string|undefined;
  geometryFunction: GeometryFunction|undefined
}

const toGeometryFeature = (drawType: InteractionType): GeometryFeature => {

  let type = undefined;
  let geometryFunction = undefined;
  switch (drawType) {
    case InteractionType.Line:
      type = 'LineString';
      break;
    case InteractionType.Polygon:
      type = 'Polygon';
      break;
    case InteractionType.Rectangle:
      type = 'Circle';
      geometryFunction = createBox();
      break;
  }

  return {type: type, geometryFunction: geometryFunction}

}

const DRAW_INTERACTIONS = [InteractionType.Line, InteractionType.Polygon, InteractionType.Rectangle];

export { InteractionType, toGeometryFeature, DRAW_INTERACTIONS };