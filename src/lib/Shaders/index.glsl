// Interactive 3D Cursor Lens Fragment Shader
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

  // Aspect-ratio corrected distance to mouse to maintain a perfect circle
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