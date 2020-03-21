import * as gpu from "gpu-compute";

import { searchAndReplace } from "../../searchandreplace";

beforeAll(() => {
  gpu.setWebGLContext(require("gl")(1, 1));
});

const maskFrag = require("fs").readFileSync(
  require("path").join(__dirname, "./", "01_mask.frag"),
  "utf8",
  (err: any, data: any) => data
);

const scanFrag = require("fs").readFileSync(
  require("path").join(__dirname, "./", "02_scan.frag"),
  "utf8",
  (err: any, data: any) => data
);

const copyLastTexelFrag = require("fs").readFileSync(
  require("path").join(__dirname, "./", "03_copy_last_texel.frag"),
  "utf8",
  (err: any, data: any) => data
);

const scatterFrag = require("fs").readFileSync(
  require("path").join(__dirname, "./", "04_scatter.frag"),
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

test("one bit radix sort", () => {
  const width = 2;

  const maskShader = new gpu.ComputeShader(maskFrag, searchAndReplace, gpu.passThruVert);
  const scanShader = new gpu.ComputeShader(scanFrag, searchAndReplace, gpu.passThruVert);
  const copyLastTexelShader = new gpu.ComputeShader(copyLastTexelFrag, searchAndReplace, gpu.passThruVert);
  const scatterShader = new gpu.ComputeShader(scatterFrag, searchAndReplace, gpu.passThruVert);
  const alphaTarget = new gpu.RenderTarget(width);
  const bravoTarget = new gpu.RenderTarget(width);
  const charlieTarget = new gpu.RenderTarget(1);

  alphaTarget.pushTextureData(new Uint8Array([1, 1, 1, 1, 3, 3, 3, 3, 2, 2, 2, 2, 4, 4, 4, 4]));

  bravoTarget.pushTextureData(new Uint8Array([128, 0, 0, 0, 0, 0, 0, 0, 128, 0, 0, 0, 0, 0, 0, 0]));

  bravoTarget.compute(maskShader, { u_flags: bravoTarget, u_width: width });

  for (let i = 1; i < width * width; i *= 2) {
    bravoTarget.compute(scanShader, {
      u_tex: bravoTarget,
      u_neighborX: i % width,
      u_neighborY: Math.floor(i / width),
      u_width: width
    });
  }

  charlieTarget.compute(copyLastTexelShader, { u_tex: bravoTarget, u_width: width });

  bravoTarget.compute(scatterShader, { u_scanned: bravoTarget, u_width: width });

  alphaTarget.transpose(bravoTarget);

  expect(alphaTarget.readPixels()).toEqual(new Uint8Array([1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4]));

  maskShader.delete();
  scanShader.delete();
  scatterShader.delete();
  alphaTarget.delete();
  bravoTarget.delete();
});

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
