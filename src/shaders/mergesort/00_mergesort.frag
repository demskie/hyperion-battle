#ifdef GL_ES
precision highp float;
precision highp int;
precision highp sampler2D;
#endif

uniform sampler2D u_tex;
uniform float u_px;
uniform float u_py;
uniform float u_rx;
uniform float u_ry;
uniform float u_dx;
uniform float u_dy;
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

// https://gist.github.com/EliCDavis/f35a9e4afb8e1c9ae94cce8f3c2c9b9a

int AND(int n1, int n2){
    
    float v1 = float(n1);
    float v2 = float(n2);
    
    int byteVal = 1;
    int result = 0;
    
    for(int i = 0; i < 32; i++){
        bool keepGoing = v1>0.0 || v2 > 0.0;
        if(keepGoing){
            
            bool addOn = mod(v1, 2.0) > 0.0 && mod(v2, 2.0) > 0.0;
            
            if(addOn){
                result += byteVal;
            }
            
            v1 = floor(v1 / 2.0);
            v2 = floor(v2 / 2.0);
            byteVal *= 2;
        } else {
            return result;
        }
    }
    return result;
}

int OR(int n1, int n2){

    float v1 = float(n1);
    float v2 = float(n2);
    
    int byteVal = 1;
    int result = 0;
    
    for(int i = 0; i < 32; i++){
        bool keepGoing = v1>0.0 || v2 > 0.0;
        if(keepGoing){
            
            bool addOn = mod(v1, 2.0) > 0.0 || mod(v2, 2.0) > 0.0;
            
            if(addOn){
                result += byteVal;
            }
            
            v1 = floor(v1 / 2.0);
            v2 = floor(v2 / 2.0);
            
            byteVal *= 2;
        } else {
            return result;
        }
    }
    return result;	
}

int RShift(int num, float shifts){
    return int(floor(float(num) / pow(2.0, shifts)));
}


float bitwiseAnd65536(float a, float b) {
    return float(AND(int(a), int(b)));
    float o = 0.0;
    o += 32768.0 * floatGreaterThanOrEqual(a, 32768.0) * floatGreaterThanOrEqual(b, 32768.0);
    a -= 32768.0 * floatGreaterThanOrEqual(a, 32768.0);
    b -= 32768.0 * floatGreaterThanOrEqual(b, 32768.0);
    o += 16384.0 * floatGreaterThanOrEqual(a, 16384.0) * floatGreaterThanOrEqual(b, 16384.0);
    a -= 16384.0 * floatGreaterThanOrEqual(a, 16384.0);
    b -= 16384.0 * floatGreaterThanOrEqual(b, 16384.0);
    o += 8192.0 * floatGreaterThanOrEqual(a, 8192.0) * floatGreaterThanOrEqual(b, 8192.0);
    a -= 8192.0 * floatGreaterThanOrEqual(a, 8192.0);
    b -= 8192.0 * floatGreaterThanOrEqual(b, 8192.0);
    o += 4096.0 * floatGreaterThanOrEqual(a, 4096.0) * floatGreaterThanOrEqual(b, 4096.0);
    a -= 4096.0 * floatGreaterThanOrEqual(a, 4096.0);
    b -= 4096.0 * floatGreaterThanOrEqual(b, 4096.0);
    o += 2048.0 * floatGreaterThanOrEqual(a, 2048.0) * floatGreaterThanOrEqual(b, 2048.0);
    a -= 2048.0 * floatGreaterThanOrEqual(a, 2048.0);
    b -= 2048.0 * floatGreaterThanOrEqual(b, 2048.0);
    o += 1024.0 * floatGreaterThanOrEqual(a, 1024.0) * floatGreaterThanOrEqual(b, 1024.0);
    a -= 1024.0 * floatGreaterThanOrEqual(a, 1024.0);
    b -= 1024.0 * floatGreaterThanOrEqual(b, 1024.0);
    o += 512.0 * floatGreaterThanOrEqual(a, 512.0) * floatGreaterThanOrEqual(b, 512.0);
    a -= 512.0 * floatGreaterThanOrEqual(a, 512.0);
    b -= 512.0 * floatGreaterThanOrEqual(b, 512.0);
    o += 256.0 * floatGreaterThanOrEqual(a, 256.0) * floatGreaterThanOrEqual(b, 256.0);
    a -= 256.0 * floatGreaterThanOrEqual(a, 256.0);
    b -= 256.0 * floatGreaterThanOrEqual(b, 256.0);
    o += 128.0 * floatGreaterThanOrEqual(a, 128.0) * floatGreaterThanOrEqual(b, 128.0);
    a -= 128.0 * floatGreaterThanOrEqual(a, 128.0);
    b -= 128.0 * floatGreaterThanOrEqual(b, 128.0);
    o += 64.0 * floatGreaterThanOrEqual(a, 64.0) * floatGreaterThanOrEqual(b, 64.0);
    a -= 64.0 * floatGreaterThanOrEqual(a, 64.0);
    b -= 64.0 * floatGreaterThanOrEqual(b, 64.0);
    o += 32.0 * floatGreaterThanOrEqual(a, 32.0) * floatGreaterThanOrEqual(b, 32.0);
    a -= 32.0 * floatGreaterThanOrEqual(a, 32.0);
    b -= 32.0 * floatGreaterThanOrEqual(b, 32.0);
    o += 16.0 * floatGreaterThanOrEqual(a, 16.0) * floatGreaterThanOrEqual(b, 16.0);
    a -= 16.0 * floatGreaterThanOrEqual(a, 16.0);
    b -= 16.0 * floatGreaterThanOrEqual(b, 16.0);
    o += 8.0 * floatGreaterThanOrEqual(a, 8.0) * floatGreaterThanOrEqual(b, 8.0);
    a -= 8.0 * floatGreaterThanOrEqual(a, 8.0);
    b -= 8.0 * floatGreaterThanOrEqual(b, 8.0);
    o += 4.0 * floatGreaterThanOrEqual(a, 4.0) * floatGreaterThanOrEqual(b, 4.0);
    a -= 4.0 * floatGreaterThanOrEqual(a, 4.0);
    b -= 4.0 * floatGreaterThanOrEqual(b, 4.0);
    o += 2.0 * floatGreaterThanOrEqual(a, 2.0) * floatGreaterThanOrEqual(b, 2.0);
    a -= 2.0 * floatGreaterThanOrEqual(a, 2.0);
    b -= 2.0 * floatGreaterThanOrEqual(b, 2.0);
    o += 1.0 * floatGreaterThanOrEqual(a, 1.0) * floatGreaterThanOrEqual(b, 1.0);
    return o;
}

float bitwiseAnd256(float a, float b) {
    float o = 0.0;
    o += 128.0 * floatGreaterThanOrEqual(a, 128.0) * floatGreaterThanOrEqual(b, 128.0);
    a -= 128.0 * floatGreaterThanOrEqual(a, 128.0);
    b -= 128.0 * floatGreaterThanOrEqual(b, 128.0);
    o += 64.0 * floatGreaterThanOrEqual(a, 64.0) * floatGreaterThanOrEqual(b, 64.0);
    a -= 64.0 * floatGreaterThanOrEqual(a, 64.0);
    b -= 64.0 * floatGreaterThanOrEqual(b, 64.0);
    o += 32.0 * floatGreaterThanOrEqual(a, 32.0) * floatGreaterThanOrEqual(b, 32.0);
    a -= 32.0 * floatGreaterThanOrEqual(a, 32.0);
    b -= 32.0 * floatGreaterThanOrEqual(b, 32.0);
    o += 16.0 * floatGreaterThanOrEqual(a, 16.0) * floatGreaterThanOrEqual(b, 16.0);
    a -= 16.0 * floatGreaterThanOrEqual(a, 16.0);
    b -= 16.0 * floatGreaterThanOrEqual(b, 16.0);
    o += 8.0 * floatGreaterThanOrEqual(a, 8.0) * floatGreaterThanOrEqual(b, 8.0);
    a -= 8.0 * floatGreaterThanOrEqual(a, 8.0);
    b -= 8.0 * floatGreaterThanOrEqual(b, 8.0);
    o += 4.0 * floatGreaterThanOrEqual(a, 4.0) * floatGreaterThanOrEqual(b, 4.0);
    a -= 4.0 * floatGreaterThanOrEqual(a, 4.0);
    b -= 4.0 * floatGreaterThanOrEqual(b, 4.0);
    o += 2.0 * floatGreaterThanOrEqual(a, 2.0) * floatGreaterThanOrEqual(b, 2.0);
    a -= 2.0 * floatGreaterThanOrEqual(a, 2.0);
    b -= 2.0 * floatGreaterThanOrEqual(b, 2.0);
    o += 1.0 * floatGreaterThanOrEqual(a, 1.0) * floatGreaterThanOrEqual(b, 1.0);
    return o;
}

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

vec2 toVec2(texcoord t) {
    return vec2(t.x, t.y);
}


void main() {
    texcoord currentTexcoord = texcoord(floor(gl_FragCoord.x), floor(gl_FragCoord.y), u_width);
    texcoord prevTexcoord = subtract(currentTexcoord, texcoord(u_dx, u_dy, u_width));
    texcoord nextTexcoord = add(currentTexcoord, texcoord(u_dx, u_dy, u_width));

    float isFirstPixelBool = floatEquals(bitwiseAnd65536(currentTexcoord.x, u_px), u_rx) 
                           * floatEquals(bitwiseAnd65536(currentTexcoord.y, u_py), u_ry);

    float isSecondPixelBool = floatEquals(isFirstPixelBool, 0.0)
                            * floatGreaterThanOrEqual(prevTexcoord.x, 0.0)
                            * floatGreaterThanOrEqual(prevTexcoord.y, 0.0)
                            * floatEquals(bitwiseAnd65536(prevTexcoord.x, u_px), u_rx) 
                            * floatEquals(bitwiseAnd65536(prevTexcoord.y, u_py), u_ry);
    
    // isFirstPixelBool += floatEquals(isFirstPixelBool, 0.0) * floatEquals(isSecondPixelBool, 0.0);

    // vec2 firstFragCoord  = isFirstPixelBool  * (toVec2(currentTexcoord) + vec2(0.5, 0.5))
    //                      + isSecondPixelBool * (toVec2(prevTexcoord)    + vec2(0.5, 0.5));
    // vec2 secondFragCoord = isFirstPixelBool  * (toVec2(nextTexcoord)    + vec2(0.5, 0.5))
    //                      + isSecondPixelBool * (toVec2(currentTexcoord) + vec2(0.5, 0.5));

    // vec4 firstTexel = texture2D(u_tex, firstFragCoord / u_width);
    // vec4 secondTexel = texture2D(u_tex, secondFragCoord / u_width);

    // float swapBool = 0.0;
    // float notSwapBool = 0.0;
    // swapBool    += floatEquals(swapBool, 0.0) * floatEquals(notSwapBool, 0.0) * floatGreaterThan(firstTexel.r, secondTexel.r);
	// notSwapBool += floatEquals(swapBool, 0.0) * floatEquals(notSwapBool, 0.0) * floatLessThan(firstTexel.r, secondTexel.r);
	// swapBool    += floatEquals(swapBool, 0.0) * floatEquals(notSwapBool, 0.0) * floatGreaterThan(firstTexel.g, secondTexel.g);
	// notSwapBool += floatEquals(swapBool, 0.0) * floatEquals(notSwapBool, 0.0) * floatLessThan(firstTexel.g, secondTexel.g);
	// swapBool    += floatEquals(swapBool, 0.0) * floatEquals(notSwapBool, 0.0) * floatGreaterThan(firstTexel.b, secondTexel.b);
	// notSwapBool += floatEquals(swapBool, 0.0) * floatEquals(notSwapBool, 0.0) * floatLessThan(firstTexel.b, secondTexel.b);
	// swapBool    += floatEquals(swapBool, 0.0) * floatEquals(notSwapBool, 0.0) * floatGreaterThan(firstTexel.a, secondTexel.a);
	// notSwapBool += floatEquals(swapBool, 0.0) * floatEquals(notSwapBool, 0.0) * floatLessThan(firstTexel.a, secondTexel.a);
    // notSwapBool += floatEquals(notSwapBool, 0.0) * floatEquals(swapBool, 0.0);
    
    // gl_FragColor = isFirstPixelBool  * notSwapBool * firstTexel
    //              + isFirstPixelBool  * swapBool    * secondTexel
    //              + isSecondPixelBool * notSwapBool * secondTexel
    //              + isSecondPixelBool * swapBool    * firstTexel
    //              + floatEquals(isFirstPixelBool, 0.0) * floatEquals(isSecondPixelBool, 0.0) * firstTexel;

    // gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0)
    //              + vec4(0.0, 0.0, 0.0, 1.0 / 255.0) * isFirstPixelBool
    //              + vec4(0.0, 0.0, 0.0, 2.0 / 255.0) * isSecondPixelBool;
    vec2 v = toVec2(add(currentTexcoord, texcoord(u_dx, u_dy, u_width))) / u_width;

    gl_FragColor = // floatEquals(bitwiseAnd65536(currentTexcoord.x, u_px), u_rx) 
                 // * floatEquals(bitwiseAnd65536(currentTexcoord.y, u_py), u_ry)
                  vec4(uint16ToVec2(v.x), uint16ToVec2(v.y));
}
