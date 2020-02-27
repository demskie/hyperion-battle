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

	// determine if we're outputting to one of the left side texels
	float outputToOddBool = floatEquals(mod(floor(indices.x), 2.0), 1.0);

	// calculate coordinates
	vec2 oddFragCoord = vec2(indices.x - floatEquals(outputToOddBool, 0.0), indices.y);
	vec2 evenFragCoord = vec2(oddFragCoord.x + 1.0, oddFragCoord.y);

	// constrain for (literal) edge case
	oddFragCoord.x = clamp(oddFragCoord.x, 0.5, u_width - 0.5);
	evenFragCoord.x = clamp(evenFragCoord.x, 0.5, u_width - 0.5);

	// get texels
	vec4 oddTexel = texture2D(u_locations, oddFragCoord.xy / u_width);
	vec4 evenTexel = texture2D(u_locations, evenFragCoord.xy / u_width);
	
	// unpack pixel position data
	float oddX = vec2ToInt16(oddTexel.rg);
	float evenX = vec2ToInt16(evenTexel.rg);
	
	// start creating coordinates for source texel
	vec2 sourceFragCoord = vec2(indices.xy);

	// add to coordinates if (even_position_comes_before && we_are_odd)
	sourceFragCoord.x += floatLessThan(evenX, oddX) * outputToOddBool;

	// subtract to coordinates if (even_position_comes_before && we_are_even)
	sourceFragCoord.x -= floatLessThan(evenX, oddX) * floatEquals(outputToOddBool, 0.0);
	
	// return the source (indices) texel
	gl_FragColor = texture2D(u_indices, sourceFragCoord.xy / u_width);
}
