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

  const buttonStaticClass =
    "w-12 h-12 rounded flex justify-center items-center group relative bg-gray-100 hover:bg-gray-300";
  const buttonDynamicClass = (isActive: boolean) => {
    const dynamicClass =
      isActive ? "bg-yellow-600 text-white hover:bg-yellow-600 hover:text-white" : "bg-gray-100 text-black";
    return `${buttonStaticClass} ${dynamicClass}`;
  }
  const buttonClassByInteractionType = (thisInteractionType: InteractionType) =>
      buttonDynamicClass(interactionType === thisInteractionType);
  const buttonClassByFreeHand = (isFreeHand: boolean) =>
      buttonDynamicClass(isFreeHand);
  const drawInteractionButtonClass = (thisDrawType: InteractionType) =>
      buttonDynamicClass(DRAW_INTERACTIONS.includes(thisDrawType));

  const onInteractionTypeChange = (type: InteractionType) => {
    props.onInteractionTypeChange(type);
    setInteractionType(type);
    if (DRAW_INTERACTIONS.includes(type)) {
      // Save last draw interaction to restore it when switching back to draw mode:
      setLastDrawInteraction({type, isFreeHand} as DrawInteraction);
    }
  }
  const onDrawInteractionClick = () => {
    onInteractionTypeChange(lastDrawInteraction.type);
    onFreeHandToggle(lastDrawInteraction.isFreeHand);
  }
  const onFreeHandToggle = (isActive: boolean) => {
    props.onFreeHandToggle(isActive);
    setFreeHand(isActive);
  }

  return (
    <div className="w-full h-12 absolute bottom-4 left-0 bg-none px-4">
      <div className="w-full h-full flex justify-between">
        <div className="w-full h-full flex justify-start space-x-2">
          <button
              onClick={() => onInteractionTypeChange(InteractionType.None)}
              className={`${buttonClassByInteractionType(InteractionType.None)} shadow drop-shadow-lg z-10`}>
            <svg className="w-6 h-6" strokeWidth="1.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 14.571l-1.823-1.736a1.558 1.558 0 00-2.247.103v0a1.558 1.558 0 00.035 2.092l5.942 6.338c.379.403.906.632 1.459.632H16c2.4 0 4-2 4-4 0 0 0 0 0 0V9.429" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path><path d="M17 10v-.571c0-2.286 3-2.286 3 0M14 10V8.286C14 6 17 6 17 8.286V10M11 10V7.5c0-2.286 3-2.286 3 0 0 0 0 0 0 0V10M8 14.571V3.5A1.5 1.5 0 019.5 2v0c.828 0 1.5.67 1.5 1.499V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path></svg>
          </button>
          <div className="group relative">
            <button
              onClick={onDrawInteractionClick}
              className={`${drawInteractionButtonClass(interactionType)} shadow drop-shadow-lg z-10`}
            >
              <svg className="w-6 h-6" strokeWidth="1.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13.02 5.828L15.85 3l4.949 4.95-2.829 2.828m-4.95-4.95l-9.606 9.607a1 1 0 00-.293.707v4.536h4.536a1 1 0 00.707-.293l9.606-9.607m-4.95-4.95l4.95 4.95" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path></svg>
            </button>
            <span
                className="
                w-max h-auto absolute flex bottom-0 left-1/2 -translate-x-1/2 z-0 bg-white rounded-lg
                text-center text-white grid grid-cols-1 shadow drop-shadow-lg
                transition-all ease-in-out opacity-0 pointer-events-none
                group-hover:transition-all group-hover:duration-500 group-hover:opacity-100
                group-hover:-translate-y-14 hover:-translate-y-14 group-hover:pointer-events-auto
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
              className={`${buttonClassByInteractionType(InteractionType.Marker)} shadow drop-shadow-lg`}>
            <svg className="w-6 h-6" strokeWidth="1.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 14h8M8 10h2M8 18h4M10 3H6a2 2 0 00-2 2v15a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2h-3.5M10 3V1m0 2v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path></svg>
          </button>
          <button
              onClick={() => onInteractionTypeChange(InteractionType.Select)}
              className={`${buttonClassByInteractionType(InteractionType.Select)} shadow drop-shadow-lg`}>
            <svg className="w-6 h-6" viewBox="0 0 24 24" strokeWidth="1.5" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4.998 2H2v2.998h2.998V2zM4.999 3.501h14M3.5 4.999V19M20.498 5v14.002M4.999 20.501h14M4.998 19H2v2.998h2.998V19zM21.997 2.002H19V5h2.998V2.002zM21.997 19.002H19V22h2.998v-2.998z" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="1.5" strokeLinecap="round" strokeLinejoin="round"></path><path clipRule="evenodd" d="M10.997 15.002l-3-7 7 3-2.998.999-1.002 3.001z" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="1.5" strokeLinecap="round" strokeLinejoin="round"></path><path clipRule="evenodd" d="M11.999 12.002l2.998 3-2.998-3z" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="1.5" strokeLinecap="round" strokeLinejoin="round"></path></svg>
          </button>
        </div>
        <div className="w-auto h-full flex justify-end rounded shadow drop-shadow-lg">
          <button
              onClick={props.onUndo}
              className={`${buttonStaticClass} rounded-r-none`}>
            <svg className="w-6 h-6" strokeWidth="1.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 7v5M7.875 9.5h7c5.5 0 5.5 8.5 0 8.5h-10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path><path d="M11.375 13l-3.5-3.5 3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path></svg>
          </button>
          <button
              onClick={props.onRedo}
              className={`${buttonStaticClass} rounded-l-none`}>
            <svg className="w-6 h-6" strokeWidth="1.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M19 7v5M16 9.5H9C3.5 9.5 3.5 18 9 18h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path><path d="M12.5 13L16 9.5 12.5 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path></svg>
          </button>
        </div>
      </div>
    </div>
  );

}