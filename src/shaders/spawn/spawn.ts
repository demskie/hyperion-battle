import * as gpu from "gpu-compute";
import { searchAndReplace } from "../../searchandreplace";

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

const maskShader = new gpu.ComputeShader(maskFrag, searchAndReplace, gpu.passThruVert);
const scanShader = new gpu.ComputeShader(scanFrag, searchAndReplace, gpu.passThruVert);
const grabTexelShader = new gpu.ComputeShader(grabTexelFrag, searchAndReplace, gpu.passThruVert);
const scatterShader = new gpu.ComputeShader(scatterFrag, searchAndReplace, gpu.passThruVert);
const insertPositionsShader = new gpu.ComputeShader(insertPositionsFrag, searchAndReplace, gpu.passThruVert);
const insertGenericDataShader = new gpu.ComputeShader(insertGenericDataFrag, searchAndReplace, gpu.passThruVert);
const reinitializeShader = new gpu.ComputeShader(reinitializeFrag, searchAndReplace, gpu.passThruVert);
const maskLeftCornersShader = new gpu.ComputeShader(maskLeftCornersFrag, searchAndReplace, gpu.passThruVert);
const maskRightCornersShader = new gpu.ComputeShader(maskRightCornersFrag, searchAndReplace, gpu.passThruVert);
const maskTopCornersShader = new gpu.ComputeShader(maskTopCornersFrag, searchAndReplace, gpu.passThruVert);
const maskBottomCornersShader = new gpu.ComputeShader(maskBottomCornersFrag, searchAndReplace, gpu.passThruVert);

export function execute(
  fighterSpatialIndex: gpu.RenderTarget,
  fighterPositions: gpu.RenderTarget,
  fighterColors: gpu.RenderTarget,
  fighterFlags: gpu.RenderTarget,
  fullTargetAlpha: gpu.RenderTarget,
  singleTexelTargetAlpha: gpu.RenderTarget,
  fighterPositionsCPU: gpu.RenderTarget,
  fighterColorsCPU: gpu.RenderTarget,
  fighterFlagsCPU: gpu.RenderTarget
) {
  // ensure that the provided texture widths are valid
  const width = fighterSpatialIndex.width;
  if (fighterPositions.width !== width) throw new Error("fighterPositions.width !== fighterSpatialIndex.width");
  if (fighterFlags.width !== width) throw new Error("fighterPositions.width !== fighterSpatialIndex.width");
  if (fullTargetAlpha.width !== width) throw new Error("fullTargetAlpha.width !== fighterSpatialIndex.width");
  if (singleTexelTargetAlpha.width !== 1) throw new Error("singleTexelTargetAlpha.width !== 1");

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
    u_cpuInvalidStartX: 0,
    u_cpuInvalidStartY: 0,
    u_cpuWidth: width,
    u_width: width
  });
  fighterColors.compute(insertGenericDataShader, {
    u_tex: fighterColorsCPU,
    u_offsetTex: singleTexelTargetAlpha,
    u_width: width
  });
  fighterFlags.compute(insertGenericDataShader, {
    u_tex: fighterFlagsCPU,
    u_offsetTex: singleTexelTargetAlpha,
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
}
