// const ctx = setupCanvas({
//   canvas: makeCanvas(),
//   rows,
//   columns,
//   scale,
//   charWidth,
//   gridSpace: scale,
// });

// syncDrawWords({
//   words,
//   ctx,
//   charWidth,
//   scale,
//   frameCaptureCallback: () => {
//     // frames can be sequentially captured here by snapshotting the current state of the canvas
//     const newCanvasCtx = setupCanvas({
//       canvas: makeCanvas(),
//       rows,
//       columns,
//       scale,
//       charWidth,
//       gridSpace: scale,
//     });
//     newCanvasCtx.drawImage(ctx.canvas, 0, 0);
//   },
// });

export function syncDrawWords({
  words,
  ctx,
  charWidth,
  scale,
  frameCaptureCallback,
}) {
  for (let word of words) {
    drawWord({ word, ctx, charWidth, scale, frameCaptureCallback });
  }
}

function drawWord({ word, ctx, charWidth, scale, frameCaptureCallback }) {
  for (let c of word.chars) {
    drawEachCharFrame({
      charObj: c,
      ctx,
      charWidth,
      scale,
      frameCaptureCallback,
    });
  }
}

function drawEachCharFrame({
  charObj,
  ctx,
  charWidth,
  scale,
  frameCaptureCallback,
}) {
  let last;
  while (charObj.frameNum() < charWidth) {
    const charPoints = charObj.nextFrame();
    if (last) {
      //
      clearFrame({ charPoints: last, charObj, ctx, charWidth, scale });
    }
    drawFrame({ charPoints, charObj, ctx, charWidth, scale });
    last = charPoints;
    frameCaptureCallback();
  }
}

function drawFrame({ charPoints, charObj, ctx, charWidth, scale }) {
  charPoints.forEach(({ row: charPointY, col: charPointX }) => {
    const rowGap = charObj.row * scale;
    const colGap = charObj.col * scale;
    const pxX = charObj.col * scale * charWidth + charPointX * scale + colGap;
    const pxY = charObj.row * scale * charWidth + charPointY * scale + rowGap;
    const pxSizeX = scale;
    const pxSizeY = scale;
    ctx.fillStyle = "rgb(255,0,190)";
    ctx.fillRect(pxX, pxY, pxSizeX, pxSizeY);
  });
}

function clearFrame({ charPoints, charObj, ctx, charWidth, scale }) {
  charPoints.forEach(({ row: charPointY, col: charPointX }) => {
    const rowGap = charObj.row * scale;
    const colGap = charObj.col * scale;
    ctx.clearRect(
      charObj.col * scale * charWidth + charPointX * scale + colGap,
      charObj.row * scale * charWidth + charPointY * scale + rowGap,
      scale,
      scale
    );
  });
}
