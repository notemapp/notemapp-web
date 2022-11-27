export const ID_MARKER_BUTTON_CREATE = 'marker-button-create';
export const ID_MARKER_CONTENT = 'marker-content';

export default function AnnotationMarkerPopupContent(props: {
  content: string,
  isEditing: boolean
}) {

  const content = props.content;
  const isEditing = props.isEditing;

  // Since the popup is rendered through renderToString we can only define the markup here (no JS):
  return (
    <div>
      {
        isEditing &&
        <textarea
          id={ID_MARKER_CONTENT}
          className="
          w-full mt-2 mb-1 p-2 text-sm text-gray-900 bg-gray-100 rounded-lg
          border border-gray-300 resize-none
        "
          placeholder="Write your note here, you can also use Markdown syntax!"
          rows={7}
        />
      }
      {
        !isEditing &&
        <div
          className="w-full mt-2 mb-1 p-2"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      }
      {
        props.isEditing &&
        <div className="w-full flex justify-end">
          <button
            id={ID_MARKER_BUTTON_CREATE}
            className="py-1 px-3 rounded bg-gray-100 hover:bg-gray-200 border border-gray-300"
          >
            Save
          </button>
        </div>
      }
    </div>
  );

}