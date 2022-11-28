import {useState} from "react";

export default function SideToolbar(props: {
  onLocate: () => void,
  onDeleteFeature: () => void,
  selectedFeature: boolean
}) {

  const [isTracking, setIsTracking] = useState<boolean>(false);
  const onLocate = () => {
    props.onLocate();
    setIsTracking(true);
  };

  return (
    <div className="w-12 h-auto absolute top-20 right-4 bg-none">
      <div className="w-full h-full flex justify-between py-0 grid grid-cols-1">
        <button
          className="
            w-12 h-12 rounded flex justify-center items-center group relative bg-gray-100 hover:bg-gray-300
            shadow drop-shadow-lg
          "
          onClick={onLocate}
        >
          <svg className={`w-6 h-6 ${isTracking ? 'text-blue-600' : 'text-black'}`} strokeWidth="1.5"
               viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 19a7 7 0 100-14 7 7 0 000 14zM12 19v2M5 12H3M12 5V3M19 12h2" stroke="currentColor"
                  strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        {
          props.selectedFeature &&
          <button
            className="
              w-12 h-12 rounded flex justify-center items-center group relative bg-gray-100 hover:bg-gray-300
              shadow drop-shadow-lg mt-2 animate-pulse
            "
            onClick={props.onDeleteFeature}
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" strokeWidth="1.5" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 9l-1.995 11.346A2 2 0 0116.035 22h-8.07a2 2 0 01-1.97-1.654L4 9M21 6h-5.625M3 6h5.625m0 0V4a2 2 0 012-2h2.75a2 2 0 012 2v2m-6.75 0h6.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
            </svg>
          </button>
        }
      </div>
    </div>
  );

}