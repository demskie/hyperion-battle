#ifdef GL_ES
precision highp float;
precision highp int;
precision highp sampler2D;
#endif

uniform sampler2D Data1;
uniform sampler2D Data2;
uniform float Width;

const int arraysize = 16;

bool bignumEquals(inout float a[arraysize], inout float b[arraysize]) {
    float cmp;
    for (int i = arraysize - 1; i >= 0; i--) {
        cmp += float(cmp == 0.0) * float(a[i] > b[i]);
        cmp -= float(cmp == 0.0) * float(a[i] < b[i]);
    }
    return cmp == 0.0;
}

bool bignumEquals(inout float a[arraysize], float f) {
    float b[arraysize];
    b[0] = mod(f, 256.0);
    b[1] = floor(f / 256.0);
    return bignumEquals(a, b);
}

bool bignumLessThan(inout float a[arraysize], inout float b[arraysize]) {
    float cmp;
    for (int i = arraysize - 1; i >= 0; i--) {
        cmp += float(cmp == 0.0) * float(a[i] > b[i]);
        cmp -= float(cmp == 0.0) * float(a[i] < b[i]);
    }
    return cmp < 0.0;
}

bool bignumLessThan(inout float a[arraysize], float f) {
    float b[arraysize];
    b[0] = mod(f, 256.0);
    b[1] = floor(f / 256.0);
    return bignumLessThan(a, b);
}

bool bignumLessThanOrEqual(inout float a[arraysize], inout float b[arraysize]) {
    float cmp;
    for (int i = arraysize - 1; i >= 0; i--) {
        cmp += float(cmp == 0.0) * float(a[i] > b[i]);
        cmp -= float(cmp == 0.0) * float(a[i] < b[i]);
    }
    return cmp <= 0.0;
}

bool bignumLessThanOrEqual(inout float a[arraysize], float f) {
    float b[arraysize];
    b[0] = mod(f, 256.0);
    b[1] = floor(f / 256.0);
    return bignumLessThanOrEqual(a, b);
}

bool bignumGreaterThan(inout float a[arraysize], inout float b[arraysize]) {
    float cmp;
    for (int i = arraysize - 1; i >= 0; i--) {
        cmp += float(cmp == 0.0) * float(a[i] > b[i]);
        cmp -= float(cmp == 0.0) * float(a[i] < b[i]);
    }
    return cmp > 0.0;
}

bool bignumGreaterThan(inout float a[arraysize], float f) {
    float b[arraysize];
    b[0] = mod(f, 256.0);
    b[1] = floor(f / 256.0);
    return bignumGreaterThan(a, b);
}

bool bignumGreaterThanOrEqual(inout float a[arraysize], inout float b[arraysize]) {
    float cmp;
    for (int i = arraysize - 1; i >= 0; i--) {
        cmp += float(cmp == 0.0) * float(a[i] > b[i]);
        cmp -= float(cmp == 0.0) * float(a[i] < b[i]);
    }
    return cmp >= 0.0;
}

bool bignumGreaterThanOrEqual(inout float a[arraysize], float f) {
    float b[arraysize];
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

void bignumAssignIfTrue(inout float [arraysize], inout float [arraysize], bool);
void bignumAdd(inout float [arraysize], inout float [arraysize], inout float [arraysize]);
void bignumSub(inout float [arraysize], inout float [arraysize], inout float [arraysize]);
void bignumMul(inout float [arraysize], inout float [arraysize], inout float [arraysize]);
void bignumPow(inout float [arraysize], inout float [arraysize], inout float [arraysize]);
void bignumDiv(inout float [arraysize], inout float [arraysize], inout float [arraysize]);
void bignumMod(inout float [arraysize], inout float [arraysize], inout float [arraysize]);
void bignumSqrt(inout float [arraysize], inout float [arraysize]);
void bignumLshift(inout float [arraysize], inout float [arraysize], float);
void bignumLshiftByOne(inout float [arraysize]);
void bignumRshift(inout float [arraysize], inout float [arraysize], float);
void bignumRshiftByOne(inout float [arraysize]);
void bignumAnd(inout float [arraysize], inout float [arraysize], inout float [arraysize]);
void bignumOr(inout float [arraysize], inout float [arraysize], inout float [arraysize]);
void bignumXor(inout float [arraysize], inout float [arraysize], inout float [arraysize]);
bool bignumEquals(inout float [arraysize], inout float [arraysize]);
bool bignumLessThan(inout float [arraysize], inout float [arraysize]);
bool bignumGreaterThan(inout float [arraysize], inout float [arraysize]);
bool bignumLessThanOrEqual(inout float [arraysize], inout float [arraysize]);
bool bignumGreaterThanOrEqual(inout float [arraysize], inout float [arraysize]);

#define BIGNUMASSIGNIFTRUE
void bignumAssignIfTrue(inout float dst[arraysize], inout float src[arraysize], bool b) {
    for (int i = 0; i < arraysize; i++) {
        dst[i] = float(b) * src[i] + float(!b) * dst[i];
    }
}

#define BIGNUMADD
void bignumAdd(inout float a[arraysize], inout float b[arraysize], inout float c[arraysize]) {
    float carry, tmp;
    for (int i = 0; i < arraysize; i++) {
        tmp = a[i] + b[i] + carry;
        carry = float(tmp > 255.0);
        c[i] = mod(tmp, 256.0);
    }
}

#define BIGNUMADDFLOAT
void bignumAdd(inout float a[arraysize], float f, inout float c[arraysize]) {
    float b[arraysize];
    b[0] = mod(f, 256.0);
    b[1] = floor(f / 256.0);
    bignumAdd(a, b, c);
}

#define BIGNUMSUB
void bignumSub(inout float a[arraysize], inout float b[arraysize], inout float c[arraysize]) {
    float borrow, tmp;
    for (int i = 0; i < arraysize; i++) {
        tmp = a[i] - b[i] - borrow;
        borrow = float(tmp < 0.0);
        c[i] = mod(tmp, 256.0); 
    }
}

#define BIGNUMSUBFLOAT
void bignumSub(inout float a[arraysize], float f, inout float c[arraysize]) {
    float b[arraysize];
    b[0] = mod(f, 256.0);
    b[1] = floor(f / 256.0);
    bignumSub(a, b, c);
}

#define BIGNUMMUL
void bignumMul(inout float a[arraysize], inout float b[arraysize], inout float c[arraysize]) {
    float aStop, bStop;
    for (int i = arraysize - 1; i > 0; i--) {
        aStop += float(aStop == 0.0) * float(a[i] > 0.0) * float(i);
        bStop += float(bStop == 0.0) * float(b[i] > 0.0) * float(i);
    }
    float t1[arraysize];
    for (int i = 0; i < arraysize; i++) t1[i] = a[i];
    bignumAssignIfTrue(a, b, aStop < bStop);
    bignumAssignIfTrue(b, t1, aStop < bStop);
    float nonEmptyBytes, powerOfTwoBit;
    for (int i = 0; i < arraysize; i++) {
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
        for (int i = 0; i < arraysize; i++) {
            float v = a[i] * b[0] + carry;
            carry = v / 256.0;
            c[i] = mod(v, 256.0);
        }
    } else if (nonEmptyBytes == 1.0 && powerOfTwoBit > 0.0) {
        bignumLshift(a, c, powerOfTwoBit);
    } else {
        float product, carry;
        float t2[arraysize*2];
        for (int i = 0; i < arraysize; i++) {
            for (int j = 0; j < arraysize; j++) {
                product = a[i] * b[j] + t2[i+j];
                carry = product / 256.0;
                t2[i+j] = product - carry * 256.0;
                t2[i+j+1] += carry;
            }
        }
        for (int i = 0; i < arraysize; i++) c[i] = t2[i];
    }
}

#define BIGNUMMULFLOAT
void bignumMul(inout float a[arraysize], float f, inout float c[arraysize]) {
    float b[arraysize];
    b[0] = mod(f, 256.0);
    b[1] = floor(f / 256.0);
    bignumMul(a, b, c);
}

#define BIGNUMDIV
void bignumDiv(inout float a[arraysize], inout float b[arraysize], inout float c[arraysize]) {
    float stop;
    for (int i = arraysize - 1; i > 0; i--) {
        stop += float(i == 0) * float(b[i] > 0.0);
    }
    float nonEmptyBytes, powerOfTwoBit;
    for (int i = 0; i < arraysize; i++) {
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
        for (int i = arraysize - 1; i >= 0; i--) {
            float ent = a[i] + rem * 256.0;
            rem = mod(ent, b[0]);
            c[i] = floor(ent / b[0]);
        }
    } else if (nonEmptyBytes == 1.0 && powerOfTwoBit > 0.0) {
        bignumRshift(a, c, powerOfTwoBit);
    } else {
        for (int i = 0; i < arraysize; i++) c[i] = 0.0;
        float current[arraysize], denom[arraysize], t1[arraysize], t2[arraysize], t3[arraysize];
        current[0] = 1.0;
        for (int i = 0; i < arraysize; i++) denom[i] = b[i];
        for (int i = 0; i < arraysize; i++) t1[i] = a[i];
        bool hasOverflowed;
        for (int i = 0; i < 8*arraysize; i++) {
            if (bignumGreaterThan(denom, a)) break;
            if (denom[arraysize-1] >= 128.0) {
                hasOverflowed = true;
                break;
            }
            bignumLshiftByOne(current);
            bignumLshiftByOne(denom);
        }
        for (int i = 0; i < arraysize; i++) t2[i] = current[i];
        for (int i = 0; i < arraysize; i++) t3[i] = denom[i];
        bignumRshiftByOne(current);
        bignumRshiftByOne(denom);
        bignumAssignIfTrue(current, t2, hasOverflowed == false);
        bignumAssignIfTrue(denom, t3, hasOverflowed == false);
        for (int i = 0; i < 8*arraysize; i++) {
            float currentIsZero = 1.0;
            for (int j = 0; j < arraysize; j++) currentIsZero -= currentIsZero * float(current[j] > 0.0);
            if (currentIsZero == 1.0) break;
            bool shouldModify = bignumGreaterThanOrEqual(t1, denom);
            for (int j = 0; j < arraysize; j++) t2[i] = t1[i];
            for (int j = 0; j < arraysize; j++) t3[i] = c[i];
            bignumSub(t2, denom, t2);
            bignumOr(t3, current, t3);
            bignumAssignIfTrue(t1, t2, shouldModify);
            bignumAssignIfTrue(c, t3, shouldModify);
            bignumRshiftByOne(current);
            bignumRshiftByOne(denom);
        }
    }
}

#define BIGNUMDIVFLOAT
void bignumDiv(inout float a[arraysize], float f, inout float c[arraysize]) {
    float b[arraysize];
    b[0] = mod(f, 256.0);
    b[1] = floor(f / 256.0);
    bignumDiv(a, b, c);
}

#define BIGNUMLSHIFT
void bignumLshift(inout float a[arraysize], inout float b[arraysize], float count) {
    count = clamp(floor(count), 0.0, float(arraysize*8));
    float byteCount = floor(count / 8.0);
    for (int i = 0; i < arraysize; i++) b[i] = a[i];
    for (int i = 0; i < arraysize; i++) {
        for (int j = arraysize - 1; j > 0; j--) {
            b[j] = float(byteCount > 0.0) * b[j-1] 
                 + float(byteCount <= 0.0) * b[j];
        }
        b[0] = float(byteCount <= 0.0) * b[0];
        byteCount -= 1.0;
    }
    count = mod(count, 8.0);
    bool bits[arraysize*8];
    for (int i = 0; i < arraysize; i++) {
        float x = 128.0, v = b[arraysize-1-i];
        for (int j = 0; j < 8; j++) {
            bits[i*8+j] = v >= x;
            v -= x * float(v >= x);
            x = floor(x / 2.0);
        }
    }
    for (int i = 0; i < 8; i++) {
        for (int j = 0; j < arraysize*8 - 1; j++) bits[j] = bits[j+1];
        bits[arraysize*8-1] = false;
        for (int j = 0; j < arraysize; j++) {
            float v = float(bits[j*8+0]) * 128.0
                    + float(bits[j*8+1]) * 64.0
                    + float(bits[j*8+2]) * 32.0
                    + float(bits[j*8+3]) * 16.0
                    + float(bits[j*8+4]) * 8.0
                    + float(bits[j*8+5]) * 4.0
                    + float(bits[j*8+6]) * 2.0
                    + float(bits[j*8+7]) * 1.0;
            b[arraysize-1-j] = float(float(i) < count) * v
                             + float(float(i) >= count) * b[arraysize-1-j];
        }
    }
}

#define BIGNUMLSHIFTFLOAT
void bignumLshift(inout float a[arraysize], inout float b[arraysize], inout float c[arraysize]) {
    float cf = c[0] + c[1] * 256.0;
    bignumLshift(a, b, cf);
}

#define BIGNUMLSHIFTBYONE
void bignumLshiftByOne(inout float a[arraysize]) {
    bool bits[arraysize*8];
    for (int i = 0; i < arraysize; i++) {
        float x = 128.0, v = a[arraysize-1-i];
        for (int j = 0; j < 8; j++) {
            bits[i*8+j] = v >= x;
            v -= x * float(v >= x);
            x = floor(x / 2.0);
        }
    }
    for (int i = 0; i < arraysize*8 - 1; i++) bits[i] = bits[i+1];
    bits[arraysize*8-1] = false;
    for (int i = 0; i < arraysize; i++) {
        a[arraysize-1-i] = float(bits[i*8+0]) * 128.0
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
void bignumRshift(inout float a[arraysize], inout float b[arraysize], float count) {
    count = clamp(floor(count), 0.0, float(arraysize*8));
    float byteCount = floor(count / 8.0);
    for (int i = 0; i < arraysize; i++) b[i] = a[i];
    for (int i = 0; i < arraysize; i++) {
        for (int j = 0; j < arraysize-1; j++) {
            b[j] = float(byteCount > 0.0) * b[j+1] 
                 + float(byteCount <= 0.0) * b[j];
        }
        b[arraysize-1] = float(byteCount <= 0.0) * b[arraysize-1];
        byteCount -= 1.0;
    }
    count = mod(count, 8.0);
    bool bits[arraysize*8];
    for (int i = 0; i < arraysize; i++) {
        float x = 128.0, v = b[arraysize-1-i];
        for (int j = 0; j < 8; j++) {
            bits[i*8+j] = v >= x;
            v -= x * float(v >= x);
            x = floor(x / 2.0);
        }
    }
    for (int i = 0; i < 8; i++) {
        for (int j = arraysize*8 - 1; j > 0; j--) bits[j] = bits[j-1];
        bits[0] = false;
        for (int j = 0; j < arraysize; j++) {
            float v = float(bits[j*8+0]) * 128.0
                    + float(bits[j*8+1]) * 64.0
                    + float(bits[j*8+2]) * 32.0
                    + float(bits[j*8+3]) * 16.0
                    + float(bits[j*8+4]) * 8.0
                    + float(bits[j*8+5]) * 4.0
                    + float(bits[j*8+6]) * 2.0
                    + float(bits[j*8+7]) * 1.0;
            b[arraysize-1-j] = float(float(i) < count) * v
                             + float(float(i) >= count) * b[arraysize-1-j];
        }
    }
}

#define BIGNUMRSHIFTFLOAT
void bignumRshift(inout float a[arraysize], inout float b[arraysize], inout float c[arraysize]) {
    float cf = c[0] + c[1] * 256.0;
    bignumRshift(a, b, cf);
}

#define BIGNUMRSHIFTBYONE
void bignumRshiftByOne(inout float a[arraysize]) {
    bool bits[arraysize*8];
    for (int i = 0; i < arraysize; i++) {
        float x = 128.0, v = a[arraysize-1-i];
        for (int j = 0; j < 8; j++) {
            bits[i*8+j] = v >= x;
            v -= x * float(v >= x);
            x = floor(x / 2.0);
        }
    }
    for (int i = arraysize*8 - 1; i > 0; i--) bits[i] = bits[i-1];
    bits[0] = false;
    for (int i = 0; i < arraysize; i++) {
        a[arraysize-1-i] = float(bits[i*8+0]) * 128.0
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
    void bignumDiv(inout float [arraysize], inout float [arraysize], inout float [arraysize]);
#endif

#ifndef BIGNUMMUL
    #define BIGNUMMUL
    void bignumMul(inout float [arraysize], inout float [arraysize], inout float [arraysize]);
#endif

#ifndef BIGNUMSUB
    #define BIGNUMSUB
    void bignumSub(inout float [arraysize], inout float [arraysize], inout float [arraysize]);
#endif

#define BIGNUMMOD
void bignumMod(inout float ia[arraysize], inout float ib[arraysize], inout float oc[arraysize]) {
	float tc[arraysize];
	bignumDiv(ia, ib, oc);
    bignumMul(oc, ib, tc);
    bignumSub(ia, tc, oc);
}

#define BIGNUMMODFLOAT
void bignumMod(inout float a[arraysize], float f, inout float c[arraysize]) {
    float b[arraysize];
    b[0] = mod(f, 256.0);
    b[1] = floor(f / 256.0);
    bignumMod(a, b, c);
}

void bignumAnd(inout float a[arraysize], inout float b[arraysize], inout float c[arraysize]) {
    for (int i = 0; i < arraysize; i++) {
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

void bignumOr(inout float a[arraysize], inout float b[arraysize], inout float c[arraysize]) {
    for (int i = 0; i < arraysize; i++) {
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

void bignumXor(inout float a[arraysize], inout float b[arraysize], inout float c[arraysize]) {
    for (int i = 0; i < arraysize; i++) {
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

void bignumPow(inout float a[arraysize], inout float b[arraysize], inout float c[arraysize]) {
    float t1[arraysize], t2[arraysize], one[arraysize];
    for (int i = 0; i < arraysize; i++) t1[i] = a[i];
    for (int i = 0; i < arraysize; i++) t2[i] = b[i];
    one[0] = 1.0;
    bignumSub(t2, one, t2);
    float bIsZero = 1.0;
    for (int i = 0; i < arraysize; i++) bIsZero -= bIsZero * float(b[i] > 0.0);
    if (bIsZero == 0.0) {
        for (int i = 0; i < 8 * arraysize; i++) {
            float t2IsZero = 1.0;
            for (int j = 0; j < arraysize; j++) t2IsZero -= t2IsZero * float(t2[j] > 0.0);
            if (t2IsZero == 1.0) break;
            bignumMul(t1, a, c);
            bignumSub(t2, one, t2);
            for (int j = 0; j < arraysize; j++) t1[j] = c[j];
        }
    }
    for (int i = 0; i < arraysize; i++) c[i] = t1[i];
    bignumAssignIfTrue(c, one, bIsZero == 1.0);
}

void bignumSqrt(inout float a[arraysize], inout float b[arraysize]) {
    float low[arraysize], high[arraysize], mid[arraysize], t1[arraysize], one[arraysize];
    for (int i = 0; i < arraysize; i++) high[i] = a[i];
    bignumRshift(high, mid, 1.0);
    one[0] = 1.0;
    bignumAdd(mid, one, mid);
    for (int i = 0; i < 8 * arraysize; i++) {
        if (bignumLessThanOrEqual(high, low)) break;
        bignumMul(mid, mid, t1);
        bool isGreaterThan = bignumGreaterThan(t1, a);
        for (int j = 0; j < arraysize; j++) t1[j] = mid[j];
        bignumSub(t1, one, t1);
        bignumAssignIfTrue(high, t1, isGreaterThan);
		bignumAssignIfTrue(low, mid, !isGreaterThan);
		bignumSub(high, low, mid);
        bignumRshiftByOne(mid);
        bignumAdd(low, mid, mid);
        bignumAdd(mid, one, mid);
    }
    for (int i = 0; i < arraysize; i++) b[i] = low[i];
}

void main(void) {
    vec4 data1 = texture2D(Data1, gl_FragCoord.xy / Width);
    vec4 data2 = texture2D(Data2, gl_FragCoord.xy / Width);

    float bn1[arraysize], bn2[arraysize], bn3[arraysize];
    bn1[0] = data1.r * 255.0;
    bn1[1] = data1.g * 255.0;
    bn1[2] = data1.b * 255.0;
    bn1[3] = data1.a * 255.0;
    bn2[0] = data2.r * 255.0;
    bn2[1] = data2.g * 255.0;
    bn2[2] = data2.b * 255.0;
    bn2[3] = data2.a * 255.0;

    bignumMul(bn1, bn2, bn3);
    
    gl_FragColor = vec4(bn3[0], bn3[1], bn3[2], bn3[3]) / 255.0;
}

