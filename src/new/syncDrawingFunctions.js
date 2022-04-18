export function syncDrawWords({ state }) {
  const { words } = state;
  for (let word of words) {
    drawWord({ word, state });
  }
}

function drawWord({ word, state }) {
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
  while (charObj.frameNum() < config.charWidth) {
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

export function drawFrameSync({ charPoints, charObj, state }) {
  const {
    ctx,
    config: { scale, charWidth },
    rowsScrolled,
  } = state;

  charPoints.forEach(({ row: charPointY, col: charPointX }) => {
    const rowGap = (charObj.row - rowsScrolled()) * scale;
    const colGap = charObj.col * scale;
    const pxX = charObj.col * scale * charWidth + charPointX * scale + colGap;
    const pxY =
      (charObj.row - rowsScrolled()) * scale * charWidth +
      charPointY * scale +
      rowGap;
    const pxSizeX = scale;
    const pxSizeY = scale;

    ctx.fillStyle = "rgb(255,0,190)";
    ctx.fillRect(pxX, pxY, pxSizeX, pxSizeY);
  });
}

export function clearFrame({ charPoints, charObj, state }) {
  const {
    ctx,
    config: { scale, charWidth },
    rowsScrolled,
  } = state;
  charPoints.forEach(({ row: charPointY, col: charPointX }) => {
    const rowGap = (charObj.row - rowsScrolled()) * scale;
    const colGap = charObj.col * scale;
    ctx.clearRect(
      charObj.col * scale * charWidth + charPointX * scale + colGap,
      (charObj.row - rowsScrolled()) * scale * charWidth +
        charPointY * scale +
        rowGap,
      scale,
      scale
    );
  });
}

export function drawScrollWordsSync({ state }) {
  const { ctx } = state;
  let scrollFrameIndex = 0;
  while (scrollFrameIndex < state.config.charWidth + 2) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    drawScrollFrameSync({ state, scrollFrameIndex });
    state.config.snapshot();
    scrollFrameIndex++;
  }
}

export function drawScrollFrameSync({ state, scrollFrameIndex }) {
  const { words } = state;
  for (let word of words) {
    for (let charObj of word.chars) {
      const charPoints = charObj.applyScrollTransform(scrollFrameIndex);
      drawFrameSync({ charPoints, charObj, state });
    }
  }
}
