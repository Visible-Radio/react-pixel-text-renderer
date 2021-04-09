import renderText from './renderFunction';
import React from 'react';
import { useRef, useEffect } from 'react';

export default function TextRenderer({ text, bgColor, scale, color, charSpaces, animate, scaleMode, wordWrap, customDefs }) {
  const canvasRef = useRef(null);
  const defaultText = "sample text"
  if (!text) text = defaultText;

  const charWidth = customDefs ? customDefs.charWidth : 5;

  function parseWidth(text) {
    if (!charSpaces) return null;
    if (!wordWrap) return charSpaces
    const longestWord = text.split(' ').sort((a, b) => b.length - a.length)[0].length;
    return (charSpaces < longestWord) ? longestWord : charSpaces;
  }

  const parsedWidth = parseWidth(text);

  useEffect(()=> {
    renderText(parsedWidth * (charWidth + 1) || text?.length * (charWidth + 1) || defaultText.length * (charWidth + 1)
    , scale || 5
    , canvasRef
    , text || defaultText
    , color || null
    , animate || false
    , wordWrap || false
    , customDefs || null
    )
  },[animate, color, parsedWidth, scale, text, wordWrap, charWidth, customDefs]);

  // depending on scale mode, inject different styles into destinationCanvas element
  const innerStyles = () => {
    if (!scaleMode || scaleMode === 'fixed') return {background: bgColor} || null ;
    if (scaleMode === 'auto') return {width: '100%', height: '100%', background: bgColor || null};
    return null;
  }

  return (
    <div style={{margin: 0, padding: 0, display: 'flex', width: 'auto'}} className="textRendererWrapperInternal">
      <canvas
        ref = {canvasRef}
        className="TextRendererCanvasInternal"
        style={innerStyles()}>
        {text}
      </canvas>
    </div>
  )
}