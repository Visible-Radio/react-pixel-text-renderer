import "./App.css";

import React from "react";
import { useRef, useEffect } from "react";
import { defs } from "./customDefs_cw_7";
import renderSingleChar, { textRenderer } from "./renderSingleChar";

function App() {
  const canvasRef = useRef(null);

  useEffect(() => {
    textRenderer({
      gridWidth: 49,
      scale: 5,
      canvasRef,
      text: "Hello World, it's me",
      color: null,
      defs,
    });
  }, []);

  return (
    <canvas ref={canvasRef} className="TextRendererCanvasInternal"></canvas>
  );
}

export default App;
