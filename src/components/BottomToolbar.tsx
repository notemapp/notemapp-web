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

  const buttonClassByDrawType = (thisDrawType: DrawType) => {
    const baseClass = "w-12 h-12 rounded flex justify-center items-center group relative";
    const activeClass = drawType === thisDrawType ? "bg-blue-500 text-white rounded" : "text-black";
    return baseClass + " " + activeClass;
  }
  const buttonClassByFreeHand = (freeHand: boolean) => {
    const baseClass = "w-12 h-12 rounded flex justify-center items-center group relative";
    const activeClass = freeHand ? "bg-blue-500 text-white rounded" : "text-black";
    return baseClass + " " + activeClass;
  }

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
          <button onClick={() => onDrawTypeChange(DrawType.None)} className={buttonClassByDrawType(DrawType.None)}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5"
                 stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round"
                    d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"/>
            </svg>
          </button>
          <button className="w-12 h-full rounded flex justify-center items-center group relative text-black">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5"
                 stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round"
                    d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125"/>
            </svg>
            <span
                className="
                w-auto absolute flex -left-0 -top-0 -translate-y-full bg-white rounded-lg
                text-center text-white text-sm h-auto w-auto grid grid-cols-1 invisible group-hover:visible
                "
            >
              <button onClick={() => onDrawTypeChange(DrawType.Line)} className={buttonClassByDrawType(DrawType.Line)}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5"
                     stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"/>
                </svg>
                <span className="w-auto absolute hidden group-hover:flex left-0 -translate-x-full px-2 py-2 bg-gray-600 rounded-lg text-center text-white text-sm">Line</span>
              </button>
              <button onClick={() => onDrawTypeChange(DrawType.Polygon)} className={buttonClassByDrawType(DrawType.Polygon)}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5"
                     stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round"
                        d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"/>
                </svg>
                <span className="w-auto absolute hidden group-hover:flex left-0 -translate-x-full px-2 py-2 bg-gray-600 rounded-lg text-center text-white text-sm">Polygon</span>
              </button>
              <button onClick={() => onDrawTypeChange(DrawType.Rectangle)} className={buttonClassByDrawType(DrawType.Rectangle)}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5"
                     stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round"
                        d="M5.25 7.5A2.25 2.25 0 017.5 5.25h9a2.25 2.25 0 012.25 2.25v9a2.25 2.25 0 01-2.25 2.25h-9a2.25 2.25 0 01-2.25-2.25v-9z"/>
                </svg>
                <span className="w-auto absolute hidden group-hover:flex left-0 -translate-x-full px-2 py-2 bg-gray-600 rounded-lg text-center text-white text-sm">Rectangle</span>
              </button>
              <button onClick={onFreeHandToggle} className={buttonClassByFreeHand(freeHand)}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5"
                     stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round"
                        d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"/>
                </svg>
                <span className="w-auto absolute hidden group-hover:flex left-0 -translate-x-full px-2 py-2 bg-gray-600 rounded-lg text-center text-white text-sm">Free hand mode</span>
              </button>
            </span>
          </button>
        </div>
        <div className="w-full h-full flex justify-end space-x-4">
          <button onClick={props.onUndo} className="w-12 h-full rounded flex justify-center items-center hover:bg-gray-300 group relative">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5"
                 stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3"/>
            </svg>
            <span className="w-auto absolute hidden group-hover:flex -left-0 -top-0 -translate-y-full px-2 py-2 bg-gray-600 rounded-lg text-center text-white text-sm">Undo</span>
          </button>
          <button onClick={props.onRedo} className="w-12 h-full rounded flex justify-center items-center hover:bg-gray-300 group relative">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5"
                 stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l6-6m0 0l-6-6m6 6H9a6 6 0 000 12h3"/>
            </svg>
            <span className="w-auto absolute hidden group-hover:flex -left-0 -top-0 -translate-y-full px-2 py-2 bg-gray-600 rounded-lg text-center text-white text-sm">Redo</span>
          </button>
        </div>
      </div>
    </div>
  );

}