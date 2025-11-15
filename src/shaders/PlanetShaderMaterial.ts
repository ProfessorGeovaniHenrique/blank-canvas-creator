import * as THREE from 'three';
import { extend } from '@react-three/fiber';

/**
 * PlanetShaderMaterial - Shader para Mini-Planetas Texturizados
 * 
 * Este shader renderiza palavras como mini-planetas com:
 * - Texture mapping das 10 texturas PNG
 * - Hue shift dinâmico para colorização baseada no domínio
 * - Mix sutil com a cor do domínio pai (20%)
 * - Fresnel glow para destaque espacial
 * - Suporte para hover/interatividade
 */

const vertexShader = `
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vViewDirection;
varying vec3 vWorldPosition;

void main() {
  vUv = uv;
  vNormal = normalize(normalMatrix * normal);
  
  vec4 worldPos = modelMatrix * vec4(position, 1.0);
  vWorldPosition = worldPos.xyz;
  vViewDirection = normalize(cameraPosition - worldPos.xyz);
  
  gl_Position = projectionMatrix * viewMatrix * worldPos;
}
`;

const fragmentShader = `
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vViewDirection;

uniform sampler2D map;
uniform vec3 uDomainColor;
uniform float uHueShift;
uniform float uEmissiveIntensity;
uniform float uHoverIntensity;
uniform float uColorMixStrength;

// ===== FUNÇÃO: RGB → HSL =====
vec3 rgb2hsl(vec3 color) {
  float maxVal = max(max(color.r, color.g), color.b);
  float minVal = min(min(color.r, color.g), color.b);
  float delta = maxVal - minVal;
  
  float h = 0.0;
  float s = 0.0;
  float l = (maxVal + minVal) / 2.0;
  
  if (delta > 0.0001) {
    s = (l < 0.5) ? delta / (maxVal + minVal) : delta / (2.0 - maxVal - minVal);
    
    if (maxVal == color.r) {
      h = (color.g - color.b) / delta + (color.g < color.b ? 6.0 : 0.0);
    } else if (maxVal == color.g) {
      h = (color.b - color.r) / delta + 2.0;
    } else {
      h = (color.r - color.g) / delta + 4.0;
    }
    h /= 6.0;
  }
  
  return vec3(h, s, l);
}

// ===== FUNÇÃO: HSL → RGB =====
float hue2rgb(float p, float q, float t) {
  if (t < 0.0) t += 1.0;
  if (t > 1.0) t -= 1.0;
  if (t < 1.0/6.0) return p + (q - p) * 6.0 * t;
  if (t < 1.0/2.0) return q;
  if (t < 2.0/3.0) return p + (q - p) * (2.0/3.0 - t) * 6.0;
  return p;
}

vec3 hsl2rgb(vec3 hsl) {
  float h = hsl.x;
  float s = hsl.y;
  float l = hsl.z;
  
  if (s == 0.0) {
    return vec3(l);
  }
  
  float q = l < 0.5 ? l * (1.0 + s) : l + s - l * s;
  float p = 2.0 * l - q;
  
  float r = hue2rgb(p, q, h + 1.0/3.0);
  float g = hue2rgb(p, q, h);
  float b = hue2rgb(p, q, h - 1.0/3.0);
  
  return vec3(r, g, b);
}

void main() {
  // 1. Sample texture
  vec4 texColor = texture2D(map, vUv);
  
  // 2. Converter RGB → HSL
  vec3 hsl = rgb2hsl(texColor.rgb);
  
  // 3. Aplicar hue shift (normalizar de -180/180 para -0.5/0.5)
  float hueShiftNormalized = uHueShift / 360.0;
  hsl.x = fract(hsl.x + hueShiftNormalized);
  
  // 4. Converter HSL → RGB
  vec3 shiftedColor = hsl2rgb(hsl);
  
  // 5. Mix com cor do domínio (20% domain color, 80% shifted texture)
  vec3 finalColor = mix(shiftedColor, uDomainColor, uColorMixStrength);
  
  // 6. Fresnel glow (sutil, só nas bordas)
  vec3 normal = normalize(vNormal);
  vec3 viewDir = normalize(vViewDirection);
  float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 2.0);
  fresnel = clamp(fresnel, 0.0, 1.0);
  
  // Adicionar emissive glow
  finalColor += finalColor * uEmissiveIntensity;
  finalColor += finalColor * fresnel * 0.5;
  
  // 7. Hover glow (branco nas bordas)
  finalColor += vec3(1.0) * fresnel * uHoverIntensity * 0.8;
  
  gl_FragColor = vec4(finalColor, texColor.a);
}
`;

export class PlanetShaderMaterial extends THREE.ShaderMaterial {
  constructor() {
    super({
      uniforms: {
        map: { value: null },
        uDomainColor: { value: new THREE.Color() },
        uHueShift: { value: 0.0 },
        uEmissiveIntensity: { value: 0.3 },
        uHoverIntensity: { value: 0.0 },
        uColorMixStrength: { value: 0.2 },
        uTime: { value: 0.0 }
      },
      vertexShader,
      fragmentShader,
      transparent: true,
      side: THREE.FrontSide,
      depthWrite: true
    });
  }
}

// Registrar no React Three Fiber
extend({ PlanetShaderMaterial });

// Declaração TypeScript para JSX
declare global {
  namespace JSX {
    interface IntrinsicElements {
      planetShaderMaterial: any;
    }
  }
}
