#ifdef GL_ES
precision highp float;
precision highp int;
precision highp sampler2D;
#endif

vec2 uint16ToVec2(float);

void main() {
    gl_FragColor = vec4(
        uint16ToVec2(floor(gl_FragCoord.x)), 
        uint16ToVec2(floor(gl_FragCoord.y))
    );
}