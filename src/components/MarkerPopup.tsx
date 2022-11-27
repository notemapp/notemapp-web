export default function MarkerPopup() {

  return (
    <>
      <p>Create a note:</p>
      <input id="marker-content" className="my-1 border border-1 border-black px-2 py-1" type="text"/>
      <button
        id="marker-create"
        className="my-1 px-2 py-1 border border-1 border-black hover:bg-gray-300"
      >Add</button>
    </>
  );

}