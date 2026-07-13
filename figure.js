// figure.js — a small human figure moving through a yoga sun salutation, on repeat
// (the signature element, replacing the water drop — BUILD-PLAN.md §4.6)
// <mindset-figure color="#7FB0FF" glow="#7FB0FF" animate="1">
// Side-profile stick figure, smoothly interpolated between named poses, looping.
// Pauses when hidden; static frame under reduced motion.
(function () {
  if (customElements.get("mindset-figure")) return;

  function hexToRgb(hex) {
    const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex || "");
    return m ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)] : [127, 176, 255];
  }
  const smooth = (t) => t * t * (3 - 2 * t);

  // Poses in a normalized 100x100 box (x: 0 back, 100 front-facing-right; y: 0 top, 100 ground).
  // front/back leg pairs let side-view poses (lunge/plank/dog) show both legs distinctly;
  // standing poses use the same point for both so the legs simply overlap (feet together).
  const STANDING = { head: [50, 14], sh: [50, 27], hip: [50, 55], el: [53, 37], ha: [51, 40], kf: [50, 72], ff: [50, 88], kb: [50, 72], fb: [50, 88] };
  const RAISED = { head: [54, 9], sh: [51, 25], hip: [49, 54], el: [58, 13], ha: [62, 3], kf: [50, 72], ff: [50, 88], kb: [50, 72], fb: [50, 88] };
  const FOLD = { head: [62, 62], sh: [55, 48], hip: [50, 55], el: [63, 74], ha: [65, 88], kf: [50, 72], ff: [50, 88], kb: [50, 72], fb: [50, 88] };
  const LUNGE = { head: [59, 38], sh: [53, 44], hip: [48, 60], el: [58, 58], ha: [62, 88], kf: [35, 70], ff: [26, 88], kb: [65, 78], fb: [85, 90] };
  const PLANK = { head: [18, 52], sh: [26, 55], hip: [55, 58], el: [26, 70], ha: [28, 88], kf: [80, 60], ff: [95, 64], kb: [80, 60], fb: [95, 64] };
  const UPDOG = { head: [25, 35], sh: [35, 45], hip: [55, 72], el: [35, 63], ha: [38, 88], kf: [78, 70], ff: [95, 78], kb: [78, 70], fb: [95, 78] };
  const DOWNDOG = { head: [28, 60], sh: [35, 55], hip: [55, 30], el: [38, 72], ha: [40, 88], kf: [75, 55], ff: [92, 88], kb: [75, 55], fb: [92, 88] };

  // One full sun-salutation cycle: standing -> raised -> fold -> lunge -> plank -> up-dog
  // -> down-dog -> lunge -> fold -> raised -> standing (loop).
  const POSES = [STANDING, RAISED, FOLD, LUNGE, PLANK, UPDOG, DOWNDOG, LUNGE, FOLD, RAISED, STANDING];
  const DUR = 12000; // one full cycle, ms
  const SEG = DUR / (POSES.length - 1);
  const JOINTS = ["head", "sh", "hip", "el", "ha", "kf", "ff", "kb", "fb"];

  function lerpPose(a, b, t) {
    const q = smooth(t);
    const out = {};
    for (const j of JOINTS) out[j] = [a[j][0] + (b[j][0] - a[j][0]) * q, a[j][1] + (b[j][1] - a[j][1]) * q];
    return out;
  }

  class MindsetFigure extends HTMLElement {
    static get observedAttributes() { return ["color", "glow", "animate"]; }
    constructor() {
      super();
      this._raf = 0; this._running = false; this._ready = false;
      this._resizeTimer = 0; this._w = 0; this._h = 0; this._t0 = 0;
    }
    connectedCallback() {
      if (!this.style.display) this.style.display = "block";
      this._canvas = document.createElement("canvas");
      this._canvas.style.cssText = "display:block;width:100%;height:100%";
      this.appendChild(this._canvas);
      this._ctx = this._canvas.getContext("2d");
      this._mql = window.matchMedia("(prefers-reduced-motion: reduce)");
      this._onVis = () => { if (document.hidden) this._stop(); else this._refresh(); };
      document.addEventListener("visibilitychange", this._onVis);
      this._onMql = () => this._refresh();
      if (this._mql.addEventListener) this._mql.addEventListener("change", this._onMql);
      this._ro = new ResizeObserver(() => {
        clearTimeout(this._resizeTimer);
        this._resizeTimer = setTimeout(() => this._setup(), 150);
      });
      this._ro.observe(this);
      this._ready = true;
      this._setup();
    }
    disconnectedCallback() {
      this._stop();
      document.removeEventListener("visibilitychange", this._onVis);
      if (this._ro) this._ro.disconnect();
      if (this._mql && this._mql.removeEventListener) this._mql.removeEventListener("change", this._onMql);
    }
    attributeChangedCallback(name) {
      if (!this._ready || !this._ctx) return;
      this._spriteC = null;
      if (name === "animate") { this._refresh(); return; }
      if (!this._running) this._drawStatic();
    }
    get _color() { return this.getAttribute("color") || "#7FB0FF"; }
    get _animated() { return this.getAttribute("animate") !== "0" && !this._mql.matches; }

    // Retries until the element actually has a size — a connectedCallback firing before
    // layout/CSS is ready must not silently give up on ever animating (previous version did).
    _setup() {
      const r = this.getBoundingClientRect();
      if (r.width < 10 || r.height < 10) {
        if (this._ready) requestAnimationFrame(() => this._setup());
        return;
      }
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      this._w = r.width; this._h = r.height;
      this._canvas.width = Math.round(r.width * dpr);
      this._canvas.height = Math.round(r.height * dpr);
      this._ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      this._t0 = performance.now();
      this._refresh();
    }
    _refresh() {
      this._stop();
      if (this._animated && !document.hidden) this._start();
      else this._drawStatic();
    }
    _ensureSprite() {
      if (this._spriteC) return;
      const [r, g, b] = hexToRgb(this.getAttribute("glow") || this._color);
      const S = 96, c = document.createElement("canvas");
      c.width = S; c.height = S;
      const x = c.getContext("2d");
      const grad = x.createRadialGradient(S / 2, S / 2, 1, S / 2, S / 2, S / 2);
      grad.addColorStop(0, "rgba(" + r + "," + g + "," + b + ",0.35)");
      grad.addColorStop(1, "rgba(" + r + "," + g + "," + b + ",0)");
      x.fillStyle = grad; x.fillRect(0, 0, S, S);
      this._spriteC = c;
    }
    // Map the normalized 0-100 pose box onto the actual canvas, preserving aspect ratio.
    _scale() {
      const pad = 10;
      const s = Math.min((this._w - pad * 2) / 100, (this._h - pad * 2) / 100);
      const ox = (this._w - 100 * s) / 2, oy = (this._h - 100 * s) / 2;
      return { s, ox, oy };
    }
    _pt(p, j) {
      const { s, ox, oy } = this._scale();
      return [ox + p[j][0] * s, oy + p[j][1] * s];
    }
    _draw(pose) {
      const ctx = this._ctx, w = this._w, h = this._h;
      ctx.clearRect(0, 0, w, h);
      this._ensureSprite();
      const [r, g, b] = hexToRgb(this._color);
      const { s } = this._scale();

      // soft ambient glow behind the figure
      const hip = this._pt(pose, "hip");
      const gs = 70 * s;
      ctx.globalAlpha = 1;
      ctx.drawImage(this._spriteC, hip[0] - gs / 2, hip[1] - gs / 2, gs, gs);

      ctx.strokeStyle = "rgba(" + r + "," + g + "," + b + ",0.9)";
      ctx.lineWidth = Math.max(2, 4.5 * s);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      const seg = (a, b2) => {
        const p1 = this._pt(pose, a), p2 = this._pt(pose, b2);
        ctx.beginPath(); ctx.moveTo(p1[0], p1[1]); ctx.lineTo(p2[0], p2[1]); ctx.stroke();
      };
      seg("sh", "hip");   // spine
      seg("head", "sh");  // neck
      seg("sh", "el"); seg("el", "ha");       // arm
      seg("hip", "kf"); seg("kf", "ff");      // front leg
      seg("hip", "kb"); seg("kb", "fb");      // back leg

      const headPt = this._pt(pose, "head");
      ctx.fillStyle = "rgba(" + r + "," + g + "," + b + ",0.95)";
      ctx.beginPath(); ctx.arc(headPt[0], headPt[1], Math.max(3, 6.5 * s), 0, 6.2832); ctx.fill();
    }
    _step(now) {
      if (!this._running) return;
      const t = (now - this._t0) % DUR;
      const i = Math.min(POSES.length - 2, Math.floor(t / SEG));
      const local = (t - i * SEG) / SEG;
      this._draw(lerpPose(POSES[i], POSES[i + 1], local));
      this._raf = requestAnimationFrame(this._step.bind(this));
    }
    _start() {
      if (this._running) return;
      this._running = true;
      this._raf = requestAnimationFrame(this._step.bind(this));
    }
    _stop() { this._running = false; cancelAnimationFrame(this._raf); }
    _drawStatic() {
      if (!this._ctx || !this._w) return;
      this._draw(STANDING);
    }
  }
  customElements.define("mindset-figure", MindsetFigure);
})();
