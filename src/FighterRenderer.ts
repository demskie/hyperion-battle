import * as THREE from "three";

export class FighterRenderer {
	private geometry = new THREE.InstancedBufferGeometry().copy(new THREE.BoxBufferGeometry(100, 100, 100));
	private material = new THREE.ShaderMaterial({
		uniforms: {},
		wireframe: true,
		vertexShader: `void main() {
      vec3 newPosition = position;				
      gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 ); 
    }`,
		fragmentShader: `void main() {							
      gl_FragColor.rgb = vec3(1.0); 				
      gl_FragColor.a = 1.0;	
    }`
	});
	private mesh = new THREE.Mesh(this.geometry, this.material);

	constructor(scene: THREE.Scene) {
		scene.add(this.mesh);
	}
}
