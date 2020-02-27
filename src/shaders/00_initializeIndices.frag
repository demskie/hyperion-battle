precision highp float;
precision highp int;

vec2 int16ToVec2(float);

void main() {
    gl_FragColor = vec4(
        int16ToVec2(floor(gl_FragCoord.x)), 
        int16ToVec2(floor(gl_FragCoord.y))
    );
}