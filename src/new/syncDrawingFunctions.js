function clearFrame({ charPoints, charObj, state }) {
  const {
    ctx,
    config: { scale, charWidth, gridSpaceX, gridSpaceY, borderThickness },
    rowsScrolled,
  } = state;
  charPoints.forEach(({ row: charPointY, col: charPointX }) => {
    const rowGap = (charObj.row - rowsScrolled()) * gridSpaceY;
    const colGap = charObj.col * gridSpaceX;
    const pxX =
      charObj.col * scale * charWidth +
      charPointX * scale +
      colGap +
      borderThickness;
    const pxY =
      (charObj.row - rowsScrolled()) * scale * charWidth +
      charPointY * scale +
      rowGap +
      borderThickness;
    const pxSizeX = scale;
    const pxSizeY = scale;
    ctx.clearRect(pxX, pxY, pxSizeX, pxSizeY);
  });
}

function syncDrawWords({ state }) {
  const { words } = state;
  for (let word of words) {
    drawWord({ word, state });
  }
  state.config.snapshot({ last: true });
}

function drawWord({ word, state }) {
  state.newColor();
  for (let c of word.chars) {
    drawEachCharFrame({ charObj: c, state });
  }
}

function drawEachCharFrame({ charObj, state }) {
  const { config } = state;

  if (charObj.row === config.displayRows + state.rowsScrolled()) {
    //
    state.scroll({ charObj });
  }
  let last;
  while (charObj.frameNum() < charObj.charWidth) {
    const charPoints = charObj.nextFrame();

    if (last) {
      //
      clearFrame({ charPoints: last, charObj, state });
    }
    drawFrameSync({ charPoints, charObj, state });
    config.snapshot();
    last = charPoints;
  }
  charObj.setFrameNum(config.charWidth - 1);
}

function drawFrameSync({ charPoints, charObj, state }) {
  const {
    ctx,
    rowsScrolled,
    config: { scale, charWidth, gridSpaceX, gridSpaceY, borderThickness },
  } = state;
  charPoints.forEach(({ row: charPointY, col: charPointX }) => {
    const rowGap = (charObj.row - rowsScrolled()) * gridSpaceY;
    const colGap = charObj.col * gridSpaceX;
    const pxY =
      (charObj.row - rowsScrolled()) * scale * charWidth +
      charPointY * scale +
      rowGap +
      borderThickness;
    if ([0, scale].includes(pxY)) return;
    const pxX =
      charObj.col * scale * charWidth +
      charPointX * scale +
      colGap +
      borderThickness;
    const pxSizeX = scale;
    const pxSizeY = scale;

    ctx.fillStyle = charObj.color;
    ctx.fillRect(pxX, pxY, pxSizeX, pxSizeY);
  });
}

function drawScrollWordsSync({ state }) {
  const {
    ctx,
    config: { borderStroke, borderThickness },
  } = state;
  let scrollFrameIndex = 0;
  while (scrollFrameIndex < state.config.charWidth + 2) {
    ctx.clearRect(
      borderStroke,
      borderStroke,
      ctx.canvas.width - borderThickness,
      ctx.canvas.height - borderThickness,
    );
    drawScrollFrameSync({ state, scrollFrameIndex });
    state.config.snapshot();
    scrollFrameIndex++;
  }
}

function drawScrollFrameSync({ state, scrollFrameIndex }) {
  const { words } = state;
  for (let word of words) {
    for (let charObj of word.chars) {
      // to do it's job, it needs values from state.config - namely gridSpace and scale
      const charPoints = charObj.applyScrollTransform(scrollFrameIndex, state);
      drawFrameSync({ charPoints, charObj, state });
    }
  }
}

module.exports = {
  syncDrawWords,
  drawFrameSync,
  clearFrame,
  drawScrollWordsSync,
  drawScrollFrameSync,
};
