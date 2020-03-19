#ifdef GL_ES
precision highp float;
precision highp int;
precision highp sampler2D;
#endif

uniform sampler2D u_tex;
uniform float u_xCoord;
uniform float u_yCoord;
uniform float u_width;

void main() {
    gl_FragColor = texture2D(u_tex, vec2(u_xCoord + 0.5, u_yCoord + 0.5) / u_width);
}