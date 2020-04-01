#ifdef GL_ES
precision highp float;
precision highp int;
precision highp sampler2D;
#endif

// uniform vec3      Param1;
// uniform vec3      Param2;
uniform sampler2D Data;
uniform float TwoStage;
uniform float Pass_mod_Stage;
uniform float TwoStage_PmS_1;
uniform float Width;
uniform float Height;
uniform float Pass;

// #define OwnPos         gl_TexCoord[0]

// contents of the uniform data fields
// #define TwoStage       Param1.x
// #define Pass_mod_Stage Param1.y
// #define TwoStage_PmS_1 Param1.z
// #define Width          Param2.x
// #define Height         Param2.y
// #define Pass           Param2.z

float round(float);
float floatEquals(float, float);
float floatNotEquals(float, float);
float floatLessThan(float, float);
float floatGreaterThan(float, float);
float floatLessThanOrEqual(float, float);
float floatGreaterThanOrEqual(float, float);

void bignumInit(inout float [16]);
void bignumFrom(inout float [16], float);
void bignumFrom(inout float [16], float [2]);
void bignumFrom(inout float [16], float [4]);
void bignumFrom(inout float [16], float [8]);
void bignumFrom(inout float [16], float [16]);
void bignumAssign(inout float [16], inout float [16]);
void bignumAdd(inout float [16], inout float [16], inout float [16]);
void bignumSub(inout float [16], inout float [16], inout float [16]);
void bignumMul(inout float [16], inout float [16], inout float [16]);
void bignumPow(inout float [16], inout float [16], inout float [16]);
void bignumDiv(inout float [16], inout float [16], inout float [16]);
void bignumMod(inout float [16], inout float [16], inout float [16]);
void bignumDivmod(inout float [16], inout float [16], inout float [16], inout float [16]);
void bignumIsqrt(inout float [16], inout float [16]);
void bignumLshift(inout float [16], inout float [16], float);
void bignumRshift(inout float [16], inout float [16], float);
void bignumAnd(inout float [16], inout float [16], inout float [16]);
void bignumOr(inout float [16], inout float [16], inout float [16]);
void bignumXor(inout float [16], inout float [16], inout float [16]);
void bignumDec(inout float [16]);
void bignumInc(inout float [16]);
float bignumIsZero(inout float [16]);
float bignumCmp(inout float [16], inout float [16]);

float lshiftByte(float i, float m) {
    return floor(i * pow(2.0, m));
}

float rshiftByte(float i, float m) {
    return floor(i / pow(2.0, m));
}

float andByte(float a, float b) {
    float o = 0.0;
    float x = 128.0;
    for (int i = 0; i < 8; i++) {
        o += x * min(floatGreaterThanOrEqual(a, x), floatGreaterThanOrEqual(b, x));
        a -= x * floatGreaterThanOrEqual(a, x);
        b -= x * floatGreaterThanOrEqual(b, x);
        x /= 2.0;
    }
    return o;
}

float orByte(float a, float b) {
    float o = 0.0;
    float x = 128.0;
    for (int i = 0; i < 8; i++) {
        o += x * max(floatGreaterThanOrEqual(a, x), floatGreaterThanOrEqual(b, x));
        a -= x * floatGreaterThanOrEqual(a, x);
        b -= x * floatGreaterThanOrEqual(b, x);
        x /= 2.0;
    }
    return o;
}

float xorByte(float a, float b) {
    float o = 0.0;
    float x = 128.0;
    for (int i = 0; i < 8; i++) {
        o += x * floatNotEquals(floatGreaterThanOrEqual(a, x), floatGreaterThanOrEqual(b, x));
        a -= x * floatGreaterThanOrEqual(a, x);
        b -= x * floatGreaterThanOrEqual(b, x);
        x /= 2.0;
    }
    return o;
}

void bignumAssign(inout float dst[16], inout float src[16]) {
    for (int i = 0; i < 16; i++) {
        dst[i] = src[i];
    }
}

void rshiftWord(inout float bn[16], float nwords) {
    nwords = max(floor(nwords), 0.0);
    for (int i = 0; i < 16; i++) {
        bn[i] = bn[int(min(float(i) + nwords, 15.0))] * floatLessThanOrEqual(float(i) + nwords, 15.0);
    }
}

void lshiftWord(inout float bn[16], float nwords) {
    nwords = max(floor(nwords), 0.0);
    for (int i = 15; i >= 0; i--) {
        bn[i] = bn[int(max(float(i) - nwords, 0.0))] * floatGreaterThanOrEqual(float(i) - nwords, 0.0);
    }
}

void lshiftOneBit(inout float bn[16]) {
    for (int i = 15; i >= 1; i--) {
        bn[i] = xorByte(lshiftByte(bn[i], 1.0), rshiftByte(bn[i-1], 7.0));
    }
    bn[0] = lshiftByte(bn[0], 1.0);
}

void rshiftOneBit(inout float bn[16]) {
    for (int i = 0; i < 15; i++) {
        bn[i] = xorByte(rshiftByte(bn[i], 1.0), lshiftByte(bn[i+1], 7.0));
    }
    bn[15] = rshiftByte(bn[15], 1.0);
}

float bignumCmp(inout float a[16], inout float b[16]) {
    float f = 0.0;
    for (int i = 15; i >= 0; i--) {
        f -= floatEquals(f, 0.0) * floatLessThan(a[i], b[i]);
        f += floatEquals(f, 0.0) * floatGreaterThan(a[i], b[i]);
    }
    return f;
}

float bignumIsZero(inout float a[16]) {
    float f = 0.0;
    for (int i = 0; i < 16; i++) {
        f = max(f + a[i], 1.0);
    }
	return f;
}

void bignumPow(inout float a[16], inout float b[16], inout float c[16]) {
    bignumInit(c);
    if (bignumIsZero(b) == 1.0) {
        bignumInc(c);
    } else {
        float tmp[16];
        float bcopy[16];
        bignumAssign(tmp, a);
        bignumAssign(bcopy, b);
        bignumDec(bcopy);
        for (int i = 0; i < 8 * 16; i++) {
            if (bignumIsZero(bcopy) == 1.0) {
                break;
			}
            bignumMul(tmp, a, c);
			bignumDec(bcopy);
			bignumAssign(tmp, c);
        }
        bignumAssign(c, tmp);
    }
}

void bignumIsqrt(inout float a[16], inout float b[16]) {
    float low[16];
    float high[16];
    float mid[16];
    float tmp[16];
    bignumAssign(high, a);
    bignumRshift(high, mid, 1.0);
    bignumInc(mid);
    for (int i = 0; i < 8 * 16; i++) {
        if (bignumCmp(high, low) <= 0.0) {
			break;
		}
        bignumMul(mid, mid, tmp);
		if (bignumCmp(tmp, a) > 0.0) {
			bignumAssign(high, mid);
			bignumDec(high);
		} else {
			bignumAssign(low, mid);
		}
		bignumSub(high, low, mid);
		rshiftOneBit(mid);
		bignumAdd(low, mid, mid);
		bignumInc(mid);
    }
    bignumAssign(b, low);
}

void main(void)
{
    // get self
    vec4 self = texture2D(Data, gl_FragCoord.xy / Width);
    float i = floor(gl_FragCoord.x) + floor(gl_FragCoord.y); 

    // my position within the range to merge
    float j = floor(mod(i,TwoStage));

    float compare;

    if ( (j<Pass_mod_Stage) || (j>TwoStage_PmS_1) ) 
	// must copy -> compare with self
	compare = 0.0;
    else
	// must sort
	if ( mod((j+Pass_mod_Stage) / Pass,2.0) < 1.0)
	    // we are on the left side -> compare with partner on the right
	    compare = 1.0;
	else
	    // we are on the right side -> compare with partner on the left
	    compare = -1.0;

    // get the partner
    float adr = i + compare*Pass;
    vec4 partner = texture2D(Data, (vec2(floor(mod(adr, Width)),
					                     floor(adr / Width)) + vec2(0.5, 0.5)) / Width);

    // on the left its a < operation, on the right its a >= operation
    gl_FragColor = (self.x*compare < partner.x*compare) ? self : partner;
}
