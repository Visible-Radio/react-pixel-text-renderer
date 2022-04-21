const commonFunctions = require("./commonFunctions.js");
const { setupCanvas, makeWords, makeStateSync } = commonFunctions;
const syncDrawingFunctions = require("./syncDrawingFunctions.js");
const { syncDrawWords } = syncDrawingFunctions;
const GIFEncoder = require("gifencoder");
const { createCanvas } = require("canvas");
const fs = require("fs");
const defs = require("./customDefs_charWidth_7.json");

function nodePixelTextRenderer({ columns, scale, text, defs, displayRows }) {
  const { charWidth } = defs;
  const { words } = makeWords(text, columns, defs);
  const totalRows = words.slice(-1)[0].row + 1;
  const { ctx, config } = setupCanvas({
    canvas: createCanvas(),
    totalRows,
    columns,
    scale,
    charWidth,
    gridSpace: scale,
    displayRows,
  });
  const state = makeStateSync({ ctx, words, config });
  const encoder = new GIFEncoder(ctx.canvas.width, ctx.canvas.height);
  encoder.createReadStream().pipe(fs.createWriteStream("test.gif"));
  encoder.start();
  encoder.setRepeat(0); // 0 for repeat, -1 for no-repeat
  encoder.setDelay(20); // frame delay in ms
  encoder.setQuality(5);
  state.config.snapshot = () => {
    // if we want to change frame durations, we'll have to do it here
    // pass snapshot() the desired duration when it is called
    // this could be attached to each char - or use a default param
    // and frames that should linger longer will receive an override
    // encoder.setDelay(20)
    encoder.addFrame(ctx);
  };

  syncDrawWords({
    state,
  });
  encoder.finish();
}

const joke = "Welcome to Node pixel text renderer v0.0.1. init charset. ...";
const end =
  "Charset initialized. ... Hello world ... Hello world ... hello world ...";
nodePixelTextRenderer({
  columns: 15,
  displayRows: 5,
  scale: 3,
  text: (joke + Object.keys(defs).join(" ") + end).toUpperCase(),
  defs,
});
