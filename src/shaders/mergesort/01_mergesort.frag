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

float lshiftByte(float i, float m) {
    return floor(i * pow(2.0, m));
}

float rshiftByte(float i, float m) {
    return floor(i / pow(2.0, m));
}

float andByte(float a, float b) {
    float o = 0.0;
    o += 128.0 * min(floatGreaterThanOrEqual(a, 128.0), floatGreaterThanOrEqual(b, 128.0));
    a -= 128.0 * floatGreaterThanOrEqual(a, 128.0);
    b -= 128.0 * floatGreaterThanOrEqual(b, 128.0);
    o += 64.0 * min(floatGreaterThanOrEqual(a, 64.0), floatGreaterThanOrEqual(b, 64.0));
    a -= 64.0 * floatGreaterThanOrEqual(a, 64.0);
    b -= 64.0 * floatGreaterThanOrEqual(b, 64.0);
    o += 32.0 * min(floatGreaterThanOrEqual(a, 32.0), floatGreaterThanOrEqual(b, 32.0));
    a -= 32.0 * floatGreaterThanOrEqual(a, 32.0);
    b -= 32.0 * floatGreaterThanOrEqual(b, 32.0);
    o += 16.0 * min(floatGreaterThanOrEqual(a, 16.0), floatGreaterThanOrEqual(b, 16.0));
    a -= 16.0 * floatGreaterThanOrEqual(a, 16.0);
    b -= 16.0 * floatGreaterThanOrEqual(b, 16.0);
    o += 8.0 * min(floatGreaterThanOrEqual(a, 8.0), floatGreaterThanOrEqual(b, 8.0));
    a -= 8.0 * floatGreaterThanOrEqual(a, 8.0);
    b -= 8.0 * floatGreaterThanOrEqual(b, 8.0);
    o += 4.0 * min(floatGreaterThanOrEqual(a, 4.0), floatGreaterThanOrEqual(b, 4.0));
    a -= 4.0 * floatGreaterThanOrEqual(a, 4.0);
    b -= 4.0 * floatGreaterThanOrEqual(b, 4.0);
    o += 2.0 * min(floatGreaterThanOrEqual(a, 2.0), floatGreaterThanOrEqual(b, 2.0));
    a -= 2.0 * floatGreaterThanOrEqual(a, 2.0);
    b -= 2.0 * floatGreaterThanOrEqual(b, 2.0);
    o += 1.0 * min(floatGreaterThanOrEqual(a, 1.0), floatGreaterThanOrEqual(b, 1.0));
    return o;
}

float orByte(float a, float b) {
    float o = 0.0;
    o += 128.0 * max(floatGreaterThanOrEqual(a, 128.0), floatGreaterThanOrEqual(b, 128.0));
    a -= 128.0 * floatGreaterThanOrEqual(a, 128.0);
    b -= 128.0 * floatGreaterThanOrEqual(b, 128.0);
    o += 64.0 * max(floatGreaterThanOrEqual(a, 64.0), floatGreaterThanOrEqual(b, 64.0));
    a -= 64.0 * floatGreaterThanOrEqual(a, 64.0);
    b -= 64.0 * floatGreaterThanOrEqual(b, 64.0);
    o += 32.0 * max(floatGreaterThanOrEqual(a, 32.0), floatGreaterThanOrEqual(b, 32.0));
    a -= 32.0 * floatGreaterThanOrEqual(a, 32.0);
    b -= 32.0 * floatGreaterThanOrEqual(b, 32.0);
    o += 16.0 * max(floatGreaterThanOrEqual(a, 16.0), floatGreaterThanOrEqual(b, 16.0));
    a -= 16.0 * floatGreaterThanOrEqual(a, 16.0);
    b -= 16.0 * floatGreaterThanOrEqual(b, 16.0);
    o += 8.0 * max(floatGreaterThanOrEqual(a, 8.0), floatGreaterThanOrEqual(b, 8.0));
    a -= 8.0 * floatGreaterThanOrEqual(a, 8.0);
    b -= 8.0 * floatGreaterThanOrEqual(b, 8.0);
    o += 4.0 * max(floatGreaterThanOrEqual(a, 4.0), floatGreaterThanOrEqual(b, 4.0));
    a -= 4.0 * floatGreaterThanOrEqual(a, 4.0);
    b -= 4.0 * floatGreaterThanOrEqual(b, 4.0);
    o += 2.0 * max(floatGreaterThanOrEqual(a, 2.0), floatGreaterThanOrEqual(b, 2.0));
    a -= 2.0 * floatGreaterThanOrEqual(a, 2.0);
    b -= 2.0 * floatGreaterThanOrEqual(b, 2.0);
    o += 1.0 * max(floatGreaterThanOrEqual(a, 1.0), floatGreaterThanOrEqual(b, 1.0));
    return o;
}

float xorByte(float a, float b) {
    float o = 0.0;
    o += 128.0 * floatNotEquals(floatGreaterThanOrEqual(a, 128.0), floatGreaterThanOrEqual(b, 128.0));
    a -= 128.0 * floatGreaterThanOrEqual(a, 128.0);
    b -= 128.0 * floatGreaterThanOrEqual(b, 128.0);
    o += 64.0 * floatNotEquals(floatGreaterThanOrEqual(a, 64.0), floatGreaterThanOrEqual(b, 64.0));
    a -= 64.0 * floatGreaterThanOrEqual(a, 64.0);
    b -= 64.0 * floatGreaterThanOrEqual(b, 64.0);
    o += 32.0 * floatNotEquals(floatGreaterThanOrEqual(a, 32.0), floatGreaterThanOrEqual(b, 32.0));
    a -= 32.0 * floatGreaterThanOrEqual(a, 32.0);
    b -= 32.0 * floatGreaterThanOrEqual(b, 32.0);
    o += 16.0 * floatNotEquals(floatGreaterThanOrEqual(a, 16.0), floatGreaterThanOrEqual(b, 16.0));
    a -= 16.0 * floatGreaterThanOrEqual(a, 16.0);
    b -= 16.0 * floatGreaterThanOrEqual(b, 16.0);
    o += 8.0 * floatNotEquals(floatGreaterThanOrEqual(a, 8.0), floatGreaterThanOrEqual(b, 8.0));
    a -= 8.0 * floatGreaterThanOrEqual(a, 8.0);
    b -= 8.0 * floatGreaterThanOrEqual(b, 8.0);
    o += 4.0 * floatNotEquals(floatGreaterThanOrEqual(a, 4.0), floatGreaterThanOrEqual(b, 4.0));
    a -= 4.0 * floatGreaterThanOrEqual(a, 4.0);
    b -= 4.0 * floatGreaterThanOrEqual(b, 4.0);
    o += 2.0 * floatNotEquals(floatGreaterThanOrEqual(a, 2.0), floatGreaterThanOrEqual(b, 2.0));
    a -= 2.0 * floatGreaterThanOrEqual(a, 2.0);
    b -= 2.0 * floatGreaterThanOrEqual(b, 2.0);
    o += 1.0 * floatNotEquals(floatGreaterThanOrEqual(a, 1.0), floatGreaterThanOrEqual(b, 1.0));
    return o;
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
