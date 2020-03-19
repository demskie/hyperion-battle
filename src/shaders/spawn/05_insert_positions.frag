#ifdef GL_ES
precision highp float;
precision highp int;
precision highp sampler2D;
#endif

uniform sampler2D u_fighterPositions;
uniform sampler2D u_fighterPositionsCPU;
uniform sampler2D u_singleTexelOffset;
uniform float u_width;
uniform float u_cpuWidth;

float round(float);
float floatEquals(float, float);
float floatNotEquals(float, float);
float floatLessThan(float, float);
float floatGreaterThan(float, float);
float floatLessThanOrEqual(float, float);
float floatGreaterThanOrEqual(float, float);
float vec2ToUint16(vec2);
vec2 uint16ToVec2(float);
void unpackBooleans(float, inout bool arr[8]);
float packBooleans(bool arr[8]);
bool getMSB(float);
float clearMSB(float);
float setMSB(float, bool);
struct texcoord { float x, y, w; };
texcoord subtractTexcoord(texcoord, float);

texcoord subtractTexcoord(texcoord a, texcoord b) {

    // (3,5) w=8 minus (1,2) w=4
    a.x -= b.x; // (2,5)
    a.y -= floatLessThan(a.x, 0.0); // (2,5)
    a.y -= floatLessThan(a.x, 0.0) * floor(abs(a.x) / a.w); // (2,5)
    a.y -= b.y * (b.w / a.w); // (2,4)
    a.x = mod(a.x, a.w); // (2,4)

    // (2,3) w=4 minus (3,1) w=8
    a.x -= b.x; // (-1,3)
    a.y -= floatLessThan(a.x, 0.0); // (-1, 2)
    a.y -= floatLessThan(a.x, 0.0) * floor(abs(a.x) / a.w); // (-1, 2) // 1.0 * floor(abs(-1) / 8)
    a.y -= b.y * (b.w / a.w); // (-1, 0)
    a.x = mod(a.x, a.w); // (3, 0)

    return a;
}

// BUG: fighter positions need to be clamped to a corner if they are empty positions

void main() {
    // get previous output texel
    vec4 previousOutputTexel = texture2D(u_fighterPositions, gl_FragCoord.xy / u_width);
    
    // get offset coordinates
    vec4 cpuOffsetTexel = texture2D(u_singleTexelOffset, vec2(0.5, 0.5));
    cpuOffsetTexel.r = clearMSB(cpuOffsetTexel.r);
    vec2 cpuOffsetCoord = vec2(vec2ToUint16(cpuOffsetTexel.rg), vec2ToUint16(cpuOffsetTexel.ba));

    // determine offset coordinates for CPU data
    texcoord cpuTexcoord = texcoord(floor(gl_FragCoord.x), floor(gl_FragCoord.y), u_width);
    cpuTexcoord = subtractTexcoord(cpuTexcoord, cpuOffsetCoord.x);
    cpuTexcoord.y -= cpuOffsetCoord.y ;

    // get cpu offsetted cpu texel
    vec4 cpuTexel = texture2D(u_fighterPositionsCPU, vec2(cpuTexcoord.x + 0.5, cpuTexcoord.y + 0.5) / u_width);


}