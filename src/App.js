import './App.css';
import { useEffect } from 'react';
import defs from './new/customDefs_charWidth_7.json';
import { asyncTextRenderer, syncTextRenderer } from './new/wrapperFunctions';

const joke =
  'Welcome to <HL>Node <HL>pixel <HL>text <HL>renderer v0.0.1. init charset. ...';
const end = ' Charset initialized. ... Hello world\nHello\n<HL>Hello <HL>world';
const text = (joke + Object.keys(defs).join(' ') + end).toUpperCase();
const threeCoopers = ' /Cooper/cooper/cooper'.toUpperCase();
const ominousMessage =
  seriesOfEvilNumbers(20).toUpperCase() +
  threeCoopers +
  seriesOfEvilNumbers(20) +
  ' the owls are <HL>not what they seem...'.toUpperCase();
const borgQueenAteABattery =
  "My <HL>Borg <HL>Queen ate a <HL>Battery, like a <HL>Big square battery, like a <HL>car <HL>battery. She just keeps eating them. \nthen we go to the doctor and he says, 'yeah, <HL>we <HL>found <HL>a <HL>Battery <HL>in <HL>there' ...";

const fromTheThing =
  '<HL>Projection:\n if <HL>intruder <HL>organism reaches civilized areas ...Entire world population infected <HL>27,000 hours from first contact.';

const newlines = 'hi\n\n\n\nhi\n\n hiya';

// 2:1 columns to rows yields 16:9 aspect ratio when gridSpaceX = 0
function App() {
  useEffect(() => {
    asyncTextRenderer({
      columns: 10,
      displayRows: 5,
      scale: 5,
      text: fromTheThing.toUpperCase(),
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
