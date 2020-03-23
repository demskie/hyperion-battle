import * as THREE from "three";

export function notSupportedInOrthographicCamera(camera: THREE.Camera, message: string): boolean {
  if (!(camera as THREE.PerspectiveCamera).isPerspectiveCamera) {
    console.warn(`${message} is not supported in OrthographicCamera`);
    return true;
  }
  return false;
}
