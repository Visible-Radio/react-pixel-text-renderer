import './App.css';
import React, { createRef, useRef, useState } from 'react';
//import TextRenderer from 'react-pixel-text-renderer';
import TextRenderer from './TextRenderer';
import charDefs7x7 from './customDefs_charWidth_7.json'

const color = [255,0,190]

function App() {
  const [inputText, setInputText] = useState([]);
  const [selection, setSelection] = useState({start: null, end: null })

  function handleSelect(event){
    const start = event.target.selectionStart
    const end = event.target.selectionEnd
    console.log(start, end)
    setSelection({
        start,
        end,
        selectionLength: end - start,
        selected: inputText.slice(start, end)
      }
    )
  }

  function onTextInputChange(event) {
    const eventValue = event.target.value.split('')

    setInputText(prev => {
      const lengthDelta = eventValue.length - prev.length

      // if (lengthDelta >= 0) {
      //   const newElements = eventValue.slice(selection.start -1, selection.start + selection.selectionLength + lengthDelta)

      //   if (newElements.length) {
      //     const newElementsWithTimeStamps = newElements.map((newElement, i) => ({
      //       character: newElement,
      //       timeStamp: Date.now() + Math.random() + newElement,
      //     }))

      //     // insert the new elements
      //     const updated = [
      //       ...prev.slice(0, selection.start -1),
      //       ...newElementsWithTimeStamps,
      //       ...prev.slice(selection.end, eventValue.length)
      //     ]
      //     return updated
      //   }
      // }

      // if (lengthDelta < 0) {
          // whatDisapeared ?
          // whatever was bounded by the selection start/end in prev

          // whatAppeared ?
          // remove the selected elements at selection start/end
          // selection start is the beginning of what appeared
          // selection start + selection end - change in length is the end of what appeared

        console.log('selection', selection)
        console.log('lengthDelta', lengthDelta)

        const vars = {
          removed : prev.slice(selection.end + lengthDelta, selection.end),
          remainingLeft : prev.slice(0, selection.start)
            .filter(el => !prev.slice(selection.end + lengthDelta, selection.end).includes(el)), // in case we're deleting one element, we'll need to manually filter it out from remainingLeft
          remainingRight : prev.slice(selection.end, prev.length),
          appeared : eventValue.slice(selection.start, selection.end + lengthDelta ),
        }
        console.log(vars)
        return [
          ...vars.remainingLeft,
          ...vars.appeared.map(character => ({character, timeStamp: Date.now() + Math.random() + character})),
          ...vars.remainingRight
        ]
    })
  }


  return (
    <>
      <div style={{
        backgroundColor: 'rgb(0,5,25)',
        height: '100vh',
        width: '100%'}}
        >
        <div className="App" style={{
          backgroundColor: 'rgb(0,5,25)',
          display: 'flex',
          flexFlow: 'row wrap',
          width: '100%',
          gap: '0.5rem'
          }}>
          { inputText.length &&
            inputText.map(({ character, timeStamp }, i, arr) => {
              return (
                  <TextRenderer
                    key = {timeStamp}
                    bgColor = {'rgba(0,10,50,1)'}
                    color={color}
                    charSpaces={2}
                    text={character}
                    scale={6}
                    animate={true}
                    scaleMode={'fixed'}
                    wordWrap = {false}
                    selected={selection.start <= i && selection.end > i}
                    cursor={selection.start === i}
                    // attach a reference to this character's index
                    // customDefs= {charDefs7x7}
                  />
                )
              })

          }
        </div>
        <input type="text" value={inputText.map(({ character }) => character).join('')} onChange={onTextInputChange} onSelect={handleSelect}></input>
      </div>
    </>
  );
}

export default App;

/*
function onTextInputChange(event) {
    const eventTime = event.timeStamp
    const eventValue = event.target.value.split('')

    setInputText(prev => {
      if (prev.length === eventValue.length) {
        console.log("\naction === change")
        // action === change
        // a character or characters was changed
        // const inserted = {character: eventValue.slice(selection.start, selection.end)[0], timeStamp: eventTime}

        const inserted = eventValue.slice(selection.start, selection.end).map(eventChar => {
          return (
            {
              character: eventChar,
              timeStamp: eventTime
            }
          )
        })

        const updated = [
          ...prev.slice(0, selection.start),
          ...inserted,
          ...prev.slice(selection.end, prev.length)
        ]
        return updated
      }

      if (prev.length + 1 === eventValue.length) {
        console.log('\naction === add 1')
        // action === add 1
        // a character was added
        console.log('selection', selection.start, selection.end)
        console.log(eventValue)
        console.log(prev)
        const updated = [...prev]
        updated.splice(selection.start, 0, {
          character: eventValue[selection.start],
          timeStamp: eventTime
        })
        return updated
      }


    })
  }
 */