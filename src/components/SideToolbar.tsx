import {useState} from "react";

export default function SideToolbar(props: {
  onLocate: () => void
}) {

  const [tracking, setTracking] = useState<boolean>(false);
  const onLocate = () => {
    props.onLocate();
    setTracking(true);
  }

  const buttonClass = tracking ? "bg-blue-500 text-white rounded" : "";

  return (
    <div className="absolute top-0 right-0 w-12 h-auto bg-white">
      <div className="w-full h-full flex justify-between py-4">
        <button className={buttonClass} onClick={onLocate}>Pos</button>
      </div>
    </div>
  );

}