import * as THREE from "three";

export const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const fragmentShader = /* glsl */ `
  uniform sampler2D uTexture;
  uniform vec2 uMouse;
  uniform float uHover;
  uniform float uRadius;
  uniform float uSmoothness;
  uniform float uAspect;
  uniform vec2 uCoverScale;
  uniform float uTime;
  uniform float uDistortion;
  uniform float uAberration;

  varying vec2 vUv;

  void main() {
    vec2 uv = vUv;

    // Correct distance for viewport aspect ratio to keep circular shape
    vec2 aspectUV = vec2((uv.x - 0.5) * uAspect + 0.5, uv.y);
    vec2 aspectMouse = vec2((uMouse.x - 0.5) * uAspect + 0.5, uMouse.y);
    float dist = distance(aspectUV, aspectMouse);

    // Smooth circular lens reveal mask
    float mask = smoothstep(uRadius, uRadius - uSmoothness, dist) * uHover;

    if (mask <= 0.0005) {
      discard;
    }

    // Compute UV offset for object-fit: cover mapping
    vec2 coverUv = (uv - 0.5) * uCoverScale + 0.5;

    // Optical magnification / refraction distortion inside lens
    vec2 dir = normalize(uv - uMouse + vec2(0.00001));
    float factor = smoothstep(uRadius, 0.0, dist);
    vec2 distortedUv = coverUv - dir * (factor * uDistortion);

    // Chromatic Aberration (RGB shift) around the edge of the lens
    float edgeFactor = sin(factor * 3.14159265);
    vec2 rgbOffset = dir * (edgeFactor * uAberration);

    float r = texture2D(uTexture, distortedUv + rgbOffset).r;
    float g = texture2D(uTexture, distortedUv).g;
    float b = texture2D(uTexture, distortedUv - rgbOffset).b;

    vec3 color = vec3(r, g, b);

    gl_FragColor = vec4(color, mask);
  }
`;

export const LensShaderMaterial = {
  uniforms: {
    uTexture: { value: null },
    uMouse: { value: new THREE.Vector2(0.5, 0.5) },
    uHover: { value: 0 },
    uRadius: { value: 0.18 },
    uSmoothness: { value: 0.08 },
    uAspect: { value: 1 },
    uCoverScale: { value: new THREE.Vector2(1, 1) },
    uTime: { value: 0 },
    uDistortion: { value: 0.04 },
    uAberration: { value: 0.015 },
  },
  vertexShader,
  fragmentShader,
};
