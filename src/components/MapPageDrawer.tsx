import SideDrawer from "./SideDrawer";

export default function MapPageDrawer(props: {
  isOpen: boolean,
  onClose: () => void,
  onExportAsImage: () => void,
  onImportFromFileClick: () => void,
  onExportToFileClick: () => void,
}) {

  const buttonClass = "w-full p-4 flex space-x-2 justify-center bg-gray-100 hover:bg-gray-300 rounded";

  return (
    <SideDrawer isOpen={props.isOpen} onClose={props.onClose}>
      <div className="p-4 space-y-2">
        <button
          className={buttonClass}
          onClick={props.onExportAsImage}>
          <span>
            <svg className="w-6 h-6" strokeWidth="1.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M22 12.6v7.8a.6.6 0 01-.6.6h-7.8a.6.6 0 01-.6-.6v-7.8a.6.6 0 01.6-.6h7.8a.6.6 0 01.6.6zM19.5 14.51l.01-.011" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path><path d="M13 18.2l3.5-1.2 5.5 2M2 10V3.6a.6.6 0 01.6-.6h6.178a.6.6 0 01.39.144l3.164 2.712a.6.6 0 00.39.144H21.4a.6.6 0 01.6.6V9M2 10v8.4a.6.6 0 00.6.6H10m-8-9h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path></svg>
          </span>
          <span>Export as image</span>
        </button>
        <button
          className={buttonClass}
          onClick={props.onImportFromFileClick}>
          <span>
            <svg className="w-6 h-6" strokeWidth="1.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 13v6a2 2 0 002 2h12a2 2 0 002-2v-6M12 3v12m0 0l-3.5-3.5M12 15l3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path></svg>
          </span>
          <span>Import GeoJSON</span>
        </button>
        <button
          className={buttonClass}
          onClick={props.onExportToFileClick}>
          <span>
            <svg className="w-6 h-6" strokeWidth="1.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 7.5V5a2 2 0 012-2h11.172a2 2 0 011.414.586l2.828 2.828A2 2 0 0121 7.828V19a2 2 0 01-2 2H5a2 2 0 01-2-2v-2.5M6 21v-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path><path d="M18 21v-7.4a.6.6 0 00-.6-.6H15M16 3v5.4a.6.6 0 01-.6.6h-1.9M8 3v3M1 12h11m0 0L9 9m3 3l-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path></svg>
          </span>
          <span>Export GeoJSON</span>
        </button>
      </div>
    </SideDrawer>
  );

}