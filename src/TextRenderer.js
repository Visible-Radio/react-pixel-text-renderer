import renderText from './charBychar_renderFunction';
import React, { useState } from 'react';
import { useRef, useEffect } from 'react';

export default function TextRenderer({ text, bgColor, scale, color, charSpaces, animate, scaleMode, wordWrap, customDefs, selected, cursor }) {
  const canvasRef = useRef(null);
  const defaultText = ""
  if (!text) text = defaultText;

  const [ done, setDone ] = useState(false);

  const charWidth = customDefs ? customDefs.charWidth : 5;

  function parseWidth(text) {
    if (!charSpaces) return null;
    if (!wordWrap) return charSpaces
    const longestWord = text.split(' ').sort((a, b) => b.length - a.length)[0].length;
    return (charSpaces < longestWord) ? longestWord : charSpaces;
  }

  const parsedWidth = parseWidth(text);
  const inputWidth = parsedWidth * (charWidth + 1) || text?.length * (charWidth + 1) || defaultText.length * (charWidth + 1)

  useEffect(()=> {
    renderText(inputWidth
    , scale || 5
    , canvasRef
    , text || defaultText
    , color || null
    , animate || false
    , wordWrap || false
    , customDefs || null
    , setDone
    )
  },[inputWidth, animate, color, parsedWidth, scale, text, wordWrap, charWidth, customDefs]);

  // depending on scale mode, inject different styles into destinationCanvas element
  const innerStyles = () => {
    // if (!scaleMode || scaleMode === 'fixed') return {background: bgColor} || null ;
    if (scaleMode === 'auto') return {width: '100%', height: '100%', background: bgColor || null};
    return null;
  }

  const doneStyles = done ? {
    overflow: 'hidden',
    width: `${canvasRef.current.width / 2}px`,
    transition: 'border-color 0.5s, background 0.5s',
    // background: 'transparent',
    // borderColor: 'transparent',
    // opacity: 1,
  } : {}

  const selectedStyles = selected ? {
    outline: (`1px solid rgb(${color[0]},${color[1]},${color[2]})` || '1px solid rgb(200,0,190)'),
  } : {}

  const cursorStyles = cursor ? {

  } : {}

  return (
    <div style={{
      background: bgColor,
      // opacity: 0.95,
      // border: (`1px solid rgb(${color[0]},${color[1]},${color[2]})` || '1px solid rgb(200,0,190)'),
      margin: 0,
      padding: 0,
      display: 'flex',
      width: inputWidth * scale,
      transition: 'width 0.5s',
      ...doneStyles,
      ...selectedStyles
    }}
      className="textRendererWrapperInternal">
      <canvas
        ref = {canvasRef}
        className="TextRendererCanvasInternal"
        style={{...innerStyles()}}>
        {text}
      </canvas>
    </div>
  )
}