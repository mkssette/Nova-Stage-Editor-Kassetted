// Automatically converted with https://github.com/TheLeerName/ShadertoyToFlixel

#pragma header

#define iResolution vec3(openfl_TextureSize, 0.)
uniform float iTime;
#define iChannel0 bitmap
#define texture flixel_texture2D

// end of ShadertoyToFlixel header

// Controls the opacity of the drawn line segment (e.g., 0.5)
float u_outlineAlpha = 0.5; 

// NEW: Controls the thickness of the outline in screen-space pixels (e.g., 4.0 for 4px)
float u_thickness = 5.0; 
    
void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
	vec2 uv = fragCoord.xy / iResolution.xy;
    
    // --- Uniforms (Standard Shadertoy/GLSL inputs) ---
    
    // Define colors
    vec3 outlineColor = vec3(0.0, 1.0, 1.0); // Bright Cyan line
    vec3 gapColor = vec3(0.0, 0.0, 0.0);    // Black gap

    // rect boundaries (reverted to full screen as requested)
    vec2 rectMin = vec2(0.0, 0.0); 
    vec2 rectMax = vec2(1.0, 1.0);
    
    vec2 center = (rectMin + rectMax) / 2.0;
    vec2 halfSize = center - rectMin;
    vec2 fw = fwidth(uv);
    
    vec2 dist = abs(uv - center);
    
    // 1. Sample the background texture (this is the base color for non-outline pixels)
    vec4 textureColor = texture(iChannel0, uv);
    vec3 finalColor = textureColor.rgb;
    
    // Check if the pixel is within the custom thickness band.
    // We multiply fwidth (1 screen pixel size) by u_thickness.
    bool isOutline = all(lessThan(dist, halfSize)) && any(greaterThan(dist, halfSize - fw * u_thickness));

    if (isOutline) {
        // Calculate screen-space pixel coordinate for consistent dashing
        vec2 pixel = uv / fw; 
        float aspect = halfSize.y / halfSize.x;
        
        // Determine the direction along the edge for uniform motion
        float dir = (dist.x * aspect > dist.y) ?
             -sign(uv.x - center.x) : sign(uv.y - center.y);
        
        // Calculate the dash pattern (0.0=Line, 1.0=Gap)
        // Reduced the divisor from 20.0 to 10.0 for shorter/faster dashes, matching original request.
        float dash = step(0.5, fract((pixel.x + pixel.y) * dir / 10.0 + iTime));
        
        // A. Calculate the color of the dashed segment (Cyan or Black)
        vec3 outlineDashedColor = mix(outlineColor, gapColor, dash);
        
        // B. Calculate the opacity/mix factor:
        //    - If dash=0.0 (Line segment), the factor is u_outlineAlpha.
        //    - If dash=1.0 (Gap segment), the factor is 0.0 (fully transparent).
        float alphaFactor = mix(u_outlineAlpha, 0.0, dash);
        
        // C. Blend the calculated outline color (fore) over the background (base)
        finalColor = mix(finalColor, outlineDashedColor, alphaFactor);
    }
    
    // Output the final blended color. We use the original texture's alpha channel
    // for the final output alpha so that the whole composition respects transparency.
	fragColor = vec4(finalColor, texture(iChannel0, fragCoord / iResolution.xy).a);
}

void main() {
	mainImage(gl_FragColor, openfl_TextureCoordv*openfl_TextureSize);
}