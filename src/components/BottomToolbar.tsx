import {useState} from "react";
import {DRAW_INTERACTIONS, InteractionType} from "../core/InteractionType";

export function BottomToolbar(props: {
  interactionType: InteractionType,
  isFreeHand: boolean,
  onFreeHandToggle: () => void,
  onInteractionTypeChange: (type: InteractionType) => void,
  onUndo: () => void,
  onRedo: () => void
}) {

  const [interactionType, setInteractionType] = useState<InteractionType>(props.interactionType);
  const [isFreeHand, setFreeHand] = useState<boolean>(props.isFreeHand);

  const buttonStaticClass = "w-12 h-12 rounded flex justify-center items-center group relative hover:bg-gray-300";
  const buttonDynamicClass = (isActive: boolean) => {
    const dynamicClass = isActive ? "bg-blue-500 text-white hover:bg-blue-500 hover:text-white" : "text-black";
    return `${buttonStaticClass} ${dynamicClass}`;
  }
  const buttonClassByInteractionType = (thisInteractionType: InteractionType) =>
      buttonDynamicClass(interactionType === thisInteractionType);
  const buttonClassByFreeHand = () =>
      buttonDynamicClass(isFreeHand);
  const drawToolbarClassByInteractionType = (thisDrawType: InteractionType) =>
      buttonDynamicClass(DRAW_INTERACTIONS.includes(thisDrawType));

  const onDrawTypeChange = (type: InteractionType) => {
    props.onInteractionTypeChange(type);
    setInteractionType(type);
  }
  const onFreeHandToggle = () => {
    props.onFreeHandToggle();
    setFreeHand(!isFreeHand);
  }

  return (
    <div className="absolute bottom-0 left-0 h-12 w-full bg-white">
      <div className="w-full h-full flex justify-between px-4">
        <div className="w-full h-full flex justify-start">
          <button
              onClick={() => onDrawTypeChange(InteractionType.None)}
              className={buttonClassByInteractionType(InteractionType.None)}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.05 4.575a1.575 1.575 0 10-3.15 0v3m3.15-3v-1.5a1.575 1.575 0 013.15 0v1.5m-3.15 0l.075 5.925m3.075.75V4.575m0 0a1.575 1.575 0 013.15 0V15M6.9 7.575a1.575 1.575 0 10-3.15 0v8.175a6.75 6.75 0 006.75 6.75h2.018a5.25 5.25 0 003.712-1.538l1.732-1.732a5.25 5.25 0 001.538-3.712l.003-2.024a.668.668 0 01.198-.471 1.575 1.575 0 10-2.228-2.228 3.818 3.818 0 00-1.12 2.687M6.9 7.575V12m6.27 4.318A4.49 4.49 0 0116.35 15m.002 0h-.002"/>
            </svg>
          </button>
          <div className={drawToolbarClassByInteractionType(interactionType)}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125"/>
            </svg>
            <span
                className="
                h-auto w-auto absolute flex -left-0 -top-0 -translate-y-full bg-white rounded-lg
                text-center text-white grid grid-cols-1 invisible group-hover:visible
                "
            >
              <button
                  onClick={() => onDrawTypeChange(InteractionType.Line)}
                  className={buttonClassByInteractionType(InteractionType.Line)}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"/>
                </svg>
                <span className="w-auto absolute hidden group-hover:flex right-0 translate-x-full px-2 py-2 bg-gray-600 rounded-lg text-center text-white text-sm">Line</span>
              </button>
              <button
                  onClick={() => onDrawTypeChange(InteractionType.Polygon)}
                  className={buttonClassByInteractionType(InteractionType.Polygon)}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"/>
                </svg>
                <span className="w-auto absolute hidden group-hover:flex right-0 translate-x-full px-2 py-2 bg-gray-600 rounded-lg text-center text-white text-sm">Polygon</span>
              </button>
              <button
                  onClick={() => onDrawTypeChange(InteractionType.Rectangle)}
                  className={buttonClassByInteractionType(InteractionType.Rectangle)}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 7.5A2.25 2.25 0 017.5 5.25h9a2.25 2.25 0 012.25 2.25v9a2.25 2.25 0 01-2.25 2.25h-9a2.25 2.25 0 01-2.25-2.25v-9z"/>
                </svg>
                <span className="w-auto absolute hidden group-hover:flex right-0 translate-x-full px-2 py-2 bg-gray-600 rounded-lg text-center text-white text-sm">Rectangle</span>
              </button>
              <button
                  onClick={onFreeHandToggle}
                  className={buttonClassByFreeHand()}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"/>
                </svg>
                <span className="w-auto absolute hidden group-hover:flex right-0 translate-x-full px-2 py-2 bg-gray-600 rounded-lg text-center text-white text-sm">Free hand mode</span>
              </button>
            </span>
          </div>
          <button
              onClick={() => onDrawTypeChange(InteractionType.Marker)}
              className={buttonClassByInteractionType(InteractionType.Marker)}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"/>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"/>
            </svg>
          </button>
          <button
              onClick={() => onDrawTypeChange(InteractionType.Select)}
              className={buttonClassByInteractionType(InteractionType.Select)}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zM12 2.25V4.5m5.834.166l-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243l-1.59-1.59"/>
            </svg>
          </button>
        </div>
        <div className="w-full h-full flex justify-end space-x-4">
          <button
              onClick={props.onUndo}
              className={buttonStaticClass}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3"/>
            </svg>
            <span className="w-auto absolute hidden group-hover:flex -left-0 -top-0 -translate-y-full px-2 py-2 bg-gray-600 rounded-lg text-center text-white text-sm z-10">Undo</span>
          </button>
          <button
              onClick={props.onRedo}
              className={buttonStaticClass}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l6-6m0 0l-6-6m6 6H9a6 6 0 000 12h3"/>
            </svg>
            <span className="w-auto absolute hidden group-hover:flex -left-0 -top-0 -translate-y-full px-2 py-2 bg-gray-600 rounded-lg text-center text-white text-sm z-10">Redo</span>
          </button>
        </div>
      </div>
    </div>
  );

}