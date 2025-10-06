
precision mediump float;

uniform vec2 u_resolution;
uniform float u_time;

vec4 useCoords(vec2 pos) {
    vec2 uv = pos.xy / u_resolution.xy;
    vec2 center = u_resolution.xy / 2.0;
    vec2 centered = pos.xy - center;

    float yx = mix(centered.x, centered.y, sin(u_time)/2.0+0.5);
    float xy = mix(centered.y, centered.x, cos(u_time)/2.0+0.5);

    float distanceToEdge = min(
        min(
            min(
                distance(uv.x, 0.0) * 2.0,
                distance(uv.y, 0.0) * 2.0
            ),
            min(
                distance(uv.x, 1.0) * 2.0,
                distance(uv.y, 1.0) * 2.0
            )
        ),
        1.0
    );


    float col = (sin(
            0.0-u_time * 1.0 +
            (log(distance(center, pos)*0.1)) * 8.0 +
            (yx * xy / 99999.0)
        ) * 0.5 + 0.5) * 0.5;

    vec3 color = vec3(
        col,
        col,
        col);

    color = color + (vec3(
        0.8,
        0.8,
        0.8
    ) * distanceToEdge);

    color = mix(vec3(1.0), color, distanceToEdge);
    
    color = vec3(
        0.6,
        0.8,
        1.0
    ) * color;


    return vec4(color, 1.0);
}


vec4 useCoords9(vec4 pos) {
    float speed = 100.0;
    float frequency = .02;
    float amplitude = 100.;
    vec2 center = u_resolution.xy / 2.0;
    float amp = distance(center, pos.xy) / min(u_resolution.x, u_resolution.y);
    return useCoords(vec2(
        pos.x +
            (sin(((u_time*speed)+pos.x)*frequency)*amplitude) * amp,
        pos.y +
            (cos(((u_time*speed)+pos.y)*frequency)*amplitude) * amp)
    );
}

void main() {
    gl_FragColor = useCoords9(gl_FragCoord);
}