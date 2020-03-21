import * as gpu from "gpu-compute";
import * as common from "../../common";

common.prepareWebGLContext();

// https://webpack.js.org/loaders/raw-loader/
/* eslint import/no-webpack-loader-syntax: off */
import maskFrag from "!!raw-loader!./01_mask.frag";
import scanFrag from "!!raw-loader!./02_scan.frag";
import grabTexelFrag from "!!raw-loader!./03_grab_texel.frag";
import scatterFrag from "!!raw-loader!./04_scatter.frag";
import insertPositionsFrag from "!!raw-loader!./05_insert_positions.frag";
import insertGenericDataFrag from "!!raw-loader!./06_insert_generic_data.frag";
import reinitializeFrag from "!!raw-loader!./07_reinitialize.frag";
import maskLeftCornersFrag from "!!raw-loader!./08_mask_left_corners.frag";
import maskRightCornersFrag from "!!raw-loader!./09_mask_right_corners.frag";
import maskTopCornersFrag from "!!raw-loader!./10_mask_top_corners.frag";
import maskBottomCornersFrag from "!!raw-loader!./11_mask_bottom_corners.frag";

const maskShader = new gpu.ComputeShader(maskFrag, common.searchAndReplace);
const scanShader = new gpu.ComputeShader(scanFrag, common.searchAndReplace);
const grabTexelShader = new gpu.ComputeShader(grabTexelFrag, common.searchAndReplace);
const scatterShader = new gpu.ComputeShader(scatterFrag, common.searchAndReplace);
const insertPositionsShader = new gpu.ComputeShader(insertPositionsFrag, common.searchAndReplace);
const insertGenericDataShader = new gpu.ComputeShader(insertGenericDataFrag, common.searchAndReplace);
const reinitializeShader = new gpu.ComputeShader(reinitializeFrag, common.searchAndReplace);
const maskLeftCornersShader = new gpu.ComputeShader(maskLeftCornersFrag, common.searchAndReplace);
const maskRightCornersShader = new gpu.ComputeShader(maskRightCornersFrag, common.searchAndReplace);
const maskTopCornersShader = new gpu.ComputeShader(maskTopCornersFrag, common.searchAndReplace);
const maskBottomCornersShader = new gpu.ComputeShader(maskBottomCornersFrag, common.searchAndReplace);

export function execute(
  fighterSpatialIndex: gpu.RenderTarget,
  fighterPositions: gpu.RenderTarget,
  fighterColors: gpu.RenderTarget,
  fighterFlags: gpu.RenderTarget,
  fullTargetAlpha: gpu.RenderTarget,
  singleTexelTargetAlpha: gpu.RenderTarget,
  fighterPositionsCPU: gpu.RenderTarget,
  fighterColorsCPU: gpu.RenderTarget,
  fighterFlagsCPU: gpu.RenderTarget,
  spawnCount: number
) {
  // sanity check the provided texture widths and parameters
  if (fighterPositions.width !== fighterSpatialIndex.width)
    throw new Error("fighterPositions.width does not equal fighterSpatialIndex.width");
  if (fighterFlags.width !== fighterSpatialIndex.width)
    throw new Error("fighterPositions.width does not equal fighterSpatialIndex.width");
  if (fullTargetAlpha.width !== fighterSpatialIndex.width)
    throw new Error("fullTargetAlpha.width does not equal fighterSpatialIndex.width");
  if (singleTexelTargetAlpha.width !== 1) throw new Error("singleTexelTargetAlpha.width does not equal one");
  if (fighterPositionsCPU.width > fighterPositions.width)
    throw new Error("fighterPositionsCPU.width is greater than fighterPositions.width");
  if (fighterColorsCPU.width !== fighterPositionsCPU.width)
    throw new Error("fighterColorsCPU.width does not equal fighterPositionsCPU.width");
  if (fighterFlagsCPU.width !== fighterPositionsCPU.width)
    throw new Error("fighterFlagsCPU.width does not equal fighterPositionsCPU.width");
  if (spawnCount > fighterSpatialIndex.width * fighterSpatialIndex.width)
    throw new Error("spawnCount is greater than fighterSpatialIndex.width * fighterSpatialIndex.width");
  if (spawnCount < 1) throw new Error("spawnCount is less than one");

  // define reference widths
  const width = fighterSpatialIndex.width;
  const cpuWidth = fighterPositionsCPU.width;

  // create a bit mask based on fighter "aliveness"
  fullTargetAlpha.compute(maskShader, { u_tex: fighterFlags, u_bitIndex: 0, u_width: width });

  // using the bit mask create an inclusive prefix sum
  for (let i = 1; i < width * width; i *= 2) {
    fullTargetAlpha.compute(scanShader, {
      u_tex: fullTargetAlpha,
      u_neighborX: i % width,
      u_neighborY: Math.floor(i / width),
      u_width: width
    });
  }

  // copy the last texel value to be used later as an offset for actually inserting new fighters
  // BUG: could potentially use the texture backbuffer instead and save a draw call
  singleTexelTargetAlpha.compute(grabTexelShader, {
    u_tex: fullTargetAlpha,
    u_xCoord: width - 1,
    u_yCoord: width - 1,
    u_width: width
  });

  // create scatter coordinates based on the following algorithm:
  // https://developer.nvidia.com/gpugems/gpugems3/part-vi-gpu-computing/chapter-39-parallel-prefix-sum-scan-cuda
  fullTargetAlpha.compute(scatterShader, { u_scanned: fullTargetAlpha, u_width: width });

  // transpose the values using the scatter coordinates
  fighterPositions.transpose(fullTargetAlpha);
  fighterColors.transpose(fullTargetAlpha);
  fighterFlags.transpose(fullTargetAlpha);

  // blindly insert data using offset coordinates
  fighterPositions.compute(insertPositionsShader, {
    u_fighterPositions: fighterPositions,
    u_fighterPositionsCPU: fighterPositionsCPU,
    u_singleTexelOffset: singleTexelTargetAlpha,
    u_cpuInvalidStartX: spawnCount % cpuWidth,
    u_cpuInvalidStartY: Math.floor(spawnCount / cpuWidth),
    u_cpuWidth: cpuWidth,
    u_width: width
  });
  fighterColors.compute(insertGenericDataShader, {
    u_genericData: fighterColors,
    u_genericDataCPU: fighterColorsCPU,
    u_singleTexelOffset: singleTexelTargetAlpha,
    u_cpuInvalidStartX: spawnCount % cpuWidth,
    u_cpuInvalidStartY: Math.floor(spawnCount / cpuWidth),
    u_cpuWidth: cpuWidth,
    u_width: width
  });
  fighterFlags.compute(insertGenericDataShader, {
    u_genericData: fighterFlags,
    u_genericDataCPU: fighterFlagsCPU,
    u_singleTexelOffset: singleTexelTargetAlpha,
    u_cpuInvalidStartX: spawnCount % cpuWidth,
    u_cpuInvalidStartY: Math.floor(spawnCount / cpuWidth),
    u_cpuWidth: cpuWidth,
    u_width: width
  });

  // reinitialize the spatial index
  fighterSpatialIndex.compute(reinitializeShader);

  // define how to do a single pass of radix sort with a provided mask
  const radixSortSpatialIndexUsingMask = (mask: gpu.RenderTarget) => {
    // create an inclusive prefix sum using the bit mask
    for (let i = 1; i < width * width; i *= 2) {
      fullTargetAlpha.compute(scanShader, {
        u_tex: mask,
        u_neighborX: i % width,
        u_neighborY: Math.floor(i / width),
        u_width: width
      });
    }
    // create scatter coordinates
    fullTargetAlpha.compute(scatterShader, { u_scanned: fullTargetAlpha, u_width: width });
    // transpose the values using the scatter coordinates
    fighterSpatialIndex.transpose(fullTargetAlpha);
  };

  // sort spatial index vertically
  for (let bitIndex = 31; bitIndex >= 16; bitIndex--)
    radixSortSpatialIndexUsingMask(
      fullTargetAlpha.compute(maskShader, {
        u_tex: fighterPositions,
        u_bitIndex: bitIndex,
        u_width: width
      })
    );

  // vertically sort based on whether the fighter is "alive" and should be in the topLeft or topRight corners
  radixSortSpatialIndexUsingMask(
    fullTargetAlpha.compute(maskTopCornersShader, {
      u_fighterPositions: fighterPositions,
      u_fighterFlags: fighterFlags,
      u_width: width
    })
  );

  // vertically sort based on whether the fighter is "alive" and should be in the bottomLeft or bottomRight corners
  radixSortSpatialIndexUsingMask(
    fullTargetAlpha.compute(maskBottomCornersShader, {
      u_fighterPositions: fighterPositions,
      u_fighterFlags: fighterFlags,
      u_width: width
    })
  );

  // sort spatial index horizontally
  for (let bitIndex = 15; bitIndex >= 0; bitIndex--)
    radixSortSpatialIndexUsingMask(
      fullTargetAlpha.compute(maskShader, {
        u_tex: fighterPositions,
        u_bitIndex: bitIndex,
        u_width: width
      })
    );

  // horizontally sort based on whether the fighter is "alive" and should be in the topLeft or BottomLeft corners
  radixSortSpatialIndexUsingMask(
    fullTargetAlpha.compute(maskLeftCornersShader, {
      u_fighterPositions: fighterPositions,
      u_fighterFlags: fighterFlags,
      u_width: width
    })
  );

  // horizontally sort based on whether the fighter is "alive" and should be in the topRight or bottomRight corners
  radixSortSpatialIndexUsingMask(
    fullTargetAlpha.compute(maskRightCornersShader, {
      u_fighterPositions: fighterPositions,
      u_fighterFlags: fighterFlags,
      u_width: width
    })
  );
}
