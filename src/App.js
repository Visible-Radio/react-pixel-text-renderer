import "./App.css";

import React from "react";
import { useRef, useEffect } from "react";
import { defs } from "./customDefs_cw_7";
import { textRenderer } from "./renderSingleChar";

function App() {
  const canvasRef = useRef(null);

  useEffect(() => {
    textRenderer({
      columns: 11,
      scale: 10,
      canvasRef,
      text: "hello world how are you today".toUpperCase(),
      defs,
    });
  }, []);

  return (
    <canvas ref={canvasRef} className="TextRendererCanvasInternal"></canvas>
  );
}

export default App;
