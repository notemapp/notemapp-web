import {useNavigate} from "react-router-dom";

export default function MapPageNavbar(props: {
  title: string|undefined;
  onOpenDrawer: () => void;
}) {

  const navigate = useNavigate();

  return (
    <div className="w-full h-12 absolute top-4 left-0 px-4 bg-none z-10">
      <div className="w-full h-full flex justify-between px-0">
        <button
          onClick={() => navigate('/')}
          className="
            w-12 h-full rounded flex justify-center items-center
            bg-gray-100 hover:bg-gray-300 shadow drop-shadow-lg z-10
          "
        >
          <svg className="w-6 h-6" strokeWidth="1.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18.5 12H6m0 0l6-6m-6 6l6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div
          className="
            w-56 h-12 flex bg-gray-100 font-semibold text-black rounded-lg shadow drop-shadow-lg z-10
          ">
          <p className="w-full h-fit px-2 text-center m-auto truncate overflow-hidden">{props.title}</p>
        </div>
        <button
          onClick={props.onOpenDrawer}
          className="
            w-12 h-full rounded flex justify-center items-center
            bg-gray-100 hover:bg-gray-300 shadow drop-shadow-lg z-10
          "
        >
          <svg className="w-6 h-6" strokeWidth="1.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" color="currentColor">
            <path d="M3 5h18M3 12h18M3 19h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  );

}