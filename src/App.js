import "./App.css";
import { useEffect } from "react";
import { defs } from "./customDefs_cw_7";
import { syncTextRenderer } from "./new/renderSingleChar";

function App() {
  useEffect(() => {
    syncTextRenderer({
      columns: 11,
      displayRows: 3,
      scale: 5,
      text: "hello world how are you today. here is some more text".toUpperCase(),
      defs,
    });
  }, []);

  return null;
}

export default App;
