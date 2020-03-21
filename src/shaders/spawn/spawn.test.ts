import * as gpu from "gpu-compute";
import { readFileSync } from "fs";
import * as common from "../../common";
import * as spawn from "./spawn";

common.prepareWebGLContext();

test("one bit radix sort", () => {
  const width = 2;

  const maskFrag = readFileSync(require.resolve("./01_mask.frag"), "utf8");
  const scanFrag = readFileSync(require.resolve("./02_scan.frag"), "utf8");
  const grabTexelFrag = readFileSync(require.resolve("./03_grab_texel.frag"), "utf8");
  const scatterFrag = readFileSync(require.resolve("./04_scatter.frag"), "utf8");

  const maskShader = new gpu.ComputeShader(maskFrag, common.searchAndReplace);
  const scanShader = new gpu.ComputeShader(scanFrag, common.searchAndReplace);
  const grabTexelShader = new gpu.ComputeShader(grabTexelFrag, common.searchAndReplace);
  const scatterShader = new gpu.ComputeShader(scatterFrag, common.searchAndReplace);
  const alphaTarget = new gpu.RenderTarget(width);
  const bravoTarget = new gpu.RenderTarget(width);
  const charlieTarget = new gpu.RenderTarget(1);

  alphaTarget.pushTextureData(new Uint8Array([1, 1, 1, 1, 3, 3, 3, 3, 2, 2, 2, 2, 4, 4, 4, 4]));

  bravoTarget.pushTextureData(new Uint8Array([128, 0, 0, 0, 0, 0, 0, 0, 128, 0, 0, 0, 0, 0, 0, 0]));

  bravoTarget.compute(maskShader, { u_tex: bravoTarget, bitIndex: 0, u_width: width });

  for (let i = 1; i < width * width; i *= 2) {
    bravoTarget.compute(scanShader, {
      u_tex: bravoTarget,
      u_neighborX: i % width,
      u_neighborY: Math.floor(i / width),
      u_width: width
    });
  }

  charlieTarget.compute(grabTexelShader, {
    u_tex: bravoTarget,
    u_xCoord: width - 1,
    u_yCoord: width - 1,
    u_width: width
  });

  bravoTarget.compute(scatterShader, { u_scanned: bravoTarget, u_width: width });

  alphaTarget.transpose(bravoTarget);

  expect(alphaTarget.readPixels()).toEqual(new Uint8Array([1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4]));

  maskShader.delete();
  scanShader.delete();
  scatterShader.delete();
  alphaTarget.delete();
  bravoTarget.delete();
});

test("spawning fighters", () => {
  const fighterSpatialIndex = new gpu.RenderTarget(4);
  const fighterPositions = new gpu.RenderTarget(4);
  const fighterColors = new gpu.RenderTarget(4);
  const fighterFlags = new gpu.RenderTarget(4);
  const fullTargetAlpha = new gpu.RenderTarget(4);
  const singleTexelTargetAlpha = new gpu.RenderTarget(1);
  const fighterPositionsCPU = new gpu.RenderTarget(2);
  const fighterColorsCPU = new gpu.RenderTarget(2);
  const fighterFlagsCPU = new gpu.RenderTarget(2);
  const spawnCount = 3;
  spawn.execute(
    fighterSpatialIndex,
    fighterPositions,
    fighterColors,
    fighterFlags,
    fullTargetAlpha,
    singleTexelTargetAlpha,
    fighterPositionsCPU,
    fighterColorsCPU,
    fighterFlagsCPU,
    spawnCount
  );
  expect(true).toEqual(true);
});
