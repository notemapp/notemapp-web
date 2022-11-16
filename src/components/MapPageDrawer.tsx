import Drawer from "./Drawer";

export default function MapPageDrawer(props: {
  isOpen: boolean,
  setOpen: (isOpen: boolean) => void,
  onSaveAsImageClick: () => void,
  onImportClick: () => void,
  onExportClick: () => void,
}) {

  return (
    <Drawer isOpen={props.isOpen} setOpen={props.setOpen}>

      <div className="p-4 space-y-2">
        <button
          className="p-4 flex space-x-2 justify-center bg-gray-200 hover:bg-gray-300 rounded"
          onClick={props.onSaveAsImageClick}
        >
          <span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5"
                 stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round"
                    d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"/>
            </svg>
          </span>
          <span>Save as image</span>
        </button>
        <button
          className="p-4 flex space-x-2 justify-center bg-gray-200 hover:bg-gray-300 rounded"
          onClick={props.onImportClick}
        >
          <span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5"
                 stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round"
                    d="M9 8.25H7.5a2.25 2.25 0 00-2.25 2.25v9a2.25 2.25 0 002.25 2.25h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25H15M9 12l3 3m0 0l3-3m-3 3V2.25"/>
            </svg>
          </span>
          <span>Import GeoJSON</span>
        </button>
        <button
          className="p-4 flex space-x-2 justify-center bg-gray-200 hover:bg-gray-300 rounded"
          onClick={props.onExportClick}
        >
          <span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5"
                 stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round"
                    d="M9 8.25H7.5a2.25 2.25 0 00-2.25 2.25v9a2.25 2.25 0 002.25 2.25h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25H15m0-3l-3-3m0 0l-3 3m3-3V15"/>
            </svg>
          </span>
          <span>Export as GeoJSON</span>
        </button>
      </div>

    </Drawer>
  );

}