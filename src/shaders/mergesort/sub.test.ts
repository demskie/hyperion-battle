import * as gpu from "gpu-compute";
import { readFileSync } from "fs";
import * as common from "../../common";

beforeAll(() => {
  gpu.setWebGLContext(require("gl")(1, 1));
});

function numberToArray(f: number) {
  const out = new Array(4).fill(0);
  out[3] = Math.floor(f / 4294967296);
  f -= 4294967296 * Math.floor(f / 4294967296);
  out[2] = Math.floor(f / 65536);
  f -= 65536 * Math.floor(f / 65536);
  out[1] = Math.floor(f / 256);
  f -= 256 * Math.floor(f / 256);
  out[0] = f;
  return out;
}

test("sub", () => {
  const mergeSortShader = new gpu.ComputeShader(
    readFileSync(require.resolve("./02_sub.frag"), "utf8"),
    common.searchAndReplace
  );

  const target1 = new gpu.RenderTarget(4);
  let arr = [] as number[];
  [
    numberToArray(0),
    numberToArray(1),
    numberToArray(2),
    numberToArray(3),
    numberToArray(4),
    numberToArray(5),
    numberToArray(6),
    numberToArray(7),
    numberToArray(8),
    numberToArray(9),
    numberToArray(10),
    numberToArray(11),
    numberToArray(12),
    numberToArray(13),
    numberToArray(14),
    [0, 0, 0, 0],
  ].forEach((vals: number[]) => {
    arr.push(...vals);
  });
  target1.pushTextureData(new Uint8Array(arr));

  const target2 = new gpu.RenderTarget(4);
  arr = [] as number[];
  [
    numberToArray(0),
    numberToArray(1),
    numberToArray(2),
    numberToArray(3),
    numberToArray(4),
    numberToArray(5),
    numberToArray(6),
    numberToArray(7),
    numberToArray(8),
    numberToArray(9),
    numberToArray(10),
    numberToArray(11),
    numberToArray(12),
    numberToArray(13),
    numberToArray(14),
    numberToArray(1),
  ].forEach((vals: number[]) => {
    arr.push(...vals);
  });
  target2.pushTextureData(new Uint8Array(arr));

  const t = Date.now();

  const target3 = new gpu.RenderTarget(4);
  target3.compute(mergeSortShader, {
    Data1: target1,
    Data2: target2,
    Width: target3.width,
  });

  console.log(`${Date.now() - t}ms`);

  const pixels = target3.readPixels();
  const out = new Array();
  for (let i = 0; i < pixels.length; i += 4) {
    out.push(pixels[i] + pixels[i + 1] * 256 + pixels[i + 2] * 65536 + pixels[i + 3] * 4294967296);
  }
  throw new Error(pixels);
});
