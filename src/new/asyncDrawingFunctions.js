const { clearFrame } = require('./syncDrawingFunctions');

async function asyncDrawWords({ state }) {
  const { words } = state;
  return new Promise(async resolve => {
    for (let word of words) {
      await drawWord({ word, state });
    }
    resolve(undefined);
  });
}

async function drawWord({ word, state }) {
  return new Promise(async resolve => {
    for (let c of word.chars) {
      await drawEachCharFrame({ charObj: c, state });
    }
    resolve(undefined);
  });
}

async function drawEachCharFrame({ charObj, state }) {
  const { config } = state;
  return new Promise(async resolve => {
    if (charObj.row === config.displayRows + state.rowsScrolled()) {
      //
      await state.scroll({ charObj });
    }
    let last;
    while (charObj.frameNum() < config.charWidth) {
      const charPoints = charObj.nextFrame();

      if (last) {
        //
        clearFrame({ charPoints: last, charObj, state });
      }
      await drawFrame({ charPoints, charObj, state });
      last = charPoints;
    }
    charObj.setFrameNum(config.charWidth - 1);
    resolve(undefined);
  });
}

function drawFrame({ charPoints, charObj, state }) {
  const {
    ctx,
    rowsScrolled,
    config: { scale, charWidth, gridSpace },
  } = state;
  return new Promise(resolve => {
    charPoints.forEach(({ row: charPointY, col: charPointX }) => {
      const rowGap = (charObj.row - rowsScrolled()) * gridSpace;
      const colGap = charObj.col * gridSpace;
      const pxX = charObj.col * scale * charWidth + charPointX * scale + colGap;
      const pxY =
        (charObj.row - rowsScrolled()) * scale * charWidth +
        charPointY * scale +
        rowGap;
      const pxSizeX = scale;
      const pxSizeY = scale;

      ctx.fillStyle = 'rgb(255,0,190)';
      ctx.fillRect(pxX, pxY, pxSizeX, pxSizeY);
    });
    setTimeout(() => resolve(undefined), 20);
  });
}

async function drawScrollWords({ state }) {
  const { ctx } = state;
  let scrollFrameIndex = 0;
  while (scrollFrameIndex < state.config.charWidth + 2) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    await drawScrollFrame({ state, scrollFrameIndex });
    scrollFrameIndex++;
  }
}

async function drawScrollFrame({ state, scrollFrameIndex }) {
  return new Promise(async resolve => {
    const { words } = state;
    for (let word of words) {
      for (let charObj of word.chars) {
        // we should write a standalone applyScrollTransform function
        // that is not attached to the charObj
        // to do it's job, it needs values from state.config - namely gridSpace and scale
        const charPoints = charObj.applyScrollTransform(scrollFrameIndex);

        drawFrame({ charPoints, charObj, state });
      }
    }
    setTimeout(() => resolve(undefined), 30);
  });
}

module.exports = {
  asyncDrawWords,
  drawFrame,
  clearFrame,
  drawScrollWords,
  drawScrollFrame,
};
