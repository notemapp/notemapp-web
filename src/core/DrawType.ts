import {createBox, GeometryFunction} from "ol/interaction/Draw";

enum DrawType {
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

const toGeometryFeature = (drawType: DrawType): GeometryFeature => {

  let type = undefined;
  let geometryFunction = undefined;
  switch (drawType) {
    case DrawType.Line:
      type = 'LineString';
      break;
    case DrawType.Polygon:
      type = 'Polygon';
      break;
    case DrawType.Rectangle:
      type = 'Circle';
      geometryFunction = createBox();
      break;
  }

  return {type: type, geometryFunction: geometryFunction}

}

export { DrawType, toGeometryFeature };