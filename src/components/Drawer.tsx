import React from "react";

export default function Drawer(props: {
  children: React.ReactNode;
  isOpen: boolean;
  setOpen: (isOpen: boolean) => void;
}) {

  return (
    <main
      className={
        `fixed overflow-hidden z-10 bg-gray-900 bg-opacity-25 inset-0 transform ease-in-out 
        ${props.isOpen 
          ? "transition-opacity opacity-100 duration-500 translate-x-0" 
          : "transition-all delay-500 opacity-0 translate-x-full"}`}
    >
      <section
        className={
          `w-screen max-w-sm right-0 absolute bg-white h-full shadow-xl delay-400 duration-500 ease-in-out transition-all transform
          ${props.isOpen ? "translate-x-0" : "translate-x-full"}`
        }
      >
        <article className="relative w-screen max-w-sm pb-10 flex flex-col h-full">
          <div className="h-12 w-full flex justify-end">
            <button
              className="w-12 h-full rounded flex justify-center items-center hover:bg-gray-300"
              onClick={() => props.setOpen(false)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5"
                   stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
          {props.children}
        </article>
      </section>
      <section
        className="w-screen h-full cursor-pointer"
        onClick={() => {
          props.setOpen(false);
        }}
      ></section>
    </main>
  );
}
