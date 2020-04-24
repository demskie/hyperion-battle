#ifdef GL_ES
precision highp float;
precision highp int;
precision highp sampler2D;
#endif

uniform sampler2D Data1;
uniform sampler2D Data2;
uniform float Width;

const int BYTE_COUNT = 16;

bool biguintEquals(inout float a[BYTE_COUNT], inout float b[BYTE_COUNT]) {
    float cmp;
    for (int i = BYTE_COUNT - 1; i >= 0; i--) {
        cmp += float(cmp == 0.0) * float(a[i] > b[i]);
        cmp -= float(cmp == 0.0) * float(a[i] < b[i]);
    }
    return cmp == 0.0;
}

bool biguintEquals(inout float a[BYTE_COUNT], float f) {
    float b[BYTE_COUNT];
    b[0] = mod(f, 256.0);
    b[1] = floor(f / 256.0);
    return biguintEquals(a, b);
}

bool biguintLessThan(inout float a[BYTE_COUNT], inout float b[BYTE_COUNT]) {
    float cmp;
    for (int i = BYTE_COUNT - 1; i >= 0; i--) {
        cmp += float(cmp == 0.0) * float(a[i] > b[i]);
        cmp -= float(cmp == 0.0) * float(a[i] < b[i]);
    }
    return cmp < 0.0;
}

bool biguintLessThan(inout float a[BYTE_COUNT], float f) {
    float b[BYTE_COUNT];
    b[0] = mod(f, 256.0);
    b[1] = floor(f / 256.0);
    return biguintLessThan(a, b);
}

bool biguintLessThanOrEqual(inout float a[BYTE_COUNT], inout float b[BYTE_COUNT]) {
    float cmp;
    for (int i = BYTE_COUNT - 1; i >= 0; i--) {
        cmp += float(cmp == 0.0) * float(a[i] > b[i]);
        cmp -= float(cmp == 0.0) * float(a[i] < b[i]);
    }
    return cmp <= 0.0;
}

bool biguintLessThanOrEqual(inout float a[BYTE_COUNT], float f) {
    float b[BYTE_COUNT];
    b[0] = mod(f, 256.0);
    b[1] = floor(f / 256.0);
    return biguintLessThanOrEqual(a, b);
}

bool biguintGreaterThan(inout float a[BYTE_COUNT], inout float b[BYTE_COUNT]) {
    float cmp;
    for (int i = BYTE_COUNT - 1; i >= 0; i--) {
        cmp += float(cmp == 0.0) * float(a[i] > b[i]);
        cmp -= float(cmp == 0.0) * float(a[i] < b[i]);
    }
    return cmp > 0.0;
}

bool biguintGreaterThan(inout float a[BYTE_COUNT], float f) {
    float b[BYTE_COUNT];
    b[0] = mod(f, 256.0);
    b[1] = floor(f / 256.0);
    return biguintGreaterThan(a, b);
}

bool biguintGreaterThanOrEqual(inout float a[BYTE_COUNT], inout float b[BYTE_COUNT]) {
    float cmp;
    for (int i = BYTE_COUNT - 1; i >= 0; i--) {
        cmp += float(cmp == 0.0) * float(a[i] > b[i]);
        cmp -= float(cmp == 0.0) * float(a[i] < b[i]);
    }
    return cmp >= 0.0;
}

bool biguintGreaterThanOrEqual(inout float a[BYTE_COUNT], float f) {
    float b[BYTE_COUNT];
    b[0] = mod(f, 256.0);
    b[1] = floor(f / 256.0);
    return biguintGreaterThanOrEqual(a, b);
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
        o += x * min(float(a >= x), float(b >= x));
        a -= x * float(a >= x);
        b -= x * float(b >= x);
        x /= 2.0;
    }
    return o;
}

float orByte(float a, float b) {
    float o = 0.0, x = 128.0;
    for (int i = 0; i < 8; i++) {
        o += x * max(float(a >= x), float(b >= x));
        a -= x * float(a >= x);
        b -= x * float(b >= x);
        x /= 2.0;
    }
    return o;
}

float xorByte(float a, float b) {
    float o = 0.0, x = 128.0;
    for (int i = 0; i < 8; i++) {
        o += x * float(float(a >= x) != float(b >= x));
        a -= x * float(a >= x);
        b -= x * float(b >= x);
        x /= 2.0;
    }
    return o;
}

void biguintAssignIfTrue(inout float [BYTE_COUNT], inout float [BYTE_COUNT], bool);
void biguintAdd(inout float [BYTE_COUNT], inout float [BYTE_COUNT], inout float [BYTE_COUNT]);
void biguintSub(inout float [BYTE_COUNT], inout float [BYTE_COUNT], inout float [BYTE_COUNT]);
void biguintMul(inout float [BYTE_COUNT], inout float [BYTE_COUNT], inout float [BYTE_COUNT]);
void biguintPow(inout float [BYTE_COUNT], inout float [BYTE_COUNT], inout float [BYTE_COUNT]);
void biguintDiv(inout float [BYTE_COUNT], inout float [BYTE_COUNT], inout float [BYTE_COUNT]);
void biguintMod(inout float [BYTE_COUNT], inout float [BYTE_COUNT], inout float [BYTE_COUNT]);
void biguintSqrt(inout float [BYTE_COUNT], inout float [BYTE_COUNT]);
void biguintLshift(inout float [BYTE_COUNT], inout float [BYTE_COUNT], float);
void biguintLshiftByOne(inout float [BYTE_COUNT]);
void biguintRshift(inout float [BYTE_COUNT], inout float [BYTE_COUNT], float);
void biguintRshiftByOne(inout float [BYTE_COUNT]);
void biguintAnd(inout float [BYTE_COUNT], inout float [BYTE_COUNT], inout float [BYTE_COUNT]);
void biguintOr(inout float [BYTE_COUNT], inout float [BYTE_COUNT], inout float [BYTE_COUNT]);
void biguintXor(inout float [BYTE_COUNT], inout float [BYTE_COUNT], inout float [BYTE_COUNT]);
bool biguintEquals(inout float [BYTE_COUNT], inout float [BYTE_COUNT]);
bool biguintLessThan(inout float [BYTE_COUNT], inout float [BYTE_COUNT]);
bool biguintGreaterThan(inout float [BYTE_COUNT], inout float [BYTE_COUNT]);
bool biguintLessThanOrEqual(inout float [BYTE_COUNT], inout float [BYTE_COUNT]);
bool biguintGreaterThanOrEqual(inout float [BYTE_COUNT], inout float [BYTE_COUNT]);

#define BIGNUMASSIGNIFTRUE
void biguintAssignIfTrue(inout float dst[BYTE_COUNT], inout float src[BYTE_COUNT], bool b) {
    for (int i = 0; i < BYTE_COUNT; i++) {
        dst[i] = float(b) * src[i] + float(!b) * dst[i];
    }
}

#define BIGNUMADD
void biguintAdd(inout float a[BYTE_COUNT], inout float b[BYTE_COUNT], inout float c[BYTE_COUNT]) {
    float carry, tmp;
    for (int i = 0; i < BYTE_COUNT; i++) {
        tmp = a[i] + b[i] + carry;
        carry = float(tmp > 255.0);
        c[i] = mod(tmp, 256.0);
    }
}

#define BIGNUMADDFLOAT
void biguintAdd(inout float a[BYTE_COUNT], float f, inout float c[BYTE_COUNT]) {
    float b[BYTE_COUNT];
    b[0] = mod(f, 256.0);
    b[1] = floor(f / 256.0);
    biguintAdd(a, b, c);
}

#define BIGNUMSUB
void biguintSub(inout float a[BYTE_COUNT], inout float b[BYTE_COUNT], inout float c[BYTE_COUNT]) {
    float borrow, tmp;
    for (int i = 0; i < BYTE_COUNT; i++) {
        tmp = a[i] - b[i] - borrow;
        borrow = float(tmp < 0.0);
        c[i] = mod(tmp, 256.0); 
    }
}

#define BIGNUMSUBFLOAT
void biguintSub(inout float a[BYTE_COUNT], float f, inout float c[BYTE_COUNT]) {
    float b[BYTE_COUNT];
    b[0] = mod(f, 256.0);
    b[1] = floor(f / 256.0);
    biguintSub(a, b, c);
}

#define BIGNUMMUL
void biguintMul(inout float a[BYTE_COUNT], inout float b[BYTE_COUNT], inout float c[BYTE_COUNT]) {
    float aStop, bStop;
    for (int i = BYTE_COUNT - 1; i > 0; i--) {
        aStop += float(aStop == 0.0) * float(a[i] > 0.0) * float(i);
        bStop += float(bStop == 0.0) * float(b[i] > 0.0) * float(i);
    }
    float t1[BYTE_COUNT];
    for (int i = 0; i < BYTE_COUNT; i++) t1[i] = a[i];
    biguintAssignIfTrue(a, b, aStop < bStop);
    biguintAssignIfTrue(b, t1, aStop < bStop);
    float nonEmptyBytes, powerOfTwoBit;
    for (int i = 0; i < BYTE_COUNT; i++) {
        nonEmptyBytes += float(b[i] > 0.0);
        float power = 1.0;
        for (int j = 0; j < 8; j++) {
            powerOfTwoBit = float(b[i] == power) * float(i*8 + j)
                          + float(b[i] != power) * powerOfTwoBit;
            power *= 2.0;
        }
    }
    if (aStop == 0.0 || bStop == 0.0) {
        float carry;
        for (int i = 0; i < BYTE_COUNT; i++) {
            float v = a[i] * b[0] + carry;
            carry = v / 256.0;
            c[i] = mod(v, 256.0);
        }
    } else if (nonEmptyBytes == 1.0 && powerOfTwoBit > 0.0) {
        biguintLshift(a, c, powerOfTwoBit);
    } else {
        float product, carry;
        float t2[BYTE_COUNT*2];
        for (int i = 0; i < BYTE_COUNT; i++) {
            for (int j = 0; j < BYTE_COUNT; j++) {
                product = a[i] * b[j] + t2[i+j];
                carry = product / 256.0;
                t2[i+j] = product - carry * 256.0;
                t2[i+j+1] += carry;
            }
        }
        for (int i = 0; i < BYTE_COUNT; i++) c[i] = t2[i];
    }
}

#define BIGNUMMULFLOAT
void biguintMul(inout float a[BYTE_COUNT], float f, inout float c[BYTE_COUNT]) {
    float b[BYTE_COUNT];
    b[0] = mod(f, 256.0);
    b[1] = floor(f / 256.0);
    biguintMul(a, b, c);
}

#define BIGNUMDIV
void biguintDiv(inout float a[BYTE_COUNT], inout float b[BYTE_COUNT], inout float c[BYTE_COUNT]) {
    float stop;
    for (int i = BYTE_COUNT - 1; i > 0; i--) {
        stop += float(i == 0) * float(b[i] > 0.0);
    }
    float nonEmptyBytes, powerOfTwoBit;
    for (int i = 0; i < BYTE_COUNT; i++) {
        nonEmptyBytes += float(b[i] > 0.0);
        float power = 1.0;
        for (int j = 0; j < 8; j++) {
            powerOfTwoBit = float(b[i] == power) * float(i*8 + j)
                          + float(b[i] != power) * powerOfTwoBit;
            power *= 2.0;
        }
    }
    if (stop == 0.0) {
        float rem;
        for (int i = BYTE_COUNT - 1; i >= 0; i--) {
            float ent = a[i] + rem * 256.0;
            rem = mod(ent, b[0]);
            c[i] = floor(ent / b[0]);
        }
    } else if (nonEmptyBytes == 1.0 && powerOfTwoBit > 0.0) {
        biguintRshift(a, c, powerOfTwoBit);
    } else {
        for (int i = 0; i < BYTE_COUNT; i++) c[i] = 0.0;
        float current[BYTE_COUNT], denom[BYTE_COUNT], t1[BYTE_COUNT], t2[BYTE_COUNT], t3[BYTE_COUNT];
        current[0] = 1.0;
        for (int i = 0; i < BYTE_COUNT; i++) denom[i] = b[i];
        for (int i = 0; i < BYTE_COUNT; i++) t1[i] = a[i];
        bool hasOverflowed;
        for (int i = 0; i < 8*BYTE_COUNT; i++) {
            if (biguintGreaterThan(denom, a)) break;
            if (denom[BYTE_COUNT-1] >= 128.0) {
                hasOverflowed = true;
                break;
            }
            biguintLshiftByOne(current);
            biguintLshiftByOne(denom);
        }
        for (int i = 0; i < BYTE_COUNT; i++) t2[i] = current[i];
        for (int i = 0; i < BYTE_COUNT; i++) t3[i] = denom[i];
        biguintRshiftByOne(current);
        biguintRshiftByOne(denom);
        biguintAssignIfTrue(current, t2, hasOverflowed == false);
        biguintAssignIfTrue(denom, t3, hasOverflowed == false);
        for (int i = 0; i < 8*BYTE_COUNT; i++) {
            float currentIsZero = 1.0;
            for (int j = 0; j < BYTE_COUNT; j++) currentIsZero -= currentIsZero * float(current[j] > 0.0);
            if (currentIsZero == 1.0) break;
            bool shouldModify = biguintGreaterThanOrEqual(t1, denom);
            for (int j = 0; j < BYTE_COUNT; j++) t2[i] = t1[i];
            for (int j = 0; j < BYTE_COUNT; j++) t3[i] = c[i];
            biguintSub(t2, denom, t2);
            biguintOr(t3, current, t3);
            biguintAssignIfTrue(t1, t2, shouldModify);
            biguintAssignIfTrue(c, t3, shouldModify);
            biguintRshiftByOne(current);
            biguintRshiftByOne(denom);
        }
    }
}

#define BIGNUMDIVFLOAT
void biguintDiv(inout float a[BYTE_COUNT], float f, inout float c[BYTE_COUNT]) {
    float b[BYTE_COUNT];
    b[0] = mod(f, 256.0);
    b[1] = floor(f / 256.0);
    biguintDiv(a, b, c);
}

#define BIGNUMLSHIFT
void biguintLshift(inout float a[BYTE_COUNT], inout float b[BYTE_COUNT], float count) {
    count = clamp(floor(count), 0.0, float(BYTE_COUNT*8));
    float byteCount = floor(count / 8.0);
    for (int i = 0; i < BYTE_COUNT; i++) b[i] = a[i];
    for (int i = 0; i < BYTE_COUNT; i++) {
        for (int j = BYTE_COUNT - 1; j > 0; j--) {
            b[j] = float(byteCount > 0.0) * b[j-1] 
                 + float(byteCount <= 0.0) * b[j];
        }
        b[0] = float(byteCount <= 0.0) * b[0];
        byteCount -= 1.0;
    }
    count = mod(count, 8.0);
    bool bits[BYTE_COUNT*8];
    for (int i = 0; i < BYTE_COUNT; i++) {
        float x = 128.0, v = b[BYTE_COUNT-1-i];
        for (int j = 0; j < 8; j++) {
            bits[i*8+j] = v >= x;
            v -= x * float(v >= x);
            x = floor(x / 2.0);
        }
    }
    for (int i = 0; i < 8; i++) {
        for (int j = 0; j < BYTE_COUNT*8 - 1; j++) bits[j] = bits[j+1];
        bits[BYTE_COUNT*8-1] = false;
        for (int j = 0; j < BYTE_COUNT; j++) {
            float v = float(bits[j*8+0]) * 128.0
                    + float(bits[j*8+1]) * 64.0
                    + float(bits[j*8+2]) * 32.0
                    + float(bits[j*8+3]) * 16.0
                    + float(bits[j*8+4]) * 8.0
                    + float(bits[j*8+5]) * 4.0
                    + float(bits[j*8+6]) * 2.0
                    + float(bits[j*8+7]) * 1.0;
            b[BYTE_COUNT-1-j] = float(float(i) < count) * v
                             + float(float(i) >= count) * b[BYTE_COUNT-1-j];
        }
    }
}

#define BIGNUMLSHIFTFLOAT
void biguintLshift(inout float a[BYTE_COUNT], inout float b[BYTE_COUNT], inout float c[BYTE_COUNT]) {
    float cf = c[0] + c[1] * 256.0;
    biguintLshift(a, b, cf);
}

#define BIGNUMLSHIFTBYONE
void biguintLshiftByOne(inout float a[BYTE_COUNT]) {
    bool bits[BYTE_COUNT*8];
    for (int i = 0; i < BYTE_COUNT; i++) {
        float x = 128.0, v = a[BYTE_COUNT-1-i];
        for (int j = 0; j < 8; j++) {
            bits[i*8+j] = v >= x;
            v -= x * float(v >= x);
            x = floor(x / 2.0);
        }
    }
    for (int i = 0; i < BYTE_COUNT*8 - 1; i++) bits[i] = bits[i+1];
    bits[BYTE_COUNT*8-1] = false;
    for (int i = 0; i < BYTE_COUNT; i++) {
        a[BYTE_COUNT-1-i] = float(bits[i*8+0]) * 128.0
                         + float(bits[i*8+1]) * 64.0
                         + float(bits[i*8+2]) * 32.0
                         + float(bits[i*8+3]) * 16.0
                         + float(bits[i*8+4]) * 8.0
                         + float(bits[i*8+5]) * 4.0
                         + float(bits[i*8+6]) * 2.0
                         + float(bits[i*8+7]) * 1.0;
    }
}

#define BIGNUMRSHIFT
void biguintRshift(inout float a[BYTE_COUNT], inout float b[BYTE_COUNT], float count) {
    count = clamp(floor(count), 0.0, float(BYTE_COUNT*8));
    float byteCount = floor(count / 8.0);
    for (int i = 0; i < BYTE_COUNT; i++) b[i] = a[i];
    for (int i = 0; i < BYTE_COUNT; i++) {
        for (int j = 0; j < BYTE_COUNT-1; j++) {
            b[j] = float(byteCount > 0.0) * b[j+1] 
                 + float(byteCount <= 0.0) * b[j];
        }
        b[BYTE_COUNT-1] = float(byteCount <= 0.0) * b[BYTE_COUNT-1];
        byteCount -= 1.0;
    }
    count = mod(count, 8.0);
    bool bits[BYTE_COUNT*8];
    for (int i = 0; i < BYTE_COUNT; i++) {
        float x = 128.0, v = b[BYTE_COUNT-1-i];
        for (int j = 0; j < 8; j++) {
            bits[i*8+j] = v >= x;
            v -= x * float(v >= x);
            x = floor(x / 2.0);
        }
    }
    for (int i = 0; i < 8; i++) {
        for (int j = BYTE_COUNT*8 - 1; j > 0; j--) bits[j] = bits[j-1];
        bits[0] = false;
        for (int j = 0; j < BYTE_COUNT; j++) {
            float v = float(bits[j*8+0]) * 128.0
                    + float(bits[j*8+1]) * 64.0
                    + float(bits[j*8+2]) * 32.0
                    + float(bits[j*8+3]) * 16.0
                    + float(bits[j*8+4]) * 8.0
                    + float(bits[j*8+5]) * 4.0
                    + float(bits[j*8+6]) * 2.0
                    + float(bits[j*8+7]) * 1.0;
            b[BYTE_COUNT-1-j] = float(float(i) < count) * v
                             + float(float(i) >= count) * b[BYTE_COUNT-1-j];
        }
    }
}

#define BIGNUMRSHIFTFLOAT
void biguintRshift(inout float a[BYTE_COUNT], inout float b[BYTE_COUNT], inout float c[BYTE_COUNT]) {
    float cf = c[0] + c[1] * 256.0;
    biguintRshift(a, b, cf);
}

#define BIGNUMRSHIFTBYONE
void biguintRshiftByOne(inout float a[BYTE_COUNT]) {
    bool bits[BYTE_COUNT*8];
    for (int i = 0; i < BYTE_COUNT; i++) {
        float x = 128.0, v = a[BYTE_COUNT-1-i];
        for (int j = 0; j < 8; j++) {
            bits[i*8+j] = v >= x;
            v -= x * float(v >= x);
            x = floor(x / 2.0);
        }
    }
    for (int i = BYTE_COUNT*8 - 1; i > 0; i--) bits[i] = bits[i-1];
    bits[0] = false;
    for (int i = 0; i < BYTE_COUNT; i++) {
        a[BYTE_COUNT-1-i] = float(bits[i*8+0]) * 128.0
                         + float(bits[i*8+1]) * 64.0
                         + float(bits[i*8+2]) * 32.0
                         + float(bits[i*8+3]) * 16.0
                         + float(bits[i*8+4]) * 8.0
                         + float(bits[i*8+5]) * 4.0
                         + float(bits[i*8+6]) * 2.0
                         + float(bits[i*8+7]) * 1.0;
    }
}

#ifndef BIGNUMDIV
    #define BIGNUMDIV
    void biguintDiv(inout float [BYTE_COUNT], inout float [BYTE_COUNT], inout float [BYTE_COUNT]);
#endif

#ifndef BIGNUMMUL
    #define BIGNUMMUL
    void biguintMul(inout float [BYTE_COUNT], inout float [BYTE_COUNT], inout float [BYTE_COUNT]);
#endif

#ifndef BIGNUMSUB
    #define BIGNUMSUB
    void biguintSub(inout float [BYTE_COUNT], inout float [BYTE_COUNT], inout float [BYTE_COUNT]);
#endif

#define BIGNUMMOD
void biguintMod(inout float ia[BYTE_COUNT], inout float ib[BYTE_COUNT], inout float oc[BYTE_COUNT]) {
	float tc[BYTE_COUNT];
	biguintDiv(ia, ib, oc);
    biguintMul(oc, ib, tc);
    biguintSub(ia, tc, oc);
}

#define BIGNUMMODFLOAT
void biguintMod(inout float a[BYTE_COUNT], float f, inout float c[BYTE_COUNT]) {
    float b[BYTE_COUNT];
    b[0] = mod(f, 256.0);
    b[1] = floor(f / 256.0);
    biguintMod(a, b, c);
}

void biguintAnd(inout float a[BYTE_COUNT], inout float b[BYTE_COUNT], inout float c[BYTE_COUNT]) {
    for (int i = 0; i < BYTE_COUNT; i++) {
        float o = 0.0, x = 128.0;
        float v1 = a[i], v2 = b[i];
        for (int j = 0; j < 8; j++) {
            o += x * min(float(v1 >= x), float(v2 >= x));
            v1 -= x * float(v1 >= x);
            v2 -= x * float(v2 >= x);
            x /= 2.0;
        }
        c[i] = o;
    }
}

void biguintOr(inout float a[BYTE_COUNT], inout float b[BYTE_COUNT], inout float c[BYTE_COUNT]) {
    for (int i = 0; i < BYTE_COUNT; i++) {
        float o = 0.0, x = 128.0;
        float v1 = a[i], v2 = b[i];
        for (int j = 0; j < 8; j++) {
            o += x * max(float(v1 >= x), float(v2 >= x));
            v1 -= x * float(v1 >= x);
            v2 -= x * float(v2 >= x);
            x /= 2.0;
        }
        c[i] = o;
    }
}

void biguintXor(inout float a[BYTE_COUNT], inout float b[BYTE_COUNT], inout float c[BYTE_COUNT]) {
    for (int i = 0; i < BYTE_COUNT; i++) {
        float o = 0.0, x = 128.0;
        float v1 = a[i], v2 = b[i];
        for (int j = 0; j < 8; j++) {
            o += x * float(float(v1 >= x) != float(v2 >= x));
            v1 -= x * float(v1 >= x);
            v2 -= x * float(v2 >= x);
            x /= 2.0;
        }
        c[i] = o;
    }
}

void biguintPow(inout float a[BYTE_COUNT], inout float b[BYTE_COUNT], inout float c[BYTE_COUNT]) {
    float t1[BYTE_COUNT], t2[BYTE_COUNT], one[BYTE_COUNT];
    for (int i = 0; i < BYTE_COUNT; i++) t1[i] = a[i];
    for (int i = 0; i < BYTE_COUNT; i++) t2[i] = b[i];
    one[0] = 1.0;
    biguintSub(t2, one, t2);
    float bIsZero = 1.0;
    for (int i = 0; i < BYTE_COUNT; i++) bIsZero -= bIsZero * float(b[i] > 0.0);
    if (bIsZero == 0.0) {
        for (int i = 0; i < 8 * BYTE_COUNT; i++) {
            float t2IsZero = 1.0;
            for (int j = 0; j < BYTE_COUNT; j++) t2IsZero -= t2IsZero * float(t2[j] > 0.0);
            if (t2IsZero == 1.0) break;
            biguintMul(t1, a, c);
            biguintSub(t2, one, t2);
            for (int j = 0; j < BYTE_COUNT; j++) t1[j] = c[j];
        }
    }
    for (int i = 0; i < BYTE_COUNT; i++) c[i] = t1[i];
    biguintAssignIfTrue(c, one, bIsZero == 1.0);
}

void biguintSqrt(inout float a[BYTE_COUNT], inout float b[BYTE_COUNT]) {
    float low[BYTE_COUNT], high[BYTE_COUNT], mid[BYTE_COUNT], t1[BYTE_COUNT], one[BYTE_COUNT];
    for (int i = 0; i < BYTE_COUNT; i++) high[i] = a[i];
    biguintRshift(high, mid, 1.0);
    one[0] = 1.0;
    biguintAdd(mid, one, mid);
    for (int i = 0; i < 8 * BYTE_COUNT; i++) {
        if (biguintLessThanOrEqual(high, low)) break;
        biguintMul(mid, mid, t1);
        bool isGreaterThan = biguintGreaterThan(t1, a);
        for (int j = 0; j < BYTE_COUNT; j++) t1[j] = mid[j];
        biguintSub(t1, one, t1);
        biguintAssignIfTrue(high, t1, isGreaterThan);
		biguintAssignIfTrue(low, mid, !isGreaterThan);
		biguintSub(high, low, mid);
        biguintRshiftByOne(mid);
        biguintAdd(low, mid, mid);
        biguintAdd(mid, one, mid);
    }
    for (int i = 0; i < BYTE_COUNT; i++) b[i] = low[i];
}

void main(void) {
    vec4 data1 = texture2D(Data1, gl_FragCoord.xy / Width);
    vec4 data2 = texture2D(Data2, gl_FragCoord.xy / Width);

    float bn1[BYTE_COUNT], bn2[BYTE_COUNT], bn3[BYTE_COUNT];
    bn1[0] = data1.r * 255.0;
    bn1[1] = data1.g * 255.0;
    bn1[2] = data1.b * 255.0;
    bn1[3] = data1.a * 255.0;
    bn2[0] = data2.r * 255.0;
    bn2[1] = data2.g * 255.0;
    bn2[2] = data2.b * 255.0;
    bn2[3] = data2.a * 255.0;

    biguintMul(bn1, bn2, bn3);
    
    gl_FragColor = vec4(bn3[0], bn3[1], bn3[2], bn3[3]) / 255.0;
}

