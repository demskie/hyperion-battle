#ifdef GL_ES
precision highp float;
precision highp int;
precision highp sampler2D;
#endif

uniform sampler2D Data1;
uniform sampler2D Data2;
uniform float Width;

float round(float);
float floatEquals(float, float);
float floatNotEquals(float, float);
float floatLessThan(float, float);
float floatGreaterThan(float, float);
float floatLessThanOrEqual(float, float);
float floatGreaterThanOrEqual(float, float);

bool bignumEquals(inout float a[16], inout float b[16]) {
    float cmp;
    for (int i = 16 - 1; i >= 0; i--) {
        cmp += floatEquals(cmp, 0.0) * floatGreaterThan(a[i], b[i]);
        cmp -= floatEquals(cmp, 0.0) * floatLessThan(a[i], b[i]);
    }
    return cmp == 0.0;
}

bool bignumEquals(inout float a[16], float f) {
    float b[16];
    b[0] = mod(f, 256.0);
    b[1] = floor(f / 256.0);
    return bignumEquals(a, b);
}

bool bignumLessThan(inout float a[16], inout float b[16]) {
    float cmp;
    for (int i = 16 - 1; i >= 0; i--) {
        cmp += floatEquals(cmp, 0.0) * floatGreaterThan(a[i], b[i]);
        cmp -= floatEquals(cmp, 0.0) * floatLessThan(a[i], b[i]);
    }
    return cmp < 0.0;
}

bool bignumLessThan(inout float a[16], float f) {
    float b[16];
    b[0] = mod(f, 256.0);
    b[1] = floor(f / 256.0);
    return bignumLessThan(a, b);
}

bool bignumLessThanOrEqual(inout float a[16], inout float b[16]) {
    float cmp;
    for (int i = 16 - 1; i >= 0; i--) {
        cmp += floatEquals(cmp, 0.0) * floatGreaterThan(a[i], b[i]);
        cmp -= floatEquals(cmp, 0.0) * floatLessThan(a[i], b[i]);
    }
    return cmp <= 0.0;
}

bool bignumLessThanOrEqual(inout float a[16], float f) {
    float b[16];
    b[0] = mod(f, 256.0);
    b[1] = floor(f / 256.0);
    return bignumLessThanOrEqual(a, b);
}

bool bignumGreaterThan(inout float a[16], inout float b[16]) {
    float cmp;
    for (int i = 16 - 1; i >= 0; i--) {
        cmp += floatEquals(cmp, 0.0) * floatGreaterThan(a[i], b[i]);
        cmp -= floatEquals(cmp, 0.0) * floatLessThan(a[i], b[i]);
    }
    return cmp > 0.0;
}

bool bignumGreaterThan(inout float a[16], float f) {
    float b[16];
    b[0] = mod(f, 256.0);
    b[1] = floor(f / 256.0);
    return bignumGreaterThan(a, b);
}

bool bignumGreaterThanOrEqual(inout float a[16], inout float b[16]) {
    float cmp;
    for (int i = 16 - 1; i >= 0; i--) {
        cmp += floatEquals(cmp, 0.0) * floatGreaterThan(a[i], b[i]);
        cmp -= floatEquals(cmp, 0.0) * floatLessThan(a[i], b[i]);
    }
    return cmp >= 0.0;
}

bool bignumGreaterThanOrEqual(inout float a[16], float f) {
    float b[16];
    b[0] = mod(f, 256.0);
    b[1] = floor(f / 256.0);
    return bignumGreaterThanOrEqual(a, b);
}

float lshiftByte(float f, float m) { 
    return floor(f * pow(2.0, mod(max(m, 0.0), 8.0)));
}

float rshiftByte(float f, float m) {
    return floor(f / pow(2.0, mod(max(m, 0.0), 8.0)));
}

float andByte(float a, float b) {
    float o = 0.0, x = 128.0;
    for (int i = 0; i < 8; i++) {
        o += x * min(floatGreaterThanOrEqual(a, x), 
                     floatGreaterThanOrEqual(b, x));
        a -= x * floatGreaterThanOrEqual(a, x);
        b -= x * floatGreaterThanOrEqual(b, x);
        x /= 2.0;
    }
    return o;
}

float orByte(float a, float b) {
    float o = 0.0, x = 128.0;
    for (int i = 0; i < 8; i++) {
        o += x * max(floatGreaterThanOrEqual(a, x), 
                     floatGreaterThanOrEqual(b, x));
        a -= x * floatGreaterThanOrEqual(a, x);
        b -= x * floatGreaterThanOrEqual(b, x);
        x /= 2.0;
    }
    return o;
}

float xorByte(float a, float b) {
    float o = 0.0, x = 128.0;
    for (int i = 0; i < 8; i++) {
        o += x * floatNotEquals(floatGreaterThanOrEqual(a, x), 
                                floatGreaterThanOrEqual(b, x));
        a -= x * floatGreaterThanOrEqual(a, x);
        b -= x * floatGreaterThanOrEqual(b, x);
        x /= 2.0;
    }
    return o;
}

void bignumAssignIfTrue(inout float [16], inout float [16], bool);
void bignumAdd(inout float [16], inout float [16], inout float [16]);
void bignumSub(inout float [16], inout float [16], inout float [16]);
void bignumMul(inout float [16], inout float [16], inout float [16]);
void bignumPow(inout float [16], inout float [16], inout float [16]);
void bignumDiv(inout float [16], inout float [16], inout float [16]);
void bignumMod(inout float [16], inout float [16], inout float [16]);
void bignumSqrt(inout float [16], inout float [16]);
void bignumLshift(inout float [16], inout float [16], float);
void bignumRshift(inout float [16], inout float [16], float);
void bignumAnd(inout float [16], inout float [16], inout float [16]);
void bignumOr(inout float [16], inout float [16], inout float [16]);
void bignumXor(inout float [16], inout float [16], inout float [16]);
bool bignumEquals(inout float [16], inout float [16]);
bool bignumLessThan(inout float [16], inout float [16]);
bool bignumGreaterThan(inout float [16], inout float [16]);
bool bignumLessThanOrEqual(inout float [16], inout float [16]);
bool bignumGreaterThanOrEqual(inout float [16], inout float [16]);

#define BIGNUMASSIGNIFTRUE
void bignumAssignIfTrue(inout float dst[16], inout float src[16], bool b) {
    float f = clamp(floor(float(b)), 0.0, 1.0);
    for (int i = 0; i < 16; i++) {
        dst[i] = f * src[i] + (f - 1.0) * dst[i];
    }
}

#define BIGNUMADD
void bignumAdd(inout float a[16], inout float b[16], inout float c[16]) {
    float carry, tmp;
    for (int i = 0; i < 16; i++) {
        tmp = a[i] + b[i] + carry;
        carry = floatGreaterThan(tmp, 255.0);
        c[i] = mod(tmp, 256.0);
    }
}

#define BIGNUMADDFLOAT
void bignumAdd(inout float a[16], float f, inout float c[16]) {
    float b[16];
    b[0] = mod(f, 256.0);
    b[1] = floor(f / 256.0);
    bignumAdd(a, b, c);
}

#define BIGNUMSUB
void bignumSub(inout float a[16], inout float b[16], inout float c[16]) {
    float borrow, tmp;
    for (int i = 0; i < 16; i++) {
        tmp = a[i] - b[i] - borrow;
        borrow = floatLessThan(tmp, 0.0);
        c[i] = mod(tmp, 256.0); 
    }
}

#define BIGNUMSUBFLOAT
void bignumSub(inout float a[16], float f, inout float c[16]) {
    float b[16];
    b[0] = mod(f, 256.0);
    b[1] = floor(f / 256.0);
    bignumSub(a, b, c);
}

#define BIGNUMMUL
void bignumMul(inout float a[16], inout float b[16], inout float c[16]) {
    float aStop, bStop;
    for (int i = 16 - 1; i > 0; i--) {
        aStop += floatEquals(aStop, 0.0) * floatGreaterThan(a[i], 0.0) * float(i);
        bStop += floatEquals(bStop, 0.0) * floatGreaterThan(b[i], 0.0) * float(i);
    }
    float t1[16];
    for (int i = 0; i < 16; i++) t1[i] = a[i];
    bignumAssignIfTrue(a, b, aStop < bStop);
    bignumAssignIfTrue(b, t1, aStop < bStop);
    float nonEmptyBytes, powerOfTwoBit;
    for (int i = 0; i < 16; i++) {
        nonEmptyBytes += floatGreaterThan(b[i], 0.0);
        float power = 1.0;
        for (int j = 0; j < 8; j++) {
            powerOfTwoBit = floatEquals(b[i], power) * float(i*8 + j)
                          + floatNotEquals(b[i], power) * powerOfTwoBit;
            power *= 2.0;
        }
    }
    if (aStop == 0.0 || bStop == 0.0) {
        float carry;
        for (int i = 0; i < 16; i++) {
            float v = a[i] * b[0] + carry;
            carry = v / 256.0;
            c[i] = mod(v, 256.0);
        }
    } else if (nonEmptyBytes == 1.0 && powerOfTwoBit > 0.0) {
        bignumLshift(a, c, powerOfTwoBit);
    } else {
        for (int i = 0; i < 16; i++) c[i] = 0.0;
        for (int i = 0; i < 16; i++) {
            float row[16];
            for (int j = 0; j < 16; j++) {
                float v = a[i] * b[j];
                t1[0] = mod(v, 256.0);
                t1[1] = floor(v / 256.0);
                for (int k = 2; k < 16; k++) t1[k] = 0.0;
                bignumLshift(t1, t1, 8.0 * float(i+j));
                float t2[16];
                bignumAdd(t1, row, t2);
                bignumAssignIfTrue(row, t2, i+j < 16);
                if (j >= int(min(aStop, bStop))) break;
            }
            bignumAdd(c, row, c);
        }
    }
}

#define BIGNUMMULFLOAT
void bignumMul(inout float a[16], float f, inout float c[16]) {
    float b[16];
    b[0] = mod(f, 256.0);
    b[1] = floor(f / 256.0);
    bignumMul(a, b, c);
}

#define BIGNUMDIV
void bignumDiv(inout float a[16], inout float b[16], inout float c[16]) {
    float stop;
    for (int i = 16 - 1; i > 0; i--) {
        stop += floatEquals(float(i), 0.0) * floatGreaterThan(float(b[i]), 0.0);
    }
    float nonEmptyBytes, powerOfTwoBit;
    for (int i = 0; i < 16; i++) {
        nonEmptyBytes += floatGreaterThan(float(b[i]), 0.0);
        float power = 1.0;
        for (int j = 0; j < 8; j++) {
            powerOfTwoBit = floatEquals(b[i], power) * float(i*8 + j)
                          + floatNotEquals(b[i], power) * powerOfTwoBit;
            power *= 2.0;
        }
    }
    if (stop == 0.0) {
        float rem;
        for (int i = 16 - 1; i >= 0; i--) {
            float ent = float(a[i]) + rem * 256.0;
            rem = mod(ent, b[0]);
            c[i] = floor(ent / b[0]);
        }
    } else if (nonEmptyBytes == 1.0 && powerOfTwoBit > 0.0) {
        bignumRshift(a, c, powerOfTwoBit);
    } else {
        for (int i = 0; i < 16; i++) c[i] = 0.0;
        float current[16], denom[16], t1[16], t2[16], t3[16];
        current[0] = 1.0;
        for (int i = 0; i < 16; i++) denom[i] = b[i];
        for (int i = 0; i < 16; i++) t1[i] = a[i];
        bool hasOverflowed;
        for (int i = 0; i < 8*16; i++) {
            if (bignumGreaterThan(denom, a)) break;
            if (denom[16-1] >= 128.0) {
                hasOverflowed = true;
                break;
            }
            bignumLshift(current, current, 1.0);
            bignumLshift(denom, denom, 1.0);
        }
        for (int i = 0; i < 16; i++) t2[i] = current[i];
        for (int i = 0; i < 16; i++) t3[i] = denom[i];
        bignumRshift(current, current, 1.0);
        bignumRshift(denom, denom, 1.0);
        bignumAssignIfTrue(current, t2, hasOverflowed == false);
        bignumAssignIfTrue(denom, t3, hasOverflowed == false);
        for (int i = 0; i < 8*16; i++) {
            float zero[16];
            if (bignumEquals(current, zero)) break;
            bool shouldModify = bignumGreaterThanOrEqual(t1, denom);
            for (int j = 0; j < 16; j++) t2[i] = t1[i];
            for (int j = 0; j < 16; j++) t3[i] = c[i];
            bignumSub(t2, denom, t2);
            bignumOr(t3, current, t3);
            bignumAssignIfTrue(t1, t2, shouldModify);
            bignumAssignIfTrue(c, t3, shouldModify);
            bignumRshift(current, current, 1.0);
            bignumRshift(denom, denom, 1.0);
        }
    }
}

#define BIGNUMDIVFLOAT
void bignumDiv(inout float a[16], float f, inout float c[16]) {
    float b[16];
    b[0] = mod(f, 256.0);
    b[1] = floor(f / 256.0);
    bignumDiv(a, b, c);
}

void bignumLshift(inout float a[16], inout float b[16], float nbits) {
    nbits = max(floor(nbits), 0.0);
    for (int i = 0; i < 16; i++) b[i] = a[i];
    float words = floor(nbits / 8.0);
    for (int i = 15; i >= 0; i--) {
        b[i] = b[int(max(float(i) - words, 0.0))] 
             * floatGreaterThanOrEqual(float(i) - words, 0.0);
    }
    nbits = floor(mod(nbits, 8.0));
    float t1[16];
    for (int i = 0; i < 16; i++) t1[i] = b[i];
    for (int i = 15; i > 0; i--) {
        t1[i] = orByte(lshiftByte(t1[i], nbits), rshiftByte(t1[i-1], 8.0-nbits));
    }
    t1[0] = lshiftByte(t1[0], nbits);
    bignumAssignIfTrue(b, t1, nbits != 0.0);
}

void bignumRshift(inout float a[16], inout float b[16], float nbits) {
    nbits = max(floor(nbits), 0.0);
    for (int i = 0; i < 16; i++) b[i] = a[i];
    float words = floor(nbits / 8.0);
    for (int i = 0; i < 16; i++) {
        b[i] = b[int(min(float(i) + words, 15.0))] 
             * floatLessThanOrEqual(float(i) + words, 16.0 - 1.0);
    }
    nbits = floor(mod(nbits, 8.0));
    float t1[16];
    for (int i = 0; i < 16; i++) t1[i] = b[i];
    for (int i = 0; i < 15; i++) {
        t1[i] = orByte(rshiftByte(t1[i], nbits), lshiftByte(t1[i+1], 8.0-nbits));
    }
    t1[15] = rshiftByte(t1[15], nbits);
    bignumAssignIfTrue(b, t1, nbits != 0.0);
}

#ifndef BIGNUMDIV
    #define BIGNUMDIV
    void bignumDiv(inout float [16], inout float [16], inout float [16]);
#endif

#ifndef BIGNUMMUL
    #define BIGNUMMUL
    void bignumMul(inout float [16], inout float [16], inout float [16]);
#endif

#ifndef BIGNUMSUB
    #define BIGNUMSUB
    void bignumSub(inout float [16], inout float [16], inout float [16]);
#endif

#define BIGNUMMOD
void bignumMod(inout float ia[16], inout float ib[16], inout float oc[16]) {
	float tc[16];
	bignumDiv(ia, ib, oc);
    bignumMul(oc, ib, tc);
    bignumSub(ia, tc, oc);
}

#define BIGNUMMODFLOAT
void bignumMod(inout float a[16], float f, inout float c[16]) {
    float b[16];
    b[0] = mod(f, 256.0);
    b[1] = floor(f / 256.0);
    bignumMod(a, b, c);
}

void bignumAnd(inout float a[16], inout float b[16], inout float c[16]) {
    for (int i = 0; i < 16; i++) {
        float o = 0.0, x = 128.0;
        float v1 = a[i], v2 = b[i];
        for (int j = 0; j < 8; j++) {
            o += x * floatGreaterThanOrEqual(v1, x) * floatGreaterThanOrEqual(v2, x);
            v1 -= x * floatGreaterThanOrEqual(v1, x);
            v2 -= x * floatGreaterThanOrEqual(v2, x);
            x /= 2.0;
        }
        c[i] = o;
    }
}

void bignumOr(inout float a[16], inout float b[16], inout float c[16]) {
    for (int i = 0; i < 16; i++) {
        float o = 0.0, x = 128.0;
        float v1 = a[i], v2 = b[i];
        for (int j = 0; j < 8; j++) {
            o += x * max(floatGreaterThanOrEqual(v1, x),
                         floatGreaterThanOrEqual(v2, x));
            v1 -= x * floatGreaterThanOrEqual(v1, x);
            v2 -= x * floatGreaterThanOrEqual(v2, x);
            x /= 2.0;
        }
        c[i] = o;
    }
}

void bignumXor(inout float a[16], inout float b[16], inout float c[16]) {
    for (int i = 0; i < 16; i++) {
        float o = 0.0, x = 128.0;
        float v1 = a[i], v2 = b[i];
        for (int j = 0; j < 8; j++) {
            o += x * floatNotEquals(floatGreaterThanOrEqual(v1, x),
                                    floatGreaterThanOrEqual(v2, x));
            v1 -= x * floatGreaterThanOrEqual(v1, x);
            v2 -= x * floatGreaterThanOrEqual(v2, x);
            x /= 2.0;
        }
        c[i] = o;
    }
}

void bignumPow(inout float a[16], inout float b[16], inout float c[16]) {
    float t1[16], t2[16], one[16], zero[16];
    for (int i = 0; i < 16; i++) t1[i] = a[i];
    for (int i = 0; i < 16; i++) t2[i] = b[i];
    one[0] = 1.0;
    bignumSub(t2, one, t2);
    bool bIsZero = bignumEquals(b, zero);
    for (int i = 0; i < 8 * 16; i++) {
        if (bIsZero || bignumEquals(t2, zero)) break;
        bignumMul(t1, a, c);
        bignumSub(t2, one, t2);
        for (int j = 0; j < 16; j++) t1[j] = c[j];
    }
    for (int i = 0; i < 16; i++) c[i] = t1[i];
    bignumAssignIfTrue(c, one, bIsZero);
}

void bignumSqrt(inout float a[16], inout float b[16]) {
    float low[16], high[16], mid[16], t1[16], one[16];
    for (int i = 0; i < 16; i++) high[i] = a[i];
    bignumRshift(high, mid, 1.0);
    one[0] = 1.0;
    bignumAdd(mid, one, mid);
    for (int i = 0; i < 8 * 16; i++) {
        if (bignumLessThanOrEqual(high, low)) break;
        bignumMul(mid, mid, t1);
        bool isGreaterThan = bignumGreaterThan(t1, a);
        for (int j = 0; j < 16; j++) t1[j] = mid[j];
        bignumSub(t1, one, t1);
        bignumAssignIfTrue(high, t1, isGreaterThan);
		bignumAssignIfTrue(low, mid, !isGreaterThan);
		bignumSub(high, low, mid);
        bignumRshift(mid, mid, 1.0);
        bignumAdd(low, mid, mid);
        bignumAdd(mid, one, mid);
    }
    for (int i = 0; i < 16; i++) b[i] = low[i];
}

void main(void) {
    vec4 data1 = texture2D(Data1, gl_FragCoord.xy / Width);
    vec4 data2 = texture2D(Data2, gl_FragCoord.xy / Width);

    float bn1[16], bn2[16], bn3[16];
    bn1[0] = data1.r;
    bn1[1] = data1.g;
    bn1[2] = data1.b;
    bn1[3] = data1.a;
    bn2[0] = data2.r;
    bn2[1] = data2.g;
    bn2[2] = data2.b;
    bn2[3] = data2.a;

    bignumAdd(bn1, bn2, bn3);
    
    gl_FragColor = vec4(bn3[0], bn3[1], bn3[2], bn3[3]);
    // gl_FragColor = vec4(andByte(5.0, 255.0) / 255.0);
}
