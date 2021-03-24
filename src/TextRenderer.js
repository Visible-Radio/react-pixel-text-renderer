import renderText from './renderFunction';
import React from 'react';
import { useRef, useEffect } from 'react';

export default function TextRenderer({ text, bgColor, scale, color, charSpaces, animate, scaleMode }) {
  const canvasRef = useRef(null);
  const defaultText = "sample text"

  useEffect(()=> {
    renderText(charSpaces * 6 || text?.length * 6 || defaultText.length * 6
      , scale || 5
      , canvasRef, text || defaultText
      , color || null
      , animate || false
    )
  });

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