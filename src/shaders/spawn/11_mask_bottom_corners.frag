#ifdef GL_ES
precision highp float;
precision highp int;
precision highp sampler2D;
#endif

uniform sampler2D u_fighterPositions;
uniform sampler2D u_fighterFlags;
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

void main() {
    // get the texel that contains the positional data
	vec4 positionsTexel = texture2D(u_fighterPositions, gl_FragCoord.xy / u_width);

    // calculate position using texel
    vec2 position = vec2(vec2ToUint16(positionsTexel.rg), vec2ToUint16(positionsTexel.ba));

    // determine if this is in either of the right corners
    float bottomCornersBool = floatEquals(position.x, 0.0)     * floatEquals(position.y, 65535.0)
                            + floatEquals(position.x, 65535.0) * floatEquals(position.y, 65535.0);

    // need to flip the bit for proper sorting
    bottomCornersBool = 1.0 - bottomCornersBool;

    // get the byte value that contains the bit flag in question
	vec4 flagsTexel = texture2D(u_fighterFlags, gl_FragCoord.xy / u_width);

    // pull emptyness bit from red channel
    bool boolArray[8];
    unpackBooleans(flagsTexel.r, boolArray);
    float emptyBool = float(boolArray[0]);

    // push bit flag into most significant bit of red color channel (used later for scatter operation)
    float red = setMSB(0.0, bool(bottomCornersBool * emptyBool));

    // push bit flag into least significant bit of green color channel 
    float green = bottomCornersBool * emptyBool / 255.0;

    // we're done here
    gl_FragColor = vec4(red, green, 0.0, 0.0);
}
