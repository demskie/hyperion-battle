precision highp float;
precision highp int;
precision highp sampler2D;

uniform sampler2D u_texture;

varying vec3 v_color;
varying float v_rotation; 

void main() {		
	vec2 center = vec2(0.5, 0.5);
	vec2 centeredPoint = gl_PointCoord - center;
	if (v_rotation != 0.0) {
		mat2 rotation = mat2(cos(v_rotation), sin(v_rotation), -sin(v_rotation), cos(v_rotation));
		centeredPoint = rotation * centeredPoint;
	}
	vec4 tex = texture2D(u_texture, centeredPoint + center);
	gl_FragColor = vec4(v_color.rgb * tex.a, tex.a);
	if (gl_FragColor.a < 0.5) {
		discard;
	}
}