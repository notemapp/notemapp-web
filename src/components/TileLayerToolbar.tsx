import {useEffect, useState} from "react";
import {TileLayerType} from "../core/TileLayerType";

const TILE_LAYERS = [
  TileLayerType.PAPER, TileLayerType.SATELLITE, TileLayerType.STREET
];
const TILE_LAYER_TYPE_TO_IMG = new Map([
  [TileLayerType.PAPER, "paper-layer.png"],
  [TileLayerType.SATELLITE, "satellite-layer.png"],
  [TileLayerType.STREET, "street-layer.png"]
]);
const TILE_LAYER_TYPE_TO_ALT = new Map([
  [TileLayerType.PAPER, "paper"],
  [TileLayerType.SATELLITE, "satellite"],
  [TileLayerType.STREET, "street"]
]);

export default function TileLayerToolbar(props: {
  currentLayer: TileLayerType|undefined,
  onTileLayerToggle: (tileLayerType: TileLayerType) => void;
}) {

  const currentLayer = props.currentLayer || TileLayerType.STREET;

  const getOtherLayers = (currentLayer: TileLayerType) =>
    TILE_LAYERS.filter((layer) => layer !== currentLayer);

  const [tileLayers, setTileLayers] = useState<TileLayerType[]|undefined>(undefined);

  useEffect(() => {
    if (currentLayer !== undefined) {
      setTileLayers(_ => [currentLayer, ...getOtherLayers(currentLayer)])
    }
  }, [currentLayer]);

  return (
    <div className="w-auto h-auto absolute bottom-20 right-4 justify-items-end space-y-1">
      {
        tileLayers && currentLayer !== undefined && (
          <div
            key={currentLayer}
            className="w-24 h-24 shadow rounded drop-shadow-lg group relative"
          >
            <img
              src={'/assets/' + TILE_LAYER_TYPE_TO_IMG.get(currentLayer)}
              alt={TILE_LAYER_TYPE_TO_ALT.get(currentLayer)}
              className="h-full w-full object-cover rounded border border-4 border-gray-100"
            />
            <span
              className="
                w-max h-max absolute flex bottom-2 right-0 rounded-lg -z-10
                text-center text-white grid grid-cols-1 shadow drop-shadow-lg space-y-2
                transition-all ease-in-out opacity-0 pointer-events-none
                group-hover:transition-all group-hover:duration-300 group-hover:opacity-100
                group-hover:-translate-y-24 hover:-translate-y-24 group-hover:pointer-events-auto
              "
            >
              {
                tileLayers.slice().reverse().slice(0, -1).map((tileLayerType, i) => (
                  <button
                    key={tileLayerType}
                    className={`w-20 h-20 shadow rounded drop-shadow-lg right-0 hover:transition ease-in-out hover:-translate-y-1 hover:-translate-x-3 hover:scale-110 duration-100`}
                    onClick={() => props.onTileLayerToggle(tileLayerType)}
                  >
                    <img
                      src={'/assets/' + TILE_LAYER_TYPE_TO_IMG.get(tileLayerType)}
                      alt={TILE_LAYER_TYPE_TO_ALT.get(tileLayerType)}
                      className="h-full w-full object-cover rounded border border-4 border-gray-100"
                    />
                  </button>
                ))
              }
            </span>
          </div>
        )
      }
    </div>
  );

}