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
    readFileSync(require.resolve("./01_mergesort.frag"), "utf8"),
    common.searchAndReplace
  );

  const target = new gpu.RenderTarget(4);

  const arr = [] as number[];
  [
    [0, 10, 0, 200],
    [0, 11, 0, 190],
    [0, 12, 0, 180],
    [0, 13, 0, 170],
    [0, 14, 0, 160],
    [0, 15, 0, 150],
    [0, 16, 0, 140],
    [0, 17, 0, 130],
    [0, 18, 0, 120],
    [0, 19, 0, 110],
    [0, 20, 0, 100],
    [0, 21, 0, 90],
    [0, 22, 0, 80],
    [0, 23, 0, 70],
    [0, 24, 0, 60],
    [0, 25, 0, 50],
  ].forEach((vals: number[]) => {
    arr.push(...vals);
  });
  target.pushTextureData(new Uint8Array(arr));

  let pstage = 1;
  let ppass = pstage;

  for (;;) {
    for (;;) {
      target.compute(mergeSortShader, {
        Data: target,
        TwoStage: pstage + pstage,
        Pass_mod_Stage: ppass % pstage,
        TwoStage_PmS_1: pstage + pstage - (ppass % pstage) - 1,
        Width: target.width,
        Height: target.width,
        Pass: ppass,
      });
      ppass /= 2;
      if (ppass < 1) break;
    }
    pstage *= 2;
    ppass = pstage;
    if (pstage >= Math.pow(target.width, 2)) break;
  }

  throw new Error(common.toUint16Pairs(target.readPixels()));
});
