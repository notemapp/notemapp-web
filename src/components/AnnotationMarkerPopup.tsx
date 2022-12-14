import {RefObject} from "react";

export default function AnnotationMarkerPopup(props: {
  popupRef: {
    popupContainerRef: RefObject<HTMLDivElement>,
    popupCloserRef: RefObject<HTMLDivElement>,
    popupContentRef: RefObject<HTMLDivElement>,
  }
}) {

  return (
    <div
      ref={props.popupRef.popupContainerRef}
      className="w-80 max-h-96 bottom-0 left-0 absolute bg-white p-2 rounded-lg drop-shadow-lg"
    >
      <div className="w-full h-auto flex justify-end pb-2">
        <div
          ref={props.popupRef.popupCloserRef}
          className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-gray-200 hover:text-white"
        >
          <svg className="w-6 h-6" strokeWidth="1.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M6.758 17.243L12.001 12m5.243-5.243L12 12m0 0L6.758 6.757M12.001 12l5.243 5.243"
              stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
      <div
        ref={props.popupRef.popupContentRef}
        className="w-full max-h-80 overflow-auto"
      />
    </div>
  );

}