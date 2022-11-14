import {useNavigate} from "react-router-dom";

export default function Navbar() {

  const navigate = useNavigate();

  return (
    <div className="absolute top-0 left-0 h-12 w-full bg-white z-10">
      <div className="w-full h-full flex justify-left px-4">
        <button onClick={() => navigate('/')}>
          Back
        </button>
      </div>
    </div>
  );

}