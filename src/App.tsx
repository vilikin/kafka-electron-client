import React from "react";
const fs = window.require("fs");

function doNodeStuff() {
  fs.writeFileSync("lol.txt", "lol");
}

function App() {
  return (
    <div className="max-w-md mx-auto flex p-6 bg-gray-100 mt-10 rounded-lg shadow-xl">
      <div className="ml-6 pt-1">
        <h1 className="text-2xl text-blue-700 leading-tight">
          Tailwind and Create React App
        </h1>
        <p className="text-base text-gray-700 leading-normal">
          Building apps together
        </p>
        <button onClick={doNodeStuff}>Do node stuff</button>
      </div>
    </div>
  );
}

export default App;
