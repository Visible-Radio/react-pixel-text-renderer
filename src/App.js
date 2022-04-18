import "./App.css";
import { useEffect } from "react";
// import { defs } from "./customDefs_cw_7";
import defs from "./new/customDefs_charWidth_7.json";
import { syncTextRenderer } from "./new/renderSingleChar";

const text =
  "Nisi dolore eiusmod veniam consectetur. Officia ut sit irure adipisicing adipisicing ad velit ad magna adipisicing aliquip. Non aute minim minim excepteur tempor excepteur aliqua. Pariatur cupidatat amet esse aliquip veniam eu duis amet commodo. Quis aute exercitation minim reprehenderit in qui quis adipisicing ad aliquip. Dolore velit quis fugiat elit aliqua.";

const joke = "Welcome to Node pixel text renderer v0.0.1. init charset. ...";
const end = "Charset initialized. ... Hello world";

function App() {
  useEffect(() => {
    syncTextRenderer({
      columns: 24,
      displayRows: 5,
      scale: 3,
      text: (joke + Object.keys(defs).join(" ") + end).toUpperCase(),
      defs,
    });
  }, []);

  return null;
}

export default App;
