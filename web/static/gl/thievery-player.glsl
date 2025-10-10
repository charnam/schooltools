
precision mediump float;

uniform vec2 u_resolution;
uniform float u_time;

vec4 getLines(vec2 pos) {
    vec4 color = vec4(
        0.4,
        0.5,
        0.9,
        1.0
    );
    
    vec4 lines_color = vec4(
        0.3,
        0.2,
        0.7,
        1.0
    );
    
    color = mix(
        color,
        lines_color,
        (sin(u_time + distance(pos.y, 0.0) * 10.0) + 1.0) / 2.0
    );
    
    return color;
}
vec4 applyWaves(vec2 pos) {
    float speed = 0.2;
    float frequency = 10.0;
    float amplitude = 0.2;
    return getLines(vec2(
        pos.x,
        pos.y -
            (sin(pos.x * frequency - u_time * speed) + 1.0) * amplitude * distance(pos.y, 0.0)
    ));
}

void main() {
    vec2 floatPos = vec2(gl_FragCoord.x, gl_FragCoord.y) / u_resolution;
    gl_FragColor = applyWaves(floatPos);
}