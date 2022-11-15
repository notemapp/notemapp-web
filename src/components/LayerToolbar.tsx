import {TileLayerType} from "../core/TileLayerType";

export default function LayerToolbar(props: {
  onTileLayerToggle: (tileLayerType: TileLayerType) => void;
}) {

  return (
    <div className="absolute bottom-12 right-0 h-auto w-12 bg-white">
      <div className="w-full h-full px-0">
        <button onClick={() => props.onTileLayerToggle(TileLayerType.BW)}>Draw</button>
        <button onClick={() => props.onTileLayerToggle(TileLayerType.STREET)}>Street</button>
        <button onClick={() => props.onTileLayerToggle(TileLayerType.SATELLITE)}>Mount</button>
      </div>
    </div>
  );

}