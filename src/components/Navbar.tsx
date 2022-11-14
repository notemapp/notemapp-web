import {useNavigate} from "react-router-dom";

export default function Navbar() {

  const navigate = useNavigate();

  return (
    <div className="absolute top-0 left-0 h-12 w-full bg-white z-10">
      <div className="w-full h-full flex justify-left px-0">
        <button
          onClick={() => navigate('/')}
          className="w-12 h-full rounded flex justify-center items-center hover:bg-gray-300 group relative"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5"
               stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15m0 0l6.75 6.75M4.5 12l6.75-6.75"/>
          </svg>
          <span className="w-auto absolute hidden group-hover:flex -left-0 -bottom-0 translate-y-full px-2 py-2 bg-gray-600 rounded-lg text-center text-white text-sm">Back</span>
        </button>
      </div>
    </div>
  );

}