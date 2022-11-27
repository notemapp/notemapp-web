import {useEffect, useRef} from "react";
import {Map, Overlay} from "ol";
import {EventsKey} from "ol/events";

const useMapPopup = () => {

  const popupOverlayRef = useRef<Overlay>();
  const popupContentRef = useRef<HTMLDivElement>();
  const popupContainerRef = useRef<HTMLDivElement>();
  const popupCloserRef = useRef<HTMLAnchorElement>();

  const mapInteractionKeys = useRef<EventsKey[]>([]);

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

    mapInteractionKeys.current.push(
      map.on('click', function (evt) {
        const feature = map.forEachFeatureAtPixel(evt.pixel, function (feature) {
          return feature;
        });
        popupOverlayRef.current?.setPosition(undefined);
        if (!feature || !feature.get("label")) {
          return;
        }
        popupOverlayRef.current?.setPosition(evt.coordinate);
        if (popupContentRef.current) popupContentRef.current.innerHTML = `<p>${feature?.get("label")}</p>`;
      })
    );

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

  return {popupOverlayRef, popupContainerRef, popupCloserRef, initMapPopup};

};

export default useMapPopup;