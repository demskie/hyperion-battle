#ifdef GL_ES
precision mediump float;
precision mediump int;
precision mediump sampler2D;
#endif

uniform sampler2D u_positions;
uniform sampler2D u_flags;
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
    // get the byte value that contains the bit flag in question
	vec4 flagsTexel = texture2D(u_flags, gl_FragCoord.xy / u_width);

    // pull bit flags from red channel
    bool redBoolArray[8];
    unpackBooleans(flagsTexel.r, redBoolArray);

    // give the first boolean a name
    bool isNotEmpty = redBoolArray[0];

    // push bit flag into most significant bit of red color channel (used later for scatter operation)
    float red = setMSB(0.0, isNotEmpty);

    // push bit flag into least significant bit of green color channel 
    float green = float(isNotEmpty) / 255.0;

    // we're done here
    gl_FragColor = vec4(red, green, 0.0, 0.0);
}
