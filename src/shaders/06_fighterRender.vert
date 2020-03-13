precision highp float;
precision highp int;
precision highp sampler2D;

uniform mat4 modelMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat3 normalMatrix;
uniform vec3 cameraPosition;
uniform bool isOrthographic;

attribute mat4 instanceMatrix;
attribute vec3 position;
attribute vec3 normal;
attribute vec2 uv;
attribute vec3 color;

// attribute vec3 position;
// attribute vec3 color;
// attribute float size;
// attribute float rotation;

varying vec3 v_color;
varying float v_rotation;

const float TEXTURE_SCALAR = 650.0 * 10000.0;
const float pi = 3.1415926535897932384626433832795;

void main() {
    vec3 position = vec3(0.5, 0.0, 0.0);
    float size = 1.0;
    v_color = vec3(1.0, 0.0, 0.0);
    v_rotation = (180.0 - 0.0) * (pi / 180.0);

	vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);          
	gl_PointSize = size * (TEXTURE_SCALAR / length(modelViewPosition.xyz));
	gl_Position = projectionMatrix * modelViewPosition;
}