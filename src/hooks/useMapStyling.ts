import {MARKER_STYLE} from "./useMapInteractions";
import {Fill, Stroke, Style} from "ol/style";
import {Feature} from "ol";

const useMapStyling = () => {

    const STYLES: {[key: string]: Style} = {
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
        return STYLES[feature.getGeometry()?.getType().toString() || ''];
    }

    return {getStyleByFeature};

}

export default useMapStyling;