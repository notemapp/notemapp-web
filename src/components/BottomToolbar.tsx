import {useState} from "react";
import {DRAW_INTERACTIONS, InteractionType} from "../core/InteractionType";

interface DrawInteraction {
  type: InteractionType;
  isFreeHand: boolean;
}

export function BottomToolbar(props: {
  interactionType: InteractionType,
  isFreeHand: boolean,
  onInteractionTypeChange: (type: InteractionType) => void,
  onFreeHandToggle: (isActive: boolean) => void,
  onUndo: () => void,
  onRedo: () => void
}) {

  const [interactionType, setInteractionType] = useState<InteractionType>(props.interactionType);
  const [isFreeHand, setFreeHand] = useState<boolean>(props.isFreeHand);
  const [lastDrawInteraction, setLastDrawInteraction] =
    useState<DrawInteraction>({type: InteractionType.Line, isFreeHand: props.isFreeHand} as DrawInteraction);

  const buttonStaticClass = "w-12 h-12 rounded flex justify-center items-center group relative hover:bg-gray-300";
  const buttonDynamicClass = (isActive: boolean) => {
    const dynamicClass = isActive ? "bg-gray-500 text-white hover:bg-gray-500 hover:text-white" : "bg-gray-200 text-black";
    return `${buttonStaticClass} ${dynamicClass}`;
  }
  const buttonClassByInteractionType = (thisInteractionType: InteractionType) =>
      buttonDynamicClass(interactionType === thisInteractionType);
  const buttonClassByFreeHand = (isFreeHand: boolean) =>
      buttonDynamicClass(isFreeHand);
  const drawToolbarClassByInteractionType = (thisDrawType: InteractionType) =>
      buttonDynamicClass(DRAW_INTERACTIONS.includes(thisDrawType));

  const onInteractionTypeChange = (type: InteractionType) => {
    props.onInteractionTypeChange(type);
    setInteractionType(type);
    if (DRAW_INTERACTIONS.includes(type)) {
      setLastDrawInteraction({type, isFreeHand} as DrawInteraction);
    }
  }
  const onDrawInteractionClick = () => {
    onInteractionTypeChange(lastDrawInteraction.type);
    onFreeHandToggle(lastDrawInteraction.isFreeHand);
    console.log("onDrawInteractionClick", lastDrawInteraction);
  }
  const onFreeHandToggle = (isActive: boolean) => {
    props.onFreeHandToggle(isActive);
    setFreeHand(isActive);
  }

  return (
    <div className="absolute bottom-0 left-0 h-12 w-full bg-white">
      <div className="w-full h-full flex justify-between px-4">
        <div className="w-full h-full flex justify-start">
          <button
              onClick={() => onInteractionTypeChange(InteractionType.None)}
              className={buttonClassByInteractionType(InteractionType.None)}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.05 4.575a1.575 1.575 0 10-3.15 0v3m3.15-3v-1.5a1.575 1.575 0 013.15 0v1.5m-3.15 0l.075 5.925m3.075.75V4.575m0 0a1.575 1.575 0 013.15 0V15M6.9 7.575a1.575 1.575 0 10-3.15 0v8.175a6.75 6.75 0 006.75 6.75h2.018a5.25 5.25 0 003.712-1.538l1.732-1.732a5.25 5.25 0 001.538-3.712l.003-2.024a.668.668 0 01.198-.471 1.575 1.575 0 10-2.228-2.228 3.818 3.818 0 00-1.12 2.687M6.9 7.575V12m6.27 4.318A4.49 4.49 0 0116.35 15m.002 0h-.002"/>
            </svg>
          </button>
          <div className="group relative">
            <button
              onClick={onDrawInteractionClick}
              className={drawToolbarClassByInteractionType(interactionType)}
            >
              <svg className="w-6 h-6" strokeWidth="1.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13.02 5.828L15.85 3l4.949 4.95-2.829 2.828m-4.95-4.95l-9.606 9.607a1 1 0 00-.293.707v4.536h4.536a1 1 0 00.707-.293l9.606-9.607m-4.95-4.95l4.95 4.95" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path></svg>
            </button>
            <span
                className="
                h-auto w-max absolute flex -left-1/2 -top-0 -translate-y-full bg-white rounded-lg
                text-center text-white grid grid-cols-1 invisible group-hover:visible shadow drop-shadow-2xl
                "
            >
              <div className="grid gap-2 p-3">
                <div className="grid grid-cols-2">
                  <button
                    onClick={() => onFreeHandToggle(true)}
                    className={`${buttonClassByFreeHand(isFreeHand)} rounded-r-none`}>
                    <svg className="w-6 h-6" strokeWidth="1.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 20c8 0 10-16 18-16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path></svg>
                  </button>
                  <button
                    onClick={() => onFreeHandToggle(false)}
                    className={`${buttonClassByFreeHand(!isFreeHand)} rounded-l-none`}>
                    <svg className="w-6 h-6" viewBox="0 0 24 24" strokeWidth="1.5" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 21V3.6a.6.6 0 01.6-.6H21" stroke="currentColor" strokeWidth="1.5"></path><path d="M17 21h3.4a.6.6 0 00.6-.6V17M21 7v2M21 12v2M7 21h2M12 21h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path><path d="M3 4a1 1 0 100-2 1 1 0 000 2zM3 22a1 1 0 100-2 1 1 0 000 2zM21 4a1 1 0 100-2 1 1 0 000 2z" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path></svg>
                  </button>
                </div>
                <div className="w-full grid flex justify-center">
                  <button
                    onClick={() => onInteractionTypeChange(InteractionType.Line)}
                    className={`${buttonClassByInteractionType(InteractionType.Line)} rounded-b-none`}>
                    <svg className="w-6 h-6" strokeWidth="1.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 20L21 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path></svg>
                  </button>
                  <button
                    onClick={() => onInteractionTypeChange(InteractionType.Polygon)}
                    className={`${buttonClassByInteractionType(InteractionType.Polygon)} rounded-t-none rounded-b-none`}>
                    <svg className="w-6 h-6" strokeWidth="1.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8.587 8.236l2.598-5.232a.911.911 0 011.63 0l2.598 5.232 5.808.844a.902.902 0 01.503 1.542l-4.202 4.07.992 5.75c.127.738-.653 1.3-1.32.952L12 18.678l-5.195 2.716c-.666.349-1.446-.214-1.319-.953l.992-5.75-4.202-4.07a.902.902 0 01.503-1.54l5.808-.845z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path></svg>
                  </button>
                  <button
                    onClick={() => onInteractionTypeChange(InteractionType.Rectangle)}
                    className={`${buttonClassByInteractionType(InteractionType.Rectangle)} rounded-t-none`}>
                    <svg className="w-6 h-6" strokeWidth="1.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 3.6v16.8a.6.6 0 01-.6.6H3.6a.6.6 0 01-.6-.6V3.6a.6.6 0 01.6-.6h16.8a.6.6 0 01.6.6z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path></svg>
                  </button>
                </div>
              </div>
            </span>
          </div>
          <button
              onClick={() => onInteractionTypeChange(InteractionType.Marker)}
              className={buttonClassByInteractionType(InteractionType.Marker)}>
            <svg className="w-6 h-6" strokeWidth="1.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 14h8M8 10h2M8 18h4M10 3H6a2 2 0 00-2 2v15a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2h-3.5M10 3V1m0 2v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path></svg>
          </button>
          <button
              onClick={() => onInteractionTypeChange(InteractionType.Select)}
              className={buttonClassByInteractionType(InteractionType.Select)}>
            <svg className="w-6 h-6" viewBox="0 0 24 24" strokeWidth="1.5" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4.998 2H2v2.998h2.998V2zM4.999 3.501h14M3.5 4.999V19M20.498 5v14.002M4.999 20.501h14M4.998 19H2v2.998h2.998V19zM21.997 2.002H19V5h2.998V2.002zM21.997 19.002H19V22h2.998v-2.998z" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="1.5" strokeLinecap="round" strokeLinejoin="round"></path><path clipRule="evenodd" d="M10.997 15.002l-3-7 7 3-2.998.999-1.002 3.001z" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="1.5" strokeLinecap="round" strokeLinejoin="round"></path><path clipRule="evenodd" d="M11.999 12.002l2.998 3-2.998-3z" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="1.5" strokeLinecap="round" strokeLinejoin="round"></path></svg>
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