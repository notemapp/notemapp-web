export default function HomePageNavbar(props: {
  onOpenDrawer: () => void;
}) {

  return (
    <div className="w-full h-auto p-4 bg-white">
      <div className="w-full h-12 flex justify-center px-0 relative">
        <div className="w-12 h-12 flex bg-white">
          <img src="/assets/logo768.svg" alt="notemapp logo" className="w-12 h-12 m-auto" />
        </div>
        <button
          onClick={props.onOpenDrawer}
          className="
            absolute top-0 right-0
            w-12 h-full rounded flex justify-center items-center
            bg-gray-100 hover:bg-gray-300
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