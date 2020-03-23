import React from "react";
import "./App.css";
import * as gpu from "gpu-compute";
import * as THREE from "three";
import * as common from "./common";
import { CameraControls } from "./CameraControls/CameraControls";
import { default as Stats } from "stats.js";

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
import { Vector3 } from "three";

export const toInt16Pairs = (bytes: Uint8Array) => {
  const output = [] as number[][];
  for (let i = 0; i < bytes.length && i < 4 * 4; i += 4)
    output.push([gpu.unpackInt16(bytes[i + 0], bytes[i + 1]), gpu.unpackInt16(bytes[i + 2], bytes[i + 3])]);
  return output;
};

function App() {
  const clock = new THREE.Clock();
  const scene = new THREE.Scene();
  // scene.background = new THREE.Color("lightblue");

  const camera = new THREE.PerspectiveCamera(0.01, window.innerWidth / window.innerHeight, 1e-6, 1e27);
  camera.position.z = 10000000;

  const renderer = new THREE.WebGLRenderer({ antialias: true, logarithmicDepthBuffer: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const controls = new CameraControls(camera, renderer.domElement);
  controls.dollyToCursor = true;
  controls.dampingFactor = 0.0;
  controls.draggingDampingFactor = 1.0;
  controls.minDistance = 10000;
  controls.mouseButtons.left = CameraControls.ACTION.TRUCK;
  controls.mouseButtons.middle = CameraControls.ACTION.DOLLY;
  controls.mouseButtons.right = CameraControls.ACTION.NONE;
  controls.mouseButtons.wheel = CameraControls.ACTION.DOLLY;
  controls.touches.one = CameraControls.ACTION.TOUCH_TRUCK;
  controls.touches.two = CameraControls.ACTION.TOUCH_DOLLY_TRUCK;
  controls.touches.three = CameraControls.ACTION.TOUCH_DOLLY_TRUCK;

  const initializeIndicesShader = new gpu.ComputeShader(
    initializeIndicesFrag,
    common.searchAndReplace,
    gpu.passThruVert
  );
  const initializeLocationsShader = new gpu.ComputeShader(
    initializeLocationsFrag,
    common.searchAndReplace,
    gpu.passThruVert
  );
  const sortSidewaysEvenOddShader = new gpu.ComputeShader(
    sortSidewaysEvenOddFrag,
    common.searchAndReplace,
    gpu.passThruVert
  );
  const sortSidewaysOddEvenShader = new gpu.ComputeShader(
    sortSidewaysOddEvenFrag,
    common.searchAndReplace,
    gpu.passThruVert
  );
  const sortUpwardsEvenOddShader = new gpu.ComputeShader(
    sortUpwardsEvenOddFrag,
    common.searchAndReplace,
    gpu.passThruVert
  );
  const sortUpwardsOddEvenShader = new gpu.ComputeShader(
    sortUpwardsOddEvenFrag,
    common.searchAndReplace,
    gpu.passThruVert
  );
  const fighterComputeShader = new gpu.ComputeShader(fighterComputeFrag, common.searchAndReplace, gpu.passThruVert);

  const width = 256;

  const fighterIndices = new gpu.RenderTarget(width);
  const fighterLocations = new gpu.RenderTarget(width);

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(new Float32Array([1, 0, 0]), 3));

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
  const sprite1 = new THREE.Sprite(spriteMaterial);
  const sprite2 = new THREE.Sprite(spriteMaterial);
  sprite1.scale.set(100, 100, 100);
  scene.add(sprite1);
  sprite2.scale.set(100, 100, 100);
  scene.add(sprite2);

  const lineGeometry = new THREE.BufferGeometry().setFromPoints([
    new Vector3(-65536 / 2, -65536 / 2, 0),
    new Vector3(65536 / 2, -65536 / 2, 0),
    new Vector3(65536 / 2, 65536 / 2, 0),
    new Vector3(-65536 / 2, 65536 / 2, 0),
    new Vector3(-65536 / 2, -65536 / 2, 0)
  ]);
  const lineMat = new THREE.LineBasicMaterial({ color: "green" });
  const line = new THREE.Line(lineGeometry, lineMat);
  scene.add(line);

  fighterIndices.compute(initializeIndicesShader);
  fighterLocations.compute(initializeLocationsShader, { u_width: fighterLocations.width });

  // console.debug(JSON.stringify(toInt16Pairs(fighterIndices.readPixels()), undefined, "  "));
  // console.debug(JSON.stringify(toInt16Pairs(fighterLocations.readPixels()), undefined, "  "));

  const stats = new Stats();
  stats.showPanel(0);
  document.body.appendChild(stats.dom);

  const animate = function() {
    const elapsed = clock.getDelta();
    stats.begin();
    stats.end();

    sprite1.position.setX((sprite1.position.x + 1) % 65536);
    sprite2.position.setX((sprite2.position.x - 1) % 65536);
    //console.log(sprite.position.x);

    const hasControlsUpdated = controls.update(elapsed);

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
