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
  "vec2 uint16ToVec2(float);": gpu.functionStrings.uint16ToVec2,
  "void unpackBooleans(float, inout bool arr[8]);": gpu.functionStrings.unpackBooleans,
  "void packBooleans(bool arr[8]);": gpu.functionStrings.packBooleans,
  "struct texcoord { float x, y, w; };": gpu.functionStrings.texcoord,
  "texcoord addTexcoord(texcoord, float);": gpu.functionStrings.addTexcoord,
  "texcoord subtractTexcoord(texcoord, float);": gpu.functionStrings.subtractTexcoord,
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

function App() {
  const scene = new THREE.Scene();
  // scene.background = new THREE.Color("lightblue");

  const camera = new THREE.PerspectiveCamera(0.01, window.innerWidth / window.innerHeight, 0.001, 1e7);
  camera.position.z = 10000;

  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const initializeIndicesShader = new gpu.ComputeShader(initializeIndicesFrag, searchAndReplace, gpu.passThruVert);
  const initializeLocationsShader = new gpu.ComputeShader(initializeLocationsFrag, searchAndReplace, gpu.passThruVert);
  const sortSidewaysEvenOddShader = new gpu.ComputeShader(sortSidewaysEvenOddFrag, searchAndReplace, gpu.passThruVert);
  const sortSidewaysOddEvenShader = new gpu.ComputeShader(sortSidewaysOddEvenFrag, searchAndReplace, gpu.passThruVert);
  const sortUpwardsEvenOddShader = new gpu.ComputeShader(sortUpwardsEvenOddFrag, searchAndReplace, gpu.passThruVert);
  const sortUpwardsOddEvenShader = new gpu.ComputeShader(sortUpwardsOddEvenFrag, searchAndReplace, gpu.passThruVert);
  const fighterComputeShader = new gpu.ComputeShader(fighterComputeFrag, searchAndReplace, gpu.passThruVert);

  const width = 256;

  const fighterIndices = new gpu.RenderTarget(width);
  const fighterLocations = new gpu.RenderTarget(width);

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(new Float32Array([0, 0, 0]), 3));

  const material = new THREE.RawShaderMaterial({
    uniforms: { u_texture: { value: new THREE.TextureLoader().load("fighter.png") } },
    vertexShader: fighterRenderVert,
    fragmentShader: fighterRenderFrag
  });
  material.transparent = false;
  material.depthTest = false;

  const points = new THREE.Points(geometry, material);
  points.frustumCulled = false;
  points.renderOrder = 999;
  scene.add(points);

  const spriteMap = new THREE.TextureLoader().load("fighter.png", undefined, undefined, ev => console.error(ev));
  const spriteMaterial = new THREE.SpriteMaterial({ map: spriteMap });
  const sprite = new THREE.Sprite(spriteMaterial);
  scene.add(sprite);

  let prevDate = Date.now();

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

    // return console.debug(JSON.stringify(toInt16Pairs(fighterIndices.readPixels()), undefined, "  "));

    // fighterLocations.compute(fighterComputeShader, {
    //   u_width: fighterLocations.width,
    //   u_elapsed: elapsed,
    //   u_indices: fighterIndices,
    //   u_texCoordsBackbuffer: fighterIndices.getBackbuffer()
    //     ? (fighterIndices.getBackbuffer() as gpu.RenderTarget)
    //     : fighterIndices,
    //   u_locations: fighterLocations
    // });

    renderer.render(scene, camera);

    // console.error("done");
    requestAnimationFrame(animate);
  };
  requestAnimationFrame(animate);

  return <div />;
}

export default App;
