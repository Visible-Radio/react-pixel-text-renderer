import './App.css';
import { useEffect } from 'react';
import defs from './new/customDefs_charWidth_7.json';
import { asyncTextRenderer, syncTextRenderer } from './new/wrapperFunctions';

const joke =
  'Welcome to <HL>Node <HL>pixel <HL>text <HL>renderer v0.0.1. init charset. ...';
const end = ' Charset initialized. ... Hello world\nHello\n<HL>Hello <HL>world';
const text = (joke + Object.keys(defs).join(' ') + end).toUpperCase();
const threeCoopers = ' /Cooper/cooper/cooper'.toUpperCase();

function App() {
  useEffect(() => {
    asyncTextRenderer({
      columns: 11,
      displayRows: 5,
      scale: 10,
      text:
        seriesOfEvilNumbers(4).toUpperCase() +
        threeCoopers +
        seriesOfEvilNumbers(4) +
        ' the owls are <HL>not what they seem'.toUpperCase(),
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

function randomEvilNumbers() {
  const num = Math.trunc(Math.random() * 1000);
  const letter = 'abcdefghijklmnopqrstuvwxyz'
    .split('')
    [Math.floor(Math.random() * 26)].toUpperCase();
  return ` <HL>/${letter}${num}`;
}

function seriesOfEvilNumbers(count) {
  let string = '';
  for (let i = 0; i < count; i++) {
    string += randomEvilNumbers();
  }
  return string;
}
