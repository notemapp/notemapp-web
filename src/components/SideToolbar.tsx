import {useState} from "react";

export default function SideToolbar(props: {
  onLocate: () => void
}) {

  const [tracking, setTracking] = useState<boolean>(false);
  const onLocate = () => {
    props.onLocate();
    setTracking(true);
  }

  const buttonClass = tracking ? "bg-blue-500" : "text-black";

  return (
    <div className="absolute top-12 right-0 w-12 h-auto bg-white rounded">
      <div className="w-full h-full flex justify-between py-0">
        <button className={"text-white rounded w-full h-12 flex justify-center items-center group relative " + buttonClass} onClick={onLocate}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5"
               stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"/>
            <path strokeLinecap="round" strokeLinejoin="round"
                  d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"/>
          </svg>
          <span className="w-auto absolute hidden group-hover:flex left-0 -translate-x-full px-2 py-2 bg-gray-600 rounded-lg text-center text-white text-sm">Locate</span>
        </button>
      </div>
    </div>
  );

}