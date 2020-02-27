precision highp float;
precision highp int;

uniform float u_width;

vec2 int16ToVec2(float);

void main() {
    gl_FragColor = vec4(
        int16ToVec2(floor(gl_FragCoord.x) * (65536.0 / u_width) - 65536.0 / 2.0),
        int16ToVec2(floor(gl_FragCoord.y) * (65536.0 / u_width) - 65536.0 / 2.0)
    );
}