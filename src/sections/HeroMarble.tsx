import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Play, Download, ArrowRight } from 'lucide-react';
import { Link } from 'react-router';

const vertexShader = `
  varying vec2 vUv;
  varying float vWave;
  uniform float uTime;

  vec3 mod289(vec3 x) {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
  }

  vec2 mod289(vec2 x) {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
  }

  vec3 permute(vec3 x) {
    return mod289(((x*34.0)+1.0)*x);
  }

  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
    vec2 i = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m;
    m = m*m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  float fbm(vec2 x) {
    float v = 0.0;
    float a = 0.5;
    vec2 shift = vec2(100.0);
    mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.50));
    for (int i = 0; i < 5; i++) {
      v += a * snoise(x);
      x = rot * x * 2.0 + shift;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vUv = uv;
    vec3 pos = position;
    float noise = fbm(pos.xy * 0.1 + uTime * 0.1);
    pos.z += noise * 0.6;
    vWave = pos.z;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const fragmentShader = `
  varying vec2 vUv;
  varying float vWave;

  void main() {
    vec3 color1 = vec3(245.0/255.0, 184.0/255.0, 0.0);
    vec3 color2 = vec3(254.0/255.0, 249.0/255.0, 230.0/255.0);
    vec3 color3 = vec3(27.0/255.0, 42.0/255.0, 74.0/255.0);
    float mixValue = smoothstep(-0.2, 1.0, vWave);
    vec3 color = mix(mix(color1, color2, vWave), color3, mixValue);
    gl_FragColor = vec4(color, 1.0);
  }
`;

function MarblePlane() {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
  }), []);

  useFrame(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value += 0.005;
    }
  });

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} scale={[3, 2, 1]}>
      <planeGeometry args={[1, 1, 128, 128]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  );
}

export default function HeroMarble() {
  return (
    <section className="relative w-full min-h-[100dvh] flex items-center justify-center overflow-hidden">
      {/* WebGL Canvas Background */}
      <div className="absolute inset-0 z-0">
        <Canvas
          camera={{ position: [0, -0.3, 0.6], fov: 35 }}
          gl={{ antialias: true }}
          style={{ width: '100%', height: '100%' }}
        >
          <MarblePlane />
        </Canvas>
      </div>

      {/* Radial Gradient Overlay */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(254,253,251,0) 0%, rgba(254,253,251,0.6) 40%, rgba(254,253,251,0.9) 70%, rgba(254,253,251,1) 100%)',
        }}
      />

      {/* Content */}
      <div className="relative z-[2] container-main flex flex-col items-center text-center pt-[100px] pb-[60px]">
        <span className="font-mono-accent text-[12px] tracking-[0.15em] text-[#718096] mb-6 uppercase">
          #1 AI Coaching in Kotkapura, Punjab
        </span>

        <h1 className="font-display text-[42px] sm:text-[52px] md:text-[60px] font-semibold text-[#1B2A4A] leading-[1.05] tracking-[-1.5px] mb-6 max-w-[880px]">
          Master Artificial<br />
          <span className="text-[#1B2A4A]">Intelligence with Udaan24</span>
        </h1>

        <p className="text-[16px] sm:text-[18px] text-[#4A5568] leading-relaxed max-w-[640px] mb-10">
          Punjab's leading AI coaching institute in Kotkapura. Learn Python, Machine Learning, Deep Learning, and Data Science with hands-on projects and guaranteed certification.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 mb-12">
          <Link to="/courses" className="btn-primary flex items-center gap-2 px-8 py-4 text-[15px]">
            Explore Courses
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link to="/downloads" className="btn-secondary flex items-center gap-2 px-8 py-4 text-[15px]">
            <Download className="w-4 h-4" />
            Prospectus
          </Link>
          <button className="flex items-center gap-2 text-[#1B2A4A] font-medium text-[15px] hover:text-[#F5B800] transition-colors duration-200">
            <div className="w-10 h-10 rounded-full border-2 border-[#1B2A4A] flex items-center justify-center">
              <Play className="w-4 h-4 ml-0.5" />
            </div>
            Watch Video
          </button>
        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 opacity-60">
          <span className="font-mono-accent text-[11px] text-[#718096] uppercase tracking-widest">AI Coaching Kotkapura</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#F5B800]" />
          <span className="font-mono-accent text-[11px] text-[#718096] uppercase tracking-widest">Live Projects</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#F5B800]" />
          <span className="font-mono-accent text-[11px] text-[#718096] uppercase tracking-widest">Certified Training</span>
        </div>
      </div>
    </section>
  );
}
