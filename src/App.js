import './App.css';
import { useEffect } from 'react';
import defs from './new/customDefs_charWidth_7.json';
import { asyncTextRenderer, syncTextRenderer } from './new/wrapperFunctions';

const joke = 'Welcome to Node pixel text renderer v0.0.1. init charset. ...';
const end = 'Charset initialized. ... Hello world';
const text = (joke + Object.keys(defs).join(' ') + end).toUpperCase();

function App() {
  useEffect(() => {
    asyncTextRenderer({
      columns: 15,
      displayRows: 5,
      scale: 3,
      text: text,
      defs,
    });
    // syncTextRenderer({
    //   columns: 15,
    //   displayRows: 5,
    //   scale: 3,
    //   text: (joke + Object.keys(defs).join(" ") + end).toUpperCase(),
    //   defs,
    // });
  }, []);

  return null;
}

export default App;
