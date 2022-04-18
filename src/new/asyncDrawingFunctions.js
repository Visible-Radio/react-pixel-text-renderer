export async function asyncDrawWords({ state }) {
  const { words } = state;
  return new Promise(async (resolve) => {
    for (let word of words) {
      await drawWord({ word, state });
    }
    resolve(undefined);
  });
}

async function drawWord({ word, state }) {
  return new Promise(async (resolve) => {
    for (let c of word.chars) {
      await drawEachCharFrame({ charObj: c, state });
    }
    resolve(undefined);
  });
}

async function drawEachCharFrame({ charObj, state }) {
  const { config } = state;
  return new Promise(async (resolve) => {
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

export function drawFrame({ charPoints, charObj, state }) {
  const {
    ctx,
    config: { scale, charWidth },
    rowsScrolled,
  } = state;
  return new Promise((resolve) => {
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
    setTimeout(() => resolve(undefined), 20);
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

export async function drawScrollWords({ state }) {
  const { ctx } = state;
  let scrollFrameIndex = 0;
  while (scrollFrameIndex < state.config.charWidth + 2) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    await drawScrollFrame({ state, scrollFrameIndex });
    scrollFrameIndex++;
  }
}

export async function drawScrollFrame({ state, scrollFrameIndex }) {
  return new Promise(async (resolve) => {
    const { words } = state;
    for (let word of words) {
      for (let charObj of word.chars) {
        const charPoints = charObj.applyScrollTransform(scrollFrameIndex);

        drawFrame({ charPoints, charObj, state });
      }
    }
    setTimeout(() => resolve(undefined), 30);
  });
}
