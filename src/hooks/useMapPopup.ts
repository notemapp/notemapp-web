import {useEffect, useRef} from "react";
import {Map, Overlay} from "ol";

const useMapPopup = () => {

  const popupOverlayRef = useRef<Overlay>();
  const popupContentRef = useRef<HTMLDivElement>(null);
  const popupContainerRef = useRef<HTMLDivElement>(null);
  const popupCloserRef = useRef<HTMLAnchorElement>(null);

  function initMapPopup(map: Map): void {

    if (!popupOverlayRef.current) {

      popupOverlayRef.current = new Overlay({
        element: popupContainerRef.current || undefined,
        autoPan: {
          animation: {
            duration: 250,
          }
        }
      });

    }

    map.addOverlay(popupOverlayRef.current);

  }

  useEffect(() => {
    if (popupContainerRef.current && popupCloserRef.current && popupContentRef.current) {
      popupCloserRef.current.onclick = function () {
        popupOverlayRef.current?.setPosition(undefined);
        popupCloserRef.current?.blur();
        return false;
      };
    }
  }, []);

  return {popupOverlayRef, popupContainerRef, popupContentRef, popupCloserRef, initMapPopup};

};

export default useMapPopup;