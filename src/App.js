import './App.css';
import React from 'react';
//import TextRenderer from 'react-pixel-text-renderer';
import TextRenderer from './TextRenderer';

/*
a cool challenge
  redraw the canvas with the optimal pixel scale when the window is resized
*/

function App() {
  return (
    <div className="App">
      {<TextRenderer
        bgColor = {'rgba(0,10,50,1)'}
        text={"...or the international communist conspiracy to sap and impurify all of our precious bodily fluids"}
        scale={10}
        charSpaces={14}
        animate={true}
        scaleMode={'auto'}
        wordWrap = {true}
      />}
    </div>
  );
}

export default App;
