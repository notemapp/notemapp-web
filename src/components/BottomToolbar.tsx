import {DrawType} from "../core/DrawType";
import {useState} from "react";

export function BottomToolbar(props: {
  drawType: DrawType,
  freeHand: boolean,
  onFreeHandToggle: () => void,
  onDrawTypeChange: (type: DrawType) => void,
  onUndo: () => void,
  onRedo: () => void
}) {

  const [drawType, setDrawType] = useState<DrawType>(props.drawType);
  const [freeHand, setFreeHand] = useState<boolean>(props.freeHand);

  const buttonClass = (thisDrawType: DrawType) =>
    drawType === thisDrawType ? "bg-blue-500 text-white rounded" : "";

  const onDrawTypeChange = (type: DrawType) => {
    props.onDrawTypeChange(type);
    setDrawType(type);
  }
  const onFreeHandToggle = () => {
    props.onFreeHandToggle();
    setFreeHand(!freeHand);
  }

  return (
    <div className="absolute bottom-0 left-0 h-12 w-full bg-white">
      <div className="w-full h-full flex justify-between px-4">
        <div className="w-full h-full flex justify-between">
          <button onClick={() => onDrawTypeChange(DrawType.None)} className={buttonClass(DrawType.None)}>Move</button>
          <button onClick={() => onDrawTypeChange(DrawType.Line)} className={buttonClass(DrawType.Line)}>Line</button>
          <button onClick={() => onDrawTypeChange(DrawType.Polygon)} className={buttonClass(DrawType.Polygon)}>Polygon</button>
          <button onClick={() => onDrawTypeChange(DrawType.Rectangle)} className={buttonClass(DrawType.Rectangle)}>Rectangle</button>
          <button>
            <label htmlFor="free-hand-toggle" className="inline-flex relative items-center cursor-pointer">
              <input type="checkbox" value="" id="free-hand-toggle" className="sr-only peer" defaultChecked={freeHand} onClick={onFreeHandToggle}/>
              <div
                className="w-11 h-6 peer-focus:outline-none peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800
                rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white
                after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300
                after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600
                peer-checked:bg-blue-600">
              </div>
            </label>
          </button>
          {/*<button>Annotation</button>*/}
          {/*<button>Measure</button>*/}
        </div>
        <div className="w-full h-full flex justify-end space-x-4">
          <button onClick={props.onUndo}>Undo</button>
          <button onClick={props.onRedo}>Redo</button>
        </div>
      </div>
    </div>
  );

}