import {TileLayerType} from "../core/TileLayerType";
import {useState} from "react";

export default function LayerToolbar(props: {
  onTileLayerToggle: (tileLayerType: TileLayerType) => void;
}) {

  const [tileLayers, setTileLayers] = useState<TileLayerType[]>([
    TileLayerType.BW, TileLayerType.SATELLITE, TileLayerType.STREET
  ]);

  const onTileLayerToggle = (tileLayerType: TileLayerType) => {
    setTileLayers(oldTileLayers => [tileLayerType, ...oldTileLayers.filter(t => t !== tileLayerType)])
    props.onTileLayerToggle(tileLayerType);
  }

  const tileLayerTypeToImage = new Map([
    [TileLayerType.BW, "layer-1.png"],
    [TileLayerType.SATELLITE, "layer-3.png"],
    [TileLayerType.STREET, "layer-2.png"]
  ]);

  const tileLayerTypeToAlt = new Map([
    [TileLayerType.BW, "black and white"],
    [TileLayerType.SATELLITE, "satellite"],
    [TileLayerType.STREET, "street"]
  ]);

  return (
    <div className="absolute bottom-20 right-0 h-auto w-auto grid grid-cols-1 justify-items-end space-y-1">
      {
        tileLayers.slice().reverse().slice(0, -1).map(tileLayerType => (
          <button
            key={tileLayerType}
            className="w-20 h-20"
            onClick={() => onTileLayerToggle(tileLayerType)}
          >
            <img
              src={'/assets/' + tileLayerTypeToImage.get(tileLayerType)}
              alt={tileLayerTypeToAlt.get(tileLayerType)}
              className="h-full w-full object-cover rounded-lg border border-black"
            />
          </button>
        ))
      }
      {
        tileLayers && (
          <button
            key={tileLayers[0]}
            className="w-28 h-28"
            onClick={() => onTileLayerToggle(tileLayers[0])}
          >
            <img
              src={'/assets/' + tileLayerTypeToImage.get(tileLayers[0])}
              alt={tileLayerTypeToAlt.get(tileLayers[0])}
              className="h-full w-full object-cover rounded-lg border border-black"
            />
          </button>
        )
      }
    </div>
  );

}