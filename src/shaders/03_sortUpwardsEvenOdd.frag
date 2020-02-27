precision highp float;
precision highp int;
precision highp sampler2D;

uniform float u_width;
uniform sampler2D u_indices;
uniform sampler2D u_locations;

float round(float);
float floatEquals(float, float);
float floatNotEquals(float, float);
float floatLessThan(float, float);
float floatGreaterThan(float, float);
float floatLessThanOrEqual(float, float);
float floatGreaterThanOrEqual(float, float);
float vec2ToInt16(vec2);
vec2 int16ToVec2(float);

void main() {
    // get fighter indices
    vec4 indicesTexel = texture2D(u_indices, gl_FragCoord.xy / u_width);
    vec2 indices = vec2(vec2ToInt16(indicesTexel.rg), vec2ToInt16(indicesTexel.ba));

	// determine if we're outputting to one of the top side texels
	float outputToEvenBool = floatEquals(mod(floor(indices.y), 2.0), 0.0); 

	// calculate coordinates
	vec2 evenFragCoord = vec2(indices.x, indices.y - floatEquals(outputToEvenBool, 0.0));
	vec2 oddFragCoord = vec2(evenFragCoord.x, evenFragCoord.y + 1.0);

	// get texels
	vec4 evenTexel = texture2D(u_locations, evenFragCoord.xy / u_width);
	vec4 oddTexel = texture2D(u_locations, oddFragCoord.xy / u_width);

	// unpack pixel position data
	float evenY = vec2ToInt16(evenTexel.ba);
	float oddY = vec2ToInt16(oddTexel.ba);

	// start creating coordinates for source texel
	vec2 sourceFragCoord = vec2(indices.xy);

	// add to coordinates if (odd_position_comes_before && we_are_even)
	sourceFragCoord.y += floatLessThan(oddY, evenY) * outputToEvenBool;

	// subtract to coordinates if (odd_position_comes_before && we_are_odd)
	sourceFragCoord.y -= floatLessThan(oddY, evenY) * floatEquals(outputToEvenBool, 0.0);
	
	// return the source (indices) texel
	gl_FragColor = texture2D(u_indices, sourceFragCoord.xy / u_width);
}
