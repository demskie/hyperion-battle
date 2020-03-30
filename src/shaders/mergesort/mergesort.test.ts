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
    [0, 0, 0, 125]
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
        u_lx: (length - d) % target.width,
        u_ly: Math.floor((length - d) / target.width),
        u_width: target.width
      });

      console.log({
        u_px: p % target.width,
        u_py: Math.floor(p / target.width),
        u_rx: r % target.width,
        u_ry: Math.floor(r / target.width),
        u_dx: d % target.width,
        u_dy: Math.floor(d / target.width),
        u_lx: (length - d) % target.width,
        u_ly: Math.floor((length - d) / target.width),
        u_width: target.width
      });

      console.log(common.toUint16Pairs(target.readPixels()));

      console.error("////////////////////////////////");

      // prepare for next pass
      d = q - p;
      q = Math.floor(q / 2);
      r = p;
    }
    p = Math.floor(p / 2);
  }

  throw new Error(common.toUint16Pairs(target.readPixels()));
});

/*
test("mergesort", () => {
  const length = 16;

  const mergeSortShader = new gpu.ComputeShader(
    readFileSync(require.resolve("./01_mergesort.frag"), "utf8"),
    common.searchAndReplace
  );

  const target = new gpu.RenderTarget(4);

  const arr = [] as number[];
  [
    [0, 0, 0, 128],
    [0, 0, 0, 127],
    [0, 0, 0, 126],
    [0, 0, 0, 125]
  ].forEach((vals: number[]) => {
    arr.push(...vals);
  });
  target.pushTextureData(new Uint8Array(arr));

  const n = length;

  const logFieldsize = Math.log2(target.width);

  let stepsLeft = ((logFieldsize + logFieldsize) * (logFieldsize + logFieldsize + 1)) / 2;

  let stage = 0;
  let pass = 0;

  while (stepsLeft--) {
    const pstage = 1 << stage;
    const ppass = 1 << pass;

    // console.log(`pstage ${pstage} ppass ${ppass} stage ${stage} pass ${pass} stepsLeft ${stepsLeft}`);

    target.compute(mergeSortShader, {
      Data: target,
      TwoStage: pstage + pstage,
      Pass_mod_Stage: ppass % pstage,
      TwoStage_PmS_1: pstage + pstage - (ppass % pstage) - 1,
      Width: target.width,
      Height: target.width,
      Pass: ppass
    });

    if (pass > 0) {
      pass--;
    } else {
      stage++;
      pass = stage;
    }
  }

  // stepsLeft = totalSteps = ((logFieldsize+logFieldsize)*(logFieldsize+logFieldsize+1))/2;
  // stage = pass = -1;

  // int pstage = (1<<stage);
  // int ppass  = (1<<pass);

  // glUniform3fARB(oddevenMergeSort.getUniformLocation("Param1"),
  //                float(pstage+pstage),
  //                float(ppass%pstage),
  //                float((pstage+pstage)-(ppass%pstage)-1));
  // glUniform3fARB(oddevenMergeSort.getUniformLocation("Param2"),
  //                float(width),
  //                float(height),
  //                float(ppass));
  // glUniform1iARB(oddevenMergeSort.getUniformLocation("Data"), 0);
  // staticdebugmsg("sort","stage "<<pstage<<" pass "<<ppass);

  throw new Error(common.toUint16Pairs(target.readPixels()));
});

*/
