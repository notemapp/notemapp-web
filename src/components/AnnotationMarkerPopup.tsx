import {RefObject} from "react";

export default function AnnotationMarkerPopup(props: {
  popupRef: {
    popupContainerRef: RefObject<HTMLDivElement>,
    popupCloserRef: RefObject<HTMLAnchorElement>,
    popupContentRef: RefObject<HTMLDivElement>,
  }
}) {

  return (
    <div
      ref={props.popupRef.popupContainerRef}
      className="w-80 h-auto bottom-0 left-0 absolute bg-white p-4 rounded-lg drop-shadow-lg"
    >
      <a
        href="#"
        ref={props.popupRef.popupCloserRef}
        className="w-6 h-6 absolute top-0 right-0 m-2 rounded-full flex items-center justify-center hover:bg-gray-200"
      >
        <svg className="text-black w-6 h-6" strokeWidth="1.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.758 17.243L12.001 12m5.243-5.243L12 12m0 0L6.758 6.757M12.001 12l5.243 5.243" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path></svg>
      </a>
      <div ref={props.popupRef.popupContentRef}></div>
    </div>
  );

}