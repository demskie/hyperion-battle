#ifdef GL_ES
precision mediump float;
precision mediump int;
precision mediump sampler2D;
#endif

uniform sampler2D u_tex;
uniform float u_bitIndex;
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
	vec4 texel = texture2D(u_tex, gl_FragCoord.xy / u_width);

    // initialize some values
    float bit = 0.0;
    bool boolArray[8];

    // interate through all bits in red channel
    unpackBooleans(texel.r, boolArray);
    bit += floatEquals(0.0, u_bitIndex) * float(boolArray[0]);
    bit += floatEquals(1.0, u_bitIndex) * float(boolArray[1]);
    bit += floatEquals(2.0, u_bitIndex) * float(boolArray[2]);
    bit += floatEquals(3.0, u_bitIndex) * float(boolArray[3]);
    bit += floatEquals(4.0, u_bitIndex) * float(boolArray[4]);
    bit += floatEquals(5.0, u_bitIndex) * float(boolArray[5]);
    bit += floatEquals(6.0, u_bitIndex) * float(boolArray[6]);
    bit += floatEquals(7.0, u_bitIndex) * float(boolArray[7]);

    // interate through all bits in green channel
    unpackBooleans(texel.g, boolArray);
    bit += floatEquals(8.0, u_bitIndex) * float(boolArray[0]);
    bit += floatEquals(9.0, u_bitIndex) * float(boolArray[1]);
    bit += floatEquals(10.0, u_bitIndex) * float(boolArray[2]);
    bit += floatEquals(11.0, u_bitIndex) * float(boolArray[3]);
    bit += floatEquals(12.0, u_bitIndex) * float(boolArray[4]);
    bit += floatEquals(13.0, u_bitIndex) * float(boolArray[5]);
    bit += floatEquals(14.0, u_bitIndex) * float(boolArray[6]);
    bit += floatEquals(15.0, u_bitIndex) * float(boolArray[7]);
    
    // interate through all bits in blue channel
    unpackBooleans(texel.b, boolArray);
    bit += floatEquals(16.0, u_bitIndex) * float(boolArray[0]);
    bit += floatEquals(17.0, u_bitIndex) * float(boolArray[1]);
    bit += floatEquals(18.0, u_bitIndex) * float(boolArray[2]);
    bit += floatEquals(19.0, u_bitIndex) * float(boolArray[3]);
    bit += floatEquals(20.0, u_bitIndex) * float(boolArray[4]);
    bit += floatEquals(21.0, u_bitIndex) * float(boolArray[5]);
    bit += floatEquals(22.0, u_bitIndex) * float(boolArray[6]);
    bit += floatEquals(23.0, u_bitIndex) * float(boolArray[7]);
    
    // interate through all bits in blue channel
    unpackBooleans(texel.a, boolArray);
    bit += floatEquals(24.0, u_bitIndex) * float(boolArray[0]);
    bit += floatEquals(25.0, u_bitIndex) * float(boolArray[1]);
    bit += floatEquals(26.0, u_bitIndex) * float(boolArray[2]);
    bit += floatEquals(27.0, u_bitIndex) * float(boolArray[3]);
    bit += floatEquals(28.0, u_bitIndex) * float(boolArray[4]);
    bit += floatEquals(29.0, u_bitIndex) * float(boolArray[5]);
    bit += floatEquals(30.0, u_bitIndex) * float(boolArray[6]);
    bit += floatEquals(31.0, u_bitIndex) * float(boolArray[7]);

    // push bit flag into most significant bit of red color channel (used later for scatter operation)
    float red = setMSB(0.0, bool(bit));

    // push bit flag into least significant bit of green color channel 
    float green = bit / 255.0;

    // we're done here
    gl_FragColor = vec4(red, green, 0.0, 0.0);
}
