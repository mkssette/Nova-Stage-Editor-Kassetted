#pragma header

// Uniforms provided by the OpenFL/Flixel framework
// These are declared by #pragma header, so we don't need to redeclare them.
uniform sampler2D bitmap;
uniform float thickness; // thickness is not a standard uniform, we will keep this.
uniform vec2 openfl_TextureCoordv;
uniform vec2 openfl_TextureSize;

void main()
{
    // Use the provided variable names
    vec2 uv = openfl_TextureCoordv;
    vec2 texSize = openfl_TextureSize;

    // Get the current pixel's color from the texture
    vec4 current = flixel_texture2D(bitmap, uv);

    // If the current pixel is part of the object, render it and exit
    if (current.a > 0.0)
    {
        gl_FragColor = current;
        return;
    }

    // If the pixel is transparent, check its neighbors for an outline
    float alpha = 0.0;
    // The loop iterates in a 3x3 grid around the current pixel
    for (float x = -1.0; x <= 1.0; x++)
    {
        for (float y = -1.0; y <= 1.0; y++)
        {
            // Calculate the offset using the thickness uniform
            vec2 offset = vec2(x, y) * thickness / texSize;
            
            // Sample the alpha of the neighboring pixel
            vec4 sample = flixel_texture2D(bitmap, uv + offset);
            
            // Keep track of the highest alpha found in the neighborhood
            alpha = max(alpha, sample.a);
        }
    }

    // If any neighbor had an alpha greater than 0, draw a white outline
    if (alpha > 0.0)
        gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
    else
        // Otherwise, render a fully transparent pixel
        gl_FragColor = vec4(0.0);
}
