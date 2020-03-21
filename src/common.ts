import * as gpu from "gpu-compute";

/////////////////////////////////////////////////
//// FUNCTION STRINGS FOR SHADER COMPILATION ////
/////////////////////////////////////////////////

export const searchAndReplace = {
  "float round(float f);": gpu.functionStrings.round,
  "float floatEquals(float, float);": gpu.functionStrings.floatEquals,
  "float floatNotEquals(float, float);": gpu.functionStrings.floatNotEquals,
  "float floatLessThan(float, float);": gpu.functionStrings.floatLessThan,
  "float floatGreaterThan(float, float);": gpu.functionStrings.floatGreaterThan,
  "float floatLessThanOrEqual(float, float);": gpu.functionStrings.floatLessThanOrEqual,
  "float floatGreaterThanOrEqual(float, float);": gpu.functionStrings.floatGreaterThanOrEqual,
  "float vec2ToInt16(vec2);": gpu.functionStrings.vec2ToInt16,
  "vec2 int16ToVec2(float);": gpu.functionStrings.int16ToVec2,
  "float vec2ToUint16(vec2);": gpu.functionStrings.vec2ToUint16,
  "vec2 uint16ToVec2(float);": gpu.functionStrings.uint16ToVec2,
  "void unpackBooleans(float, inout bool arr[8]);": gpu.functionStrings.unpackBooleans,
  "void packBooleans(bool arr[8]);": gpu.functionStrings.packBooleans,
  "struct texcoord { float x, y, w; };": gpu.functionStrings.texcoord,
  "texcoord addTexcoord(texcoord, float);": gpu.functionStrings.addTexcoord,
  "texcoord subtractTexcoord(texcoord, float);": gpu.functionStrings.subtractTexcoord,
  "texcoord oneSixteenthTexcoord(texcoord);": gpu.functionStrings.oneSixteenthTexcoord,
  "texcoord oneFourthTexcoord(texcoord);": gpu.functionStrings.oneFourthTexcoord,
  "texcoord oneHalfTexcoord(texcoord);": gpu.functionStrings.oneHalfTexcoord,
  "texcoord doubleTexcoord(texcoord);": gpu.functionStrings.doubleTexcoord,
  "texcoord quadrupleTexcoord(texcoord);": gpu.functionStrings.quadrupleTexcoord,
  "texcoord sexdecupleTexcoord(texcoord);": gpu.functionStrings.sexdecupleTexcoord,

  "bool getMSB(float);": `
bool getMSB(float f) { 
  return bool(floatGreaterThanOrEqual(f * 255.0, 128.0));
}`.trim(),

  "float clearMSB(float);": `
float clearMSB(float f) {
  return (f * 255.0 - floatGreaterThanOrEqual(f * 255.0, 128.0) * 128.0) / 255.0;
}`.trim(),

  "float setMSB(float, bool);": `
float setMSB(float f, bool b) {
  return (f * 255.0 + float(b) * floatLessThan(f * 255.0, 128.0) * 128.0) / 255.0;
}`.trim(),

  "texcoord resizeTexcoord(texcoord, float);": `
texcoord resizeTexcoord(texcoord t, float w) {
  float adjustedY = t.y / (w / t.w);
  texcoord z = texcoord(t.x, floor(adjustedY), w);
  z.x += floatLessThan(adjustedY, 1.0)
       * floatGreaterThan(adjustedY, -1.0)
       * floatNotEquals(t.y, 0.0) * z.w * adjustedY;
  z.y += floatLessThan(0.0, z.x) * ceil(z.x / z.w)
       + floatGreaterThan(0.0, z.x) * floor(z.x / z.w);
  z.x = mod(z.x, z.w);
  return z;
}`.trim(),

  "void equalizeTexcoordWidths(inout texcoord, inout texcoord);": `
void equalizeTexcoordWidths(inout texcoord a, inout texcoord b) {
  a = resizeTexcoord(a, max(a.w, b.w));
  b = resizeTexcoord(b, max(a.w, b.w));
}`.trim(),

  "texcoord addTexcoord(texcoord, texcoord);": `
texcoord addTexcoord(texcoord a, texcoord b) {
  equalizeTexcoordWidths(a, b);
  a.y += b.y;
  return addTexcoord(a, b.x);
}`.trim(),

  "texcoord subtractTexcoord(texcoord, texcoord);": `
texcoord subtractTexcoord(texcoord a, texcoord b) {
  equalizeTexcoordWidths(a, b);
  a.y -= b.y;
  return subtractTexcoord(a, b.x);
}`.trim(),

  "float texcoordLessThan(texcoord, texcoord);": `
float texcoordLessThan(texcoord a, texcoord b) {
  equalizeTexcoordWidths(a, b);
  return floatEquals(a.y, b.y) * floatLessThan(a.x, b.x) + floatLessThan(a.y, b.y);
}`.trim(),

  "float texcoordLessThanOrEqual(texcoord, texcoord);": `
float texcoordLessThanOrEqual(texcoord a, texcoord b) {
  equalizeTexcoordWidths(a, b);
  return floatEquals(a.y, b.y) * floatLessThanOrEqual(a.x, b.x) + floatLessThan(a.y, b.y);
}`.trim(),

  "float texcoordGreaterThan(texcoord, texcoord);": `
float texcoordGreaterThan(texcoord a, texcoord b) {
  return 1.0 - texcoordLessThanOrEqual(a, b);
}`.trim(),

  "float texcoordGreaterThanOrEqual(texcoord, texcoord);": `
float texcoordGreaterThanOrEqual(texcoord a, texcoord b) {
  return 1.0 - texcoordLessThan(a, b);
}`.trim()
};

//////////////////////////////////////////
//// UTILS FOR DEBUGGING GPGPU OUTPUT ////
//////////////////////////////////////////

export const toInt16Pairs = (bytes: Uint8Array) => {
  const output = [] as number[][];
  for (let i = 0; i < bytes.length && i < 4 * 4; i += 4)
    output.push([gpu.unpackInt16(bytes[i + 0], bytes[i + 1]), gpu.unpackInt16(bytes[i + 2], bytes[i + 3])]);
  return JSON.stringify(output, undefined, "");
};

export const toUint16Pairs = (bytes: Uint8Array) => {
  const output = [] as number[][];
  for (let i = 0; i < bytes.length && i < 4 * 4; i += 4)
    output.push([gpu.unpackUint16(bytes[i + 0], bytes[i + 1]), gpu.unpackUint16(bytes[i + 2], bytes[i + 3])]);
  return JSON.stringify(output, undefined, "");
};

export const toUint32 = (bytes: Uint8Array) => {
  return new Uint32Array(bytes.buffer);
  const output = [] as number[][];
  for (let i = 0; i < bytes.length && i < 4 * 4; i += 4)
    output.push([gpu.unpackUint16(bytes[i + 0], bytes[i + 1]), gpu.unpackUint16(bytes[i + 2], bytes[i + 3])]);
  return output;
};

function printFragCoordPairs(width: number, bytes: Uint8Array) {
  let s = "[\n";
  for (var i = 0; i < bytes.length; i += 4) {
    let v = gpu.unpackUint16(bytes[i + 0], bytes[i + 1]) + gpu.unpackUint16(bytes[i + 2], bytes[i + 3]) * width;
    s += `\ti: ${i / 4}  \tv: ${v}\n`;
  }
  console.log(s + "]\n");
}

function printUint16Pairs(width: number, bytes: Uint8Array) {
  let s = "[\n";
  for (var i = 0; i < bytes.length; i += 4) {
    let v = [gpu.unpackUint16(bytes[i + 0], bytes[i + 1]), gpu.unpackUint16(bytes[i + 2], bytes[i + 3])];
    s += `\ti: ${i / 4}  \tp: [ ${v[0]}, ${v[1]} ]\n`;
  }
  console.log(s + "]\n");
}

function printInt16Pairs(width: number, bytes: Uint8Array) {
  let s = "[\n";
  for (var i = 0; i < bytes.length; i += 4) {
    let v = [gpu.unpackInt16(bytes[i + 0], bytes[i + 1]), gpu.unpackInt16(bytes[i + 2], bytes[i + 3])];
    s += `\ti: ${i / 4}  \tp: [ ${v[0]}, ${v[1]} ]\n`;
  }
  console.log(s + "]\n");
}

function createUint16Indices(textureWidth: number) {
  const bytes = new Uint8Array(textureWidth * textureWidth * 4);
  for (var i = 0; i < bytes.length; i += 4) {
    var index = Math.floor(i / 4);
    var xArr = gpu.packUint16(Math.floor(index % textureWidth));
    var yArr = gpu.packUint16(Math.floor(index / textureWidth));
    bytes[i + 0] = xArr[0];
    bytes[i + 1] = xArr[1];
    bytes[i + 2] = yArr[0];
    bytes[i + 3] = yArr[1];
  }
  return bytes;
}

///////////////////////////////////////////
//// HACKY RUNTIME STUFF FOR JEST/NODE ////
///////////////////////////////////////////

export function prepareWebGLContext() {
  if (require("detect-node")) gpu.setWebGLContext(require("gl")(1, 1));
}

function mockReadFileSync(s: string) {
  return require("fs").readFileSync(require.resolve(s), "utf8");
}

jest.mock("!!raw-loader!./01_mask.frag", () => mockReadFileSync("./shaders/spawn/01_mask.frag"), { virtual: true }); // prettier-ignore
jest.mock("!!raw-loader!./02_scan.frag", () => mockReadFileSync("./shaders/spawn/02_scan.frag"), { virtual: true }); // prettier-ignore
jest.mock("!!raw-loader!./03_grab_texel.frag", () => mockReadFileSync("./shaders/spawn/03_grab_texel.frag"), { virtual: true }); // prettier-ignore
jest.mock("!!raw-loader!./04_scatter.frag", () => mockReadFileSync("./shaders/spawn/04_scatter.frag"), { virtual: true }); // prettier-ignore
jest.mock("!!raw-loader!./05_insert_positions.frag", () => mockReadFileSync("./shaders/spawn/05_insert_positions.frag"), { virtual: true }); // prettier-ignore
jest.mock("!!raw-loader!./06_insert_generic_data.frag", () => mockReadFileSync("./shaders/spawn/06_insert_generic_data.frag"), { virtual: true }); // prettier-ignore
jest.mock("!!raw-loader!./07_reinitialize.frag", () => mockReadFileSync("./shaders/spawn/07_reinitialize.frag"), { virtual: true }); // prettier-ignore
jest.mock("!!raw-loader!./08_mask_left_corners.frag", () => mockReadFileSync("./shaders/spawn/08_mask_left_corners.frag"), { virtual: true }); // prettier-ignore
jest.mock("!!raw-loader!./09_mask_right_corners.frag", () => mockReadFileSync("./shaders/spawn/09_mask_right_corners.frag"), { virtual: true }); // prettier-ignore
jest.mock("!!raw-loader!./10_mask_top_corners.frag", () => mockReadFileSync("./shaders/spawn/10_mask_top_corners.frag"), { virtual: true }); // prettier-ignore
jest.mock("!!raw-loader!./11_mask_bottom_corners.frag", () => mockReadFileSync("./shaders/spawn/11_mask_bottom_corners.frag"), { virtual: true }); // prettier-ignore
