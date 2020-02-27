precision highp float;
precision highp int;
precision highp sampler2D;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

attribute vec3 position;
attribute vec3 color;
attribute float size;
attribute float rotation;

varying vec3 v_color;
varying float v_rotation;

void main() {
	v_color = color;
	v_rotation = rotation;
	vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);          
	gl_PointSize = size * (10000.0 / length(modelViewPosition.xyz));
	gl_Position = projectionMatrix * modelViewPosition;
}