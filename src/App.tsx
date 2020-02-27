import React from "react";
import * as gpu from "gpu-compute";
import * as THREE from "three";
import "./App.css";

// https://webpack.js.org/loaders/raw-loader/
/* eslint import/no-webpack-loader-syntax: off */
import initializeIndicesFrag from "!!raw-loader!./shaders/00_initializeIndices.frag";
import initializeLocationsFrag from "!!raw-loader!./shaders/00_initializeLocations.frag";
import sortSidewaysEvenOddFrag from "!!raw-loader!./shaders/01_sortSidewaysEvenOdd.frag";
import sortSidewaysOddEvenFrag from "!!raw-loader!./shaders/02_sortSidewaysOddEven.frag";
import sortUpwardsEvenOddFrag from "!!raw-loader!./shaders/03_sortUpwardsEvenOdd.frag";
import sortUpwardsOddEvenFrag from "!!raw-loader!./shaders/04_sortUpwardsOddEven.frag";
import fighterComputeFrag from "!!raw-loader!./shaders/05_fighterCompute.frag";
import fighterRenderVert from "!!raw-loader!./shaders/06_fighterRender.vert";
import fighterRenderFrag from "!!raw-loader!./shaders/06_fighterRender.frag";

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
  "vec2 uint16ToVec2(float);": gpu.functionStrings.uint16ToVec2
};

function App() {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    40,
    window.innerWidth / window.innerHeight,
    Number.MIN_VALUE,
    Number.MAX_VALUE
  );

  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const initializeIndicesShader = new gpu.ComputeShader(
    initializeIndicesFrag,
    searchAndReplace,
    gpu.passThruVert,
    renderer.getContext()
  );
  const initializeLocationsShader = new gpu.ComputeShader(
    initializeLocationsFrag,
    searchAndReplace,
    gpu.passThruVert,
    renderer.getContext()
  );
  const sortSidewaysEvenOddShader = new gpu.ComputeShader(
    sortSidewaysEvenOddFrag,
    searchAndReplace,
    gpu.passThruVert,
    renderer.getContext()
  );
  const sortSidewaysOddEvenShader = new gpu.ComputeShader(
    sortSidewaysOddEvenFrag,
    searchAndReplace,
    gpu.passThruVert,
    renderer.getContext()
  );
  const sortUpwardsEvenOddShader = new gpu.ComputeShader(
    sortUpwardsEvenOddFrag,
    searchAndReplace,
    gpu.passThruVert,
    renderer.getContext()
  );
  const sortUpwardsOddEvenShader = new gpu.ComputeShader(
    sortUpwardsOddEvenFrag,
    searchAndReplace,
    gpu.passThruVert,
    renderer.getContext()
  );
  const fighterComputeShader = new gpu.ComputeShader(
    fighterComputeFrag,
    searchAndReplace,
    gpu.passThruVert,
    renderer.getContext()
  );

  const width = 4096;

  const fighterIndices = new gpu.RenderTarget(width);
  const fighterLocations = new gpu.RenderTarget(width);

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "f",
    new THREE.Uint8BufferAttribute(new Uint8Array(fighterIndices.width * fighterIndices.width), 1)
  );

  const material = new THREE.RawShaderMaterial({
    uniforms: { uTexture: { value: new THREE.TextureLoader().load("fighter.png") } },
    vertexShader: fighterRenderVert,
    fragmentShader: fighterRenderFrag
  });
  material.transparent = false;
  material.depthTest = false;

  const points = new THREE.Points(geometry, material);
  points.frustumCulled = false;
  points.renderOrder = 999;
  scene.add(points);

  let prevDate = Date.now();

  const toInt16Pairs = (bytes: Uint8Array) => {
    const output = [] as number[][];
    for (let i = 0; i < bytes.length && i < 4 * 4; i += 4)
      output.push([gpu.unpackInt16(bytes[i + 0], bytes[i + 1]), gpu.unpackInt16(bytes[i + 2], bytes[i + 3])]);
    return output;
  };

  fighterIndices.compute(initializeIndicesShader);
  fighterLocations.compute(initializeLocationsShader, { u_width: fighterLocations.width });

  // console.debug(JSON.stringify(toInt16Pairs(fighterIndices.readPixels()), undefined, "  "));
  // console.debug(JSON.stringify(toInt16Pairs(fighterLocations.readPixels()), undefined, "  "));

  const animate = function() {
    const elapsed = Math.abs(prevDate - (prevDate = Date.now()));

    fighterIndices.compute(sortSidewaysEvenOddShader, {
      u_width: fighterIndices.width,
      u_indices: fighterIndices,
      u_locations: fighterLocations
    });
    fighterIndices.compute(sortSidewaysOddEvenShader, {
      u_width: fighterIndices.width,
      u_indices: fighterIndices,
      u_locations: fighterLocations
    });
    fighterIndices.compute(sortUpwardsEvenOddShader, {
      u_width: fighterIndices.width,
      u_indices: fighterIndices,
      u_locations: fighterLocations
    });
    fighterIndices.compute(sortUpwardsOddEvenShader, {
      u_width: fighterIndices.width,
      u_indices: fighterIndices,
      u_locations: fighterLocations
    });

    return console.debug(JSON.stringify(toInt16Pairs(fighterIndices.readPixels()), undefined, "  "));

    fighterLocations.compute(fighterComputeShader, {
      u_width: fighterLocations.width,
      u_elapsed: elapsed,
      u_indices: fighterIndices,
      u_texCoordsBackbuffer: fighterIndices.getBackbuffer()
        ? (fighterIndices.getBackbuffer() as gpu.RenderTarget)
        : fighterIndices,
      u_locations: fighterLocations
    });

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  };
  requestAnimationFrame(animate);

  return <div />;
}

export default App;
