import * as gpu from "gpu-compute";
import { readFileSync } from "fs";
import * as common from "../../common";

beforeAll(() => {
  gpu.setWebGLContext(require("gl")(1, 1));
});

// https://stackoverflow.com/a/34464919

test("mergesort", () => {
  const length = 16;

  const mergeSortShader = new gpu.ComputeShader(
    readFileSync(require.resolve("./00_mergesort.frag"), "utf8"),
    common.searchAndReplace
  );

  const target = new gpu.RenderTarget(4);

  const arr = [] as number[];
  [
    [0, 0, 0, 128],
    [0, 0, 0, 127],
    [0, 0, 0, 126],
    [0, 0, 0, 127]
  ].forEach((vals: number[]) => {
    arr.push(...vals);
  });
  target.pushTextureData(new Uint8Array(arr));

  const t = Math.floor(Math.ceil(Math.log2(length)));

  let p = Math.floor(Math.pow(2, t - 1));

  while (p > 0) {
    let q = Math.floor(Math.pow(2, t - 1));
    let r = 0;
    let d = p;

    while (d > 0) {
      // per pixel
      for (let i = 0; i < length - d; ++i) {
        if ((i & p) == r) {
          console.error(`${i} cmp ${i + d}`);
        }
      }
      target.compute(mergeSortShader, {
        u_tex: target,
        u_px: p % target.width,
        u_py: Math.floor(p / target.width),
        u_rx: r % target.width,
        u_ry: Math.floor(r / target.width),
        u_dx: d % target.width,
        u_dy: Math.floor(d / target.width),
        u_width: target.width
      });

      // prepare for next pass
      d = q - p;
      q = Math.floor(q / 2);
      r = p;
    }
    p = Math.floor(p / 2);
  }

  throw new Error(common.toUint16Pairs(target.readPixels()));
});
