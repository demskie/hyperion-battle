import * as gpu from "gpu-compute";

beforeAll(() => {
  gpu.setWebGLContext(require("gl")(1, 1));
});

const maskFrag = require("fs").readFileSync(
  require("path").join(__dirname, "./", "02_mask.frag"),
  "utf8",
  (err: any, data: any) => data
);

test("mask", () => {
  const maskShader = new gpu.ComputeShader(maskFrag, searchAndReplace, gpu.passThruVert);
  const maskTarget = new gpu.RenderTarget(1);
  const flagsTarget = new gpu.RenderTarget(1);

  flagsTarget.pushTextureData(new Uint8Array([128, 0, 0, 0]));
  maskTarget.compute(maskShader, { u_flags: flagsTarget });
  expect(maskTarget.readPixels()).toEqual(new Uint8Array([128, 1, 0, 0]));

  flagsTarget.pushTextureData(new Uint8Array([0, 0, 0, 0]));
  maskTarget.compute(maskShader, { u_flags: flagsTarget });
  expect(maskTarget.readPixels()).toEqual(new Uint8Array([0, 0, 0, 0]));

  maskShader.delete();
  maskTarget.delete();
  flagsTarget.delete();
});

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
  "texcoord add(texcoord, float);": gpu.functionStrings.texcoord,
  "texcoord subtract(texcoord, float);": gpu.functionStrings.texcoord,
  "texcoord oneSixteenthTexcoord(texcoord);": gpu.functionStrings.oneSixteenthTexcoord,
  "texcoord oneFourthTexcoord(texcoord);": gpu.functionStrings.oneFourthTexcoord,
  "texcoord oneHalfTexcoord(texcoord);": gpu.functionStrings.oneHalfTexcoord,
  "texcoord doubleTexcoord(texcoord);": gpu.functionStrings.doubleTexcoord,
  "texcoord quadrupleTexcoord(texcoord);": gpu.functionStrings.quadrupleTexcoord,
  "texcoord sexdecupleTexcoord(texcoord);": gpu.functionStrings.sexdecupleTexcoord,
  "bool getMSB(float);": "bool getMSB(float f) { return bool(floatGreaterThanOrEqual(f * 255.0, 128.0)); }",
  "float clearMSB(float);":
    "float clearMSB(float f) { return (f * 255.0 - floatGreaterThanOrEqual(f * 255.0, 128.0) * 128.0) / 255.0; }",
  "float setMSB(float, bool);":
    "float setMSB(float f, bool b) { return (f * 255.0 + float(b) * floatLessThan(f * 255.0, 128.0) * 128.0) / 255.0; }"
};

export const toInt16Pairs = (bytes: Uint8Array) => {
  const output = [] as number[][];
  for (let i = 0; i < bytes.length && i < 4 * 4; i += 4)
    output.push([gpu.unpackInt16(bytes[i + 0], bytes[i + 1]), gpu.unpackInt16(bytes[i + 2], bytes[i + 3])]);
  return output;
};
