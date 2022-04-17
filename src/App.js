import "./App.css";
import { useEffect } from "react";
import { defs } from "./customDefs_cw_7";
import { syncTextRenderer } from "./new/renderSingleChar";

function App() {
  useEffect(() => {
    syncTextRenderer({
      columns: 9,
      displayRows: 5,
      scale: 5,
      text: "hello world whats cookin hello world whats cookin".toUpperCase(),
      defs,
    });
  }, []);

  return null;
}

export default App;
