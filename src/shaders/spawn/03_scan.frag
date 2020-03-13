#ifdef GL_ES
precision highp float;
precision highp int;
precision highp sampler2D;
#endif

uniform sampler2D u_tex;
uniform float u_neighborX;
uniform float u_neighborY;
uniform float u_width;

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

void main() {
    // get current value of output texel
    vec4 currentTexel = texture2D(u_tex, gl_FragCoord.xy / u_width);
    bool currentBitFlag = getMSB(currentTexel.r);
	currentTexel.r = clearMSB(currentTexel.r);
    vec2 currentValue = vec2(vec2ToUint16(currentTexel.rg), vec2ToUint16(currentTexel.ba));

    // get neighbor value (possibly out of bounds)
    texcoord neighborCoord = texcoord(gl_FragCoord.x, gl_FragCoord.y, u_width);
    neighborCoord = subtractTexcoord(neighborCoord, u_neighborX);
    neighborCoord.y -= u_neighborY;
    vec4 neighborTexel = texture2D(u_tex, vec2(neighborCoord.x, neighborCoord.y) / u_width);
    vec2 neighborValue = vec2(vec2ToUint16(neighborTexel.rg), vec2ToUint16(neighborTexel.ba));

    // zeroize neighborValue if either x or y is out of bounds
    neighborValue *= floatGreaterThanOrEqual(floor(neighborCoord.x), 0.0) *
                     floatGreaterThanOrEqual(floor(neighborCoord.y), 0.0);

    // add values together
    currentValue.y += neighborValue.y + floor(currentValue.x + neighborValue.x / u_width);
    currentValue.x = mod(currentValue.x + neighborValue.x, u_width);

    // inject captured bit value into red channel
    vec2 redGreen = uint16ToVec2(currentValue.x);
    redGreen.r = setMSB(redGreen.r, currentBitFlag);

    // set new output value
	gl_FragColor = vec4(redGreen, uint16ToVec2(currentValue.y));
}