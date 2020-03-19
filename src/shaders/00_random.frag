// Author @patriciogv - 2015
// http://patriciogonzalezvivo.com

#ifdef GL_ES
precision highp float;
#endif

uniform vec2 u_resolution;
uniform float u_time;

// https://thebookofshaders.com/10/

const vec3 color = vec3(72.429, 78.233, 0.200);

float notRandom(float x, float y, float time) {
    return fract(
        mod(
            sin(dot(vec3(x, y, time), color)) * 123456.0,
            65536.0
        )
    );
}

void main() {
    vec2 st = gl_FragCoord.xy/u_resolution.xy;

    float r = notRandom(st.x, st.y, mod(u_time + 123.0, 65536.0));
    float g = notRandom(st.x, st.y, mod(u_time + 213.0, 65536.0));
    float b = notRandom(st.x, st.y, mod(u_time + 321.0, 65536.0));

    gl_FragColor = vec4(vec3(r,g,b), 1.0);
}
