export const ID_MARKER_BUTTON_CREATE = 'marker-button-create';
export const ID_MARKER_CONTENT = 'marker-content';

export default function AnnotationMarkerPopupContent(props: {
  markerContent: string|undefined,
  isEditing: boolean
}) {

  const isEditing = props.isEditing;
  const markerContent = props.markerContent || "Enter your annotation here";

  // Since the popup is rendered through renderToString we can only define the markup here (no JS):
  return (
    <>
      <label
        htmlFor={ID_MARKER_CONTENT}
        className="font-medium text-gray-900"
      >
      Your annotation
      </label>
      <textarea
        id={ID_MARKER_CONTENT}
        className={`
          w-full mt-2 mb-1 p-2 text-sm text-gray-900 bg-gray-100 rounded-lg
          border border-gray-300
          resize-none
          ${!isEditing ? 'placeholder-gray-900' : ''}
        `}
        placeholder={markerContent}
        rows={7}
        disabled={!isEditing}
      />
      {
        props.isEditing &&
        <div className="w-full flex justify-end">
          <button
            id={ID_MARKER_BUTTON_CREATE}
            className="py-1 px-3 rounded bg-gray-100 hover:bg-gray-200 border border-black"
          >
            Save
          </button>
        </div>
      }
    </>
  );

}