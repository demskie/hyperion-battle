#ifdef GL_ES
precision highp float;
precision highp int;
precision highp sampler2D;
#endif

uniform sampler2D u_genericData;
uniform sampler2D u_genericDataCPU;
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
vec2 uint16ToVec2(float);
void unpackBooleans(float, inout bool arr[8]);
float packBooleans(bool arr[8]);
bool getMSB(float);
float clearMSB(float);
float setMSB(float, bool);
struct texcoord { float x, y, w; };
texcoord addTexcoord(texcoord, float);
texcoord subtractTexcoord(texcoord, float);
texcoord resizeTexcoord(texcoord, float);
void equalizeTexcoordWidths(inout texcoord, inout texcoord);
texcoord addTexcoord(texcoord, texcoord);
texcoord subtractTexcoord(texcoord, texcoord);
float texcoordLessThan(texcoord, texcoord);
float texcoordLessThanOrEqual(texcoord, texcoord);
float texcoordGreaterThan(texcoord, texcoord);
float texcoordGreaterThanOrEqual(texcoord, texcoord);

void main() {
    // create texcoord representing our position in output texture
    texcoord currentTexcoord = texcoord(floor(gl_FragCoord.x), floor(gl_FragCoord.y), u_width);

    // get current output texel
    vec4 passthroughTexel = texture2D(u_genericData, vec2(currentTexcoord.x + 0.5, currentTexcoord.y + 0.5) / currentTexcoord.w);
    
    // get offset coordinates
    vec4 singleTexel = texture2D(u_singleTexelOffset, vec2(0.5, 0.5));
    singleTexel.r = clearMSB(singleTexel.r);
    texcoord startEmptyTexcoord = texcoord(vec2ToUint16(singleTexel.rg), vec2ToUint16(singleTexel.ba), u_cpuWidth);

    // determine offset coordinates for CPU data
    texcoord cpuTexcoord = subtractTexcoord(startEmptyTexcoord, currentTexcoord);

    // pull cpuTexel regardless if we're going to use it
    vec4 overwriteTexel = texture2D(u_genericDataCPU, vec2(cpuTexcoord.x + 0.5, cpuTexcoord.y + 0.5) / cpuTexcoord.w);

    // calculate the out of bounds coordinates
    texcoord outOfBoundsTexcoord = addTexcoord(startEmptyTexcoord, texcoord(u_cpuInvalidStartX, u_cpuInvalidStartY, u_cpuWidth));

    // create pseudoconditionals based on output texel coordinates
    float passthroughBool = texcoordLessThan(currentTexcoord, startEmptyTexcoord);
    float overwriteBool   = texcoordGreaterThanOrEqual(currentTexcoord, startEmptyTexcoord)
                          * texcoordLessThan(currentTexcoord, outOfBoundsTexcoord);

    // output based on boolean
    gl_FragColor = passthroughTexel * passthroughBool
                 + overwriteTexel   * overwriteBool;
}