import renderText from '../utils/renderFunction';
import { useRef, useEffect } from 'react';

export default function TextRenderer({ text, bgColor, scale, color, charSpaces, animate }) {
  const canvasRef = useRef(null);
  const defaultText = "sample text"

  useEffect(()=> {
    renderText(charSpaces * 6 || text?.length * 6 || defaultText.length * 6
      , scale || 5
      , canvasRef, text || defaultText
      , color || null
      , animate || false
    )
  })

  return (
    <div style={{margin: 0, padding: 0, display: 'flex', width: 'auto'}} className="textRendererWrapper">
      <canvas
        ref = {canvasRef}
        className="TextRendererCanvasInternal"
        style={{background: bgColor || 'none', margin: 0, padding: 0, width: '100%'}}>{text}
      </canvas>
    </div>
  )
}