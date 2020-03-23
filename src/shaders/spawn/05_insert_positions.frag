#ifdef GL_ES
precision highp float;
precision highp int;
precision highp sampler2D;
#endif

uniform sampler2D u_fighterPositions;
uniform sampler2D u_fighterPositionsCPU;
uniform sampler2D u_singleTexelOffset;
uniform float u_cpuInvalidStartX;
uniform float u_cpuInvalidStartY;
uniform float u_cpuWidth;
uniform float u_width;

float round(float);
float floatEquals(float, float);
float floatNotEquals(float, float);
float floatLessThan(float, float);
float floatGreaterThan(float, float);
float floatLessThanOrEqual(float, float);
float floatGreaterThanOrEqual(float, float);
float vec2ToUint16(vec2);
vec2 int16ToVec2(float);
float vec2ToInt16(vec2);
vec2 uint16ToVec2(float);
void unpackBooleans(float, inout bool arr[8]);
float packBooleans(bool arr[8]);
bool getMSB(float);
float clearMSB(float);
float setMSB(float, bool);
struct texcoord { float x, y, w; };

// https://play.golang.org/p/71mX_f3CWaL

texcoord multiply(texcoord t, float f) {
    t.x *= f;
    t.y = t.y * f + t.x / t.w;
    t.x = mod(t.x, t.w);
    return t;
}

texcoord divide(texcoord t, float f) {
    t.x += mod(t.y, f) * t.w;
    t.x /= f;
    t.y /= f;
    return t;
}

texcoord add(texcoord t, float f) {
    t.y = t.y + floor(f / t.w) + floor((t.x + mod(f, t.w)) / t.w);
    t.x = mod(t.x + f, t.w);
    return t;
}

texcoord add(texcoord t1, texcoord t2) {
    t2 = divide(t2, max(1.0, t1.w / t2.w));
    t2 = multiply(t2, max(1.0, t2.w / t1.w));
    t1 = add(t1, t2.x);
    t1.y += t2.y;
    return t1;
}

texcoord subtract(texcoord t, float f) {
    t.y = t.y - floor(f / t.w) + floor((t.x - mod(f, t.w)) / t.w);
    t.x = mod(t.x - f, t.w);
    return t;
}

texcoord subtract(texcoord t1, texcoord t2) {
    t2 = divide(t2, max(1.0, t1.w / t2.w));
    t2 = multiply(t2, max(1.0, t2.w / t1.w));
    t1 = subtract(t1, t2.x);
    t1.y -= t2.y;
    return t1;
}

float texcoordLessThan(texcoord t1, texcoord t2) {
    float w = max(t1.w, t2.w);
    t1 = multiply(texcoord(t1.x, t1.y, w), w / t1.w);
    t2 = multiply(texcoord(t2.x, t2.y, w), w / t2.w);
    return floatEquals(t1.y, t2.y) * floatLessThan(t1.x, t2.x) + floatLessThan(t1.y, t2.y);
}

float texcoordLessThanOrEqual(texcoord t1, texcoord t2) {
    float w = max(t1.w, t2.w);
    t1 = multiply(texcoord(t1.x, t1.y, w), w / t1.w);
    t2 = multiply(texcoord(t2.x, t2.y, w), w / t2.w);
    return floatEquals(t1.y, t2.y) * floatLessThanOrEqual(t1.x, t2.x) + floatLessThan(t1.y, t2.y);
}

float texcoordGreaterThan(texcoord t1, texcoord t2) {
    float w = max(t1.w, t2.w);
    t1 = multiply(texcoord(t1.x, t1.y, w), w / t1.w);
    t2 = multiply(texcoord(t2.x, t2.y, w), w / t2.w);
    return floatEquals(t1.y, t2.y) * floatGreaterThan(t1.x, t2.x) + floatGreaterThan(t1.y, t2.y);
}

float texcoordGreaterThanOrEqual(texcoord t1, texcoord t2) {
    float w = max(t1.w, t2.w);
    t1 = multiply(texcoord(t1.x, t1.y, w), w / t1.w);
    t2 = multiply(texcoord(t2.x, t2.y, w), w / t2.w);
    return floatEquals(t1.y, t2.y) * floatGreaterThanOrEqual(t1.x, t2.x) + floatGreaterThan(t1.y, t2.y);
}

void main() {
    // create texcoord representing our position in output texture
    texcoord currentTexcoord = texcoord(floor(gl_FragCoord.x), floor(gl_FragCoord.y), u_width);

    // get current output texel
    vec4 passthroughTexel = texture2D(u_fighterPositions, vec2(currentTexcoord.x + 0.5, currentTexcoord.y + 0.5) / currentTexcoord.w);
    
    // get offset coordinates
    vec4 singleTexel = texture2D(u_singleTexelOffset, vec2(0.5, 0.5));
    singleTexel.r = clearMSB(singleTexel.r);
    texcoord startEmptyTexcoord = texcoord(vec2ToUint16(singleTexel.rg), vec2ToUint16(singleTexel.ba), u_width);

    // determine offset coordinates for CPU data
    texcoord cpuTexcoord = subtract(currentTexcoord, startEmptyTexcoord);

    // pull cpuTexel regardless if we're going to use it
    vec4 overwriteTexel = texture2D(u_fighterPositionsCPU, vec2(cpuTexcoord.x + 0.5, cpuTexcoord.y + 0.5) / cpuTexcoord.w);

    // calculate the out of bounds coordinates
    texcoord outOfBoundsTexcoord = add(startEmptyTexcoord, texcoord(u_cpuInvalidStartX, u_cpuInvalidStartY, u_cpuWidth));

    // create texel for an out of bounds value that is clamped in one of the four corners
    vec4 outOfBoundsTexel = floatEquals(mod(currentTexcoord.x, 4.0), 0.0) * vec4(uint16ToVec2(0.0), uint16ToVec2(0.0))
                          + floatEquals(mod(currentTexcoord.x, 4.0), 1.0) * vec4(uint16ToVec2(65535.0), uint16ToVec2(0.0))
                          + floatEquals(mod(currentTexcoord.x, 4.0), 2.0) * vec4(uint16ToVec2(0.0), uint16ToVec2(65535.0))
                          + floatEquals(mod(currentTexcoord.x, 4.0), 3.0) * vec4(uint16ToVec2(65535.0), uint16ToVec2(65535.0));

    // create pseudoconditionals based on output texel coordinates
    float passthroughBool = texcoordLessThan(currentTexcoord, startEmptyTexcoord);
    float overwriteBool   = texcoordGreaterThanOrEqual(currentTexcoord, startEmptyTexcoord)
                          * texcoordLessThan(currentTexcoord, outOfBoundsTexcoord);
    float outOfBoundsBool = texcoordGreaterThanOrEqual(currentTexcoord, outOfBoundsTexcoord);

    // output based on boolean
    gl_FragColor = passthroughTexel * passthroughBool
                 + overwriteTexel   * overwriteBool
                 + outOfBoundsTexel * outOfBoundsBool;
}