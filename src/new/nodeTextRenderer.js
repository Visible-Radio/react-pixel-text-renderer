const commonFunctions = require('./commonFunctions.js');
const { setupCanvas, makeWords, makeStateSync, modifyDefs, drawBorder } =
  commonFunctions;
const syncDrawingFunctions = require('./syncDrawingFunctions.js');
const { syncDrawWords } = syncDrawingFunctions;
const GIFEncoder = require('gifencoder');
const { createCanvas } = require('canvas');
const fs = require('fs');
const defs = require('./customDefs_charWidth_7.json');

function nodePixelTextRenderer({ columns, scale, text, defs, displayRows }) {
  const args = process.argv.slice(2);
  const fileName = args[0];
  if (!fileName) {
    console.log('You must provide a file name for the gif');
    process.exit(1);
  }
  if (/[^A-Za-z0-9_-]/.test(fileName)) {
    console.log(
      'Permitted characters must follow format [A-Za-z0-9_-].\nDo not provide an extension.',
    );
    process.exit(1);
  }
  const modifiedDefs = modifyDefs(defs);
  const { charWidth } = modifiedDefs;
  const { words } = makeWords(text, columns, modifiedDefs);
  const totalRows = words.slice(-1)[0].row + 1;
  const { ctx, config } = setupCanvas({
    canvas: createCanvas(),
    totalRows,
    columns,
    scale,
    charWidth,
    gridSpaceX: 0,
    gridSpaceY: scale,
    displayRows,
  });
  const state = makeStateSync({ ctx, words, config });
  const encoder = new GIFEncoder(ctx.canvas.width, ctx.canvas.height);
  encoder.createReadStream().pipe(fs.createWriteStream(`${fileName}.gif`));
  process.stdout.write('Init encoder');
  encoder.start();
  encoder.setRepeat(0); // 0 for repeat, -1 for no-repeat
  encoder.setDelay(20); // frame delay in ms
  encoder.setQuality(5);
  state.config.snapshot = payload => {
    // if we want to change frame durations, we'll have to do it here
    // pass snapshot() the desired duration when it is called
    // this could be attached to each char - or use a default param
    // and frames that should linger longer will receive an override
    // encoder.setDelay(20)
    if (payload?.last) {
      encoder.setDelay(500);
    }
    try {
      process.stdout.write('.');
      encoder.addFrame(ctx);
    } catch (error) {
      console.log(error);
      process.exit(1);
    }
  };
  process.stdout.write('\nRecording frames');
  drawBorder(state);
  syncDrawWords({
    state,
  });
  encoder.finish();
  process.stdout.write('Done!');
}

const borgQueenAteABattery =
  "My <HL>Borg <HL>Queen ate a <HL>Battery, like a <HL>Big square battery, like a <HL>car <HL>battery. She just keeps eating them. \nthen we go to the doctor and he says, 'yeah, <HL>we <HL>found <HL>a <HL>Battery <HL>in <HL>there' ...";

const fromTheThing =
  '<HL>Projection:\n if <HL>intruder <HL>organism reaches civilized areas ...Entire world population infected <HL>27,000 hours from first contact.';

nodePixelTextRenderer({
  columns: 10,
  displayRows: 5,
  scale: 5,
  text: fromTheThing.toUpperCase(),
  defs,
});
