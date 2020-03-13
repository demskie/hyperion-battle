#ifdef GL_ES
precision highp float;
precision highp int;
precision highp sampler2D;
#endif

uniform sampler2D u_scanned;
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
texcoord subtractTexcoord(texcoord, float);

void main() {
	// pull current coordinates and remove bit value
	vec4 currentTexel = texture2D(u_scanned, gl_FragCoord.xy / u_width);
	bool currentBitFlag = getMSB(currentTexel.r); 
	currentTexel.r = clearMSB(currentTexel.r);
	vec2 currentValue = vec2(vec2ToUint16(currentTexel.rg), vec2ToUint16(currentTexel.ba));

	// calculate previous coordinates
    texcoord previousFragCoord = texcoord(floor(gl_FragCoord.x), floor(gl_FragCoord.y), u_width);
    previousFragCoord = subtractTexcoord(previousFragCoord, 1.0);

	// pull previous coordinates and remove bit value
	vec4 previousTexel = texture2D(u_scanned, vec2(previousFragCoord.x + 0.5, previousFragCoord.y + 0.5) / u_width);
	previousTexel.r = clearMSB(previousTexel.r);
	vec2 previousValue = vec2(vec2ToUint16(previousTexel.rg), vec2ToUint16(previousTexel.ba));

	// pull last coordinates and remove bit value
	vec4 lastTexel = texture2D(u_scanned, vec2(u_width - 0.5, u_width - 0.5) / u_width);
	lastTexel.r = clearMSB(lastTexel.r);
	vec2 lastValue = vec2(vec2ToUint16(lastTexel.rg), vec2ToUint16(lastTexel.ba));

	// create an empty scatterCoord 
	vec2 scatterCoord = vec2(0.0, 0.0);

	// gather booleans for upcoming branches
	float isLeftSide = float(currentBitFlag);
	float isFirstTexel = floatEquals(floor(gl_FragCoord.x), 0.0) * floatEquals(floor(gl_FragCoord.y), 0.0);

	// branch based on conditional floats
    // TODO: remove branching
	if (isLeftSide == 1.0) {
		if (isFirstTexel == 0.0) {
			scatterCoord.x = previousValue.x;
			scatterCoord.y = previousValue.y;
		}
	} else {
		if (isFirstTexel == 1.0) {
			scatterCoord.x = floor(gl_FragCoord.x);
			scatterCoord.y = floor(gl_FragCoord.y);
			float combinedX = mod(scatterCoord.x + previousValue.x, u_width);
			float combinedY = scatterCoord.y + previousValue.y;
			combinedY += floatGreaterThanOrEqual(scatterCoord.x + previousValue.x, u_width);
			scatterCoord.x = combinedX;
			scatterCoord.y = combinedY;
		} else {
			scatterCoord.x = floor(gl_FragCoord.x);
			scatterCoord.y = floor(gl_FragCoord.y);
			float subtractedX = mod(scatterCoord.x - previousValue.x, u_width);
			float subtractedY = scatterCoord.y - previousValue.y;
			subtractedY -= floatLessThan(scatterCoord.x - previousValue.x, 0.0);
			scatterCoord.x = subtractedX;
			scatterCoord.y = subtractedY;
			float combinedX = mod(scatterCoord.x + lastValue.x, u_width);
			float combinedY = scatterCoord.y + lastValue.y;
			combinedY += floatGreaterThanOrEqual(scatterCoord.x + lastValue.x, u_width);
			scatterCoord.x = combinedX;
			scatterCoord.y = combinedY;
		}
	}

	// output scatter coordinates
	gl_FragColor = vec4(uint16ToVec2(scatterCoord.x), uint16ToVec2(scatterCoord.y));
}