"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Live version of the hero's gold-dust photo, drawn in WebGL: a dense band of dust across the
 * middle, scattered soft bokeh, and ember streaks at the edges, all drifting and twinkling.
 *
 * Everything moves on the GPU from one `uTime` uniform; the particle buffers are built once.
 * The `fallback` (the static photo) is shown until WebGL is running, and stays if the visitor
 * prefers reduced motion, has no WebGL, or no JavaScript. Drawing pauses while the hero is
 * scrolled out of view or the tab is hidden.
 */

const MAX_DPR = 2;

const DUST_VERT = `
precision highp float;

attribute vec4 a_p;   // home x, home y (fractions of the canvas), size (css px), speed
attribute vec4 a_q;   // phase, twinkle rate, alpha, mode (0 = hover in place, 1 = rise and wrap)

uniform float uDpr, uTime;

varying float v_alpha;
varying float v_soft;

void main(){
  float t = uTime;
  float rise = a_q.w;
  float hoverY = a_p.y + sin(t * a_p.w * 0.35 + a_q.x) * 0.012;
  float riseY = fract(a_p.y - t * a_p.w * 0.012);
  float y = mix(hoverY, riseY, rise);
  float x = a_p.x + sin(t * a_p.w * 0.25 + a_q.x * 1.7) * 0.006;

  gl_PointSize = max(a_p.z * uDpr, 1.0);

  float twinkle = 0.55 + 0.45 * sin(t * a_q.y + a_q.x);
  // rising dust fades in at the bottom and out at the top so the wrap never pops
  float edge = mix(1.0, smoothstep(0.0, 0.08, y) * smoothstep(1.0, 0.92, y), rise);
  v_alpha = a_q.z * twinkle * edge;
  v_soft = smoothstep(2.0, 7.0, a_p.z);   // bigger specks are out-of-focus bokeh
  gl_Position = vec4(x * 2.0 - 1.0, 1.0 - y * 2.0, 0.0, 1.0);
}
`;

const DUST_FRAG = `
precision mediump float;

uniform vec3 uColor;

varying float v_alpha;
varying float v_soft;

void main(){
  float d = length(gl_PointCoord - vec2(0.5)) * 2.0;   // 0 at the centre, 1 at the edge
  float hard = 1.0 - smoothstep(0.7, 1.0, d);
  float soft = exp(-d * d * 3.5) * (1.0 - smoothstep(0.85, 1.0, d));
  float cov = mix(hard, soft, v_soft);
  float a = v_alpha * cov;
  if (a < 0.003) discard;
  gl_FragColor = vec4(uColor * a, a);   // premultiplied, drawn additively
}
`;

const HAZE_VERT = `
attribute vec2 a_pos;
void main(){ gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

const HAZE_FRAG = `
precision mediump float;

uniform vec2  uRes;
uniform float uTime, uBand;
uniform vec3  uGold, uEmber;

void main(){
  vec2 uv = gl_FragCoord.xy / uRes;
  uv.y = 1.0 - uv.y;
  float dy = uv.y - uBand;
  float cx = abs(uv.x - 0.5) * 2.0;             // 0 at the centre, 1 at the edges
  float breathe = 0.9 + 0.1 * sin(uTime * 0.4);
  // thin ember streak, brightest where it leaves the edges of the frame
  float streak = exp(-dy * dy / 0.0006) * (0.15 + 0.85 * pow(cx, 3.0)) * 0.55;
  // wide soft haze around the dust band, strongest in the middle
  float haze = exp(-dy * dy / 0.012) * (1.0 - 0.6 * cx) * 0.18;
  vec3 c = uEmber * streak + uGold * haze;
  float a = (streak + haze) * breathe;
  gl_FragColor = vec4(c * breathe, a);
}
`;

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const sh = gl.createShader(type);
  if (!sh) return null;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    console.error("HeroParticles shader:", gl.getShaderInfoLog(sh));
    gl.deleteShader(sh);
    return null;
  }
  return sh;
}

function link(gl: WebGLRenderingContext, vsSrc: string, fsSrc: string) {
  const vs = compile(gl, gl.VERTEX_SHADER, vsSrc);
  const fs = compile(gl, gl.FRAGMENT_SHADER, fsSrc);
  const prog = gl.createProgram();
  if (!vs || !fs || !prog) return null;
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.error("HeroParticles link:", gl.getProgramInfoLog(prog));
    return null;
  }
  return prog;
}

// Seeded so the dust lands in the same places on every visit
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a += 0x6d2b79f5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

export default function HeroParticles({
  count = 420,
  band = 0.46,
  bandShare = 0.65,
  haze = true,
  fixed = false,
  dotScale = 1.7,
  gold = "#ffcf85",
  ember = "#ff7a3c",
  fallback,
}: {
  /** How many specks to draw. */
  count?: number;
  /** Where the dense dust band sits, as a fraction of the hero's height from the top. */
  band?: number;
  /** Share of the specks that cluster in the band (0 scatters them evenly). */
  bandShare?: number;
  /** Draw the ember streak and central glow behind the dust. */
  haze?: boolean;
  /** Pin the canvas to the viewport (a page backdrop) instead of filling its parent. */
  fixed?: boolean;
  /** Multiplies every speck's size (1 = the photo's grain size). */
  dotScale?: number;
  /** Colour of the dust and the central haze. */
  gold?: string;
  /** Colour of the streaks at the edges. */
  ember?: string;
  /** The static photo shown until WebGL takes over (and kept when it can't). */
  fallback?: ReactNode;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const gl = canvas.getContext("webgl", { alpha: true, antialias: false, depth: false, premultipliedAlpha: true });
    if (!gl) return;
    const dustProg = link(gl, DUST_VERT, DUST_FRAG);
    const hazeProg = link(gl, HAZE_VERT, HAZE_FRAG);
    if (!dustProg || !hazeProg) return;

    // Particle field, shaped like the photo: most dust in a band across the middle, the rest
    // scattered; mostly tiny grains, some mid-size, a few big soft bokeh discs.
    const R = rng(20270117);
    const gauss = () => (R() + R() + R() - 1.5) * 2;
    const p = new Float32Array(count * 4);
    const q = new Float32Array(count * 4);
    for (let i = 0; i < count; i++) {
      const inBand = R() < bandShare;
      const x = inBand ? Math.min(0.98, Math.max(0.02, 0.5 + gauss() * 0.22)) : R();
      const y = inBand ? Math.min(0.95, Math.max(0.05, band + gauss() * 0.06)) : R();
      const kind = R();
      const size = (kind < 0.8 ? 0.7 + R() * 1.1 : kind < 0.95 ? 1.8 + R() * 1.6 : 3.5 + R() * 4.5) * dotScale;
      const alpha = kind < 0.8 ? 0.5 + R() * 0.5 : kind < 0.95 ? 0.4 + R() * 0.4 : 0.15 + R() * 0.2;
      p.set([x, y, size, 0.5 + R()], i * 4);
      q.set([R() * Math.PI * 2, 0.8 + R() * 1.7, alpha, !inBand && R() < 0.7 ? 1 : 0], i * 4);
    }
    const bP = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bP);
    gl.bufferData(gl.ARRAY_BUFFER, p, gl.STATIC_DRAW);
    const bQ = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bQ);
    gl.bufferData(gl.ARRAY_BUFFER, q, gl.STATIC_DRAW);
    const bQuad = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bQuad);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

    const aP = gl.getAttribLocation(dustProg, "a_p");
    const aQ = gl.getAttribLocation(dustProg, "a_q");
    const aPos = gl.getAttribLocation(hazeProg, "a_pos");
    const uD = (n: string) => gl.getUniformLocation(dustProg, n);
    const uH = (n: string) => gl.getUniformLocation(hazeProg, n);
    const goldRgb = hexToRgb(gold);
    const emberRgb = hexToRgb(ember);

    let frame = 0;
    let visible = true;
    const t0 = performance.now();

    const resize = () => {
      const dpr = Math.min(devicePixelRatio || 1, MAX_DPR);
      canvas.width = Math.max(1, Math.round(canvas.clientWidth * dpr));
      canvas.height = Math.max(1, Math.round(canvas.clientHeight * dpr));
    };

    const draw = (now: number) => {
      frame = 0;
      const dpr = Math.min(devicePixelRatio || 1, MAX_DPR);
      const time = (now - t0) / 1000;
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE); // additive: light on top of the burgundy, like the photo's screen blend

      if (haze) {
        gl.useProgram(hazeProg);
        gl.bindBuffer(gl.ARRAY_BUFFER, bQuad);
        gl.enableVertexAttribArray(aPos);
        gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
        gl.uniform2f(uH("uRes"), canvas.width, canvas.height);
        gl.uniform1f(uH("uTime"), time);
        gl.uniform1f(uH("uBand"), band);
        gl.uniform3f(uH("uGold"), ...goldRgb);
        gl.uniform3f(uH("uEmber"), ...emberRgb);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        gl.disableVertexAttribArray(aPos);
      }

      gl.useProgram(dustProg);
      gl.bindBuffer(gl.ARRAY_BUFFER, bP);
      gl.enableVertexAttribArray(aP);
      gl.vertexAttribPointer(aP, 4, gl.FLOAT, false, 0, 0);
      gl.bindBuffer(gl.ARRAY_BUFFER, bQ);
      gl.enableVertexAttribArray(aQ);
      gl.vertexAttribPointer(aQ, 4, gl.FLOAT, false, 0, 0);
      gl.uniform1f(uD("uDpr"), dpr);
      gl.uniform1f(uD("uTime"), time);
      gl.uniform3f(uD("uColor"), ...goldRgb);
      gl.drawArrays(gl.POINTS, 0, count);
      gl.disableVertexAttribArray(aP);
      gl.disableVertexAttribArray(aQ);

      if (visible) frame = requestAnimationFrame(draw);
    };

    const start = () => {
      if (!frame && visible && !document.hidden) frame = requestAnimationFrame(draw);
    };
    const stop = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
      else stop();
    });
    io.observe(canvas);
    const onVisibility = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVisibility);
    start();
    setLive(true);

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      setLive(false);
    };
  }, [count, band, bandShare, haze, dotScale, gold, ember]);

  return (
    <>
      {fallback && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 transition-opacity duration-1000"
          style={{ zIndex: 1, opacity: live ? 0 : 1 }}
        >
          {fallback}
        </div>
      )}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className={`pointer-events-none inset-0 h-full w-full transition-opacity duration-1000 ${fixed ? "fixed -z-10" : "absolute"}`}
        style={{ zIndex: fixed ? undefined : 2, opacity: live ? 1 : 0 }}
      />
    </>
  );
}
