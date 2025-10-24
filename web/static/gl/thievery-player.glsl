
precision mediump float;

uniform vec2 u_resolution;
uniform float u_time;

// https://gist.github.com/mairod/a75e7b44f68110e1576d77419d608786?permalink_comment_id=3195243#gistcomment-3195243
vec3 hueShift(vec3 color, float hue) {
    const vec3 k = vec3(0.57735, 0.57735, 0.57735);
    float cosAngle = cos(hue);
    return vec3(color * cosAngle + cross(k, color) * sin(hue) + k * dot(k, color) * (1.0 - cosAngle));
}

vec4 getLines(vec2 pos) {
    vec3 color = vec3(
        0.4,
        0.5,
        0.9
    );
    
    vec3 lines_color = vec3(
        0.3,
        0.2,
        0.7
    );
    
    color = mix(
        color,
        lines_color,
        (sin(u_time + distance(pos.y, 0.0) * 10.0) + 1.0) / 2.0
    );
    
    color = hueShift(color, sin(u_time / 10.0) / 2.0);
    
    return vec4(color, 1.0);
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