// figure.js — a small human figure moving through a yoga sun salutation, on repeat
// (the signature element, replacing the water drop — BUILD-PLAN.md §4.6)
// <mindset-figure color="#7FB0FF" glow="#7FB0FF" animate="1">
// Side-profile figure, smoothly interpolated between named poses with a real hold at
// each one (not constant drifting) — closer to the pace of an actual sun salutation.
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
  //
  // Built with fixed bone lengths (neck 12, torso 27, upper arm 17, forearm 20, thigh 21,
  // shin 21 — same in every pose) and a chosen joint angle per pose, not hand-placed absolute
  // points, so the figure can't stretch or shrink a limb between poses (verified by script:
  // every segment measures identically in all 8 poses before rounding).
  const STANDING = { head: [50, 17], sh: [50, 29], hip: [50, 56], el: [57.2, 44.4], ha: [62.4, 25.1], kf: [51.8, 76.9], ff: [50, 97.8], kb: [51.8, 76.9], fb: [50, 97.8] };
  const RAISED = { head: [43.5, 16.5], sh: [46.6, 28.1], hip: [49, 55], el: [48.1, 11.2], ha: [53.3, -8.2], kf: [50.8, 75.9], ff: [49, 96.8], kb: [50.8, 75.9], fb: [49, 96.8] };
  const FOLD = { head: [85.4, 67.1], sh: [74.1, 63], hip: [48, 56], el: [78.5, 79.4], ha: [80.2, 99.3], kf: [49.8, 76.9], ff: [48, 97.8], kb: [49.8, 76.9], fb: [48, 97.8] };
  const LUNGE = { head: [65.7, 28.1], sh: [57.2, 36.6], hip: [48, 62], el: [64.4, 52], ha: [75.9, 68.4], kf: [68.3, 67.4], ff: [64.6, 88.1], kb: [28.3, 69.2], fb: [7.6, 72.8] };
  const PLANK = { head: [17.1, 47.2], sh: [28.4, 51.3], hip: [55, 56], el: [32.8, 67.7], ha: [36.3, 87.4], kf: [76, 56], ff: [96.9, 54.2], kb: [76, 56], fb: [96.9, 54.2] };
  // Ashtanga Namaskara — chest and chin lower toward the floor while the hips stay raised,
  // elbows bent and tucked close to the ribs (the bridge between plank and up-dog).
  const EIGHTLIMB = { head: [15.8, 64.3], sh: [27.6, 62.2], hip: [53, 53], el: [19.1, 77], ha: [24.3, 96.3], kf: [74, 53], ff: [94.9, 51.2], kb: [74, 53], fb: [94.9, 51.2] };
  const UPDOG = { head: [31.3, 42.2], sh: [40.5, 49.9], hip: [56, 72], el: [44.9, 66.3], ha: [48.4, 86], kf: [35.3, 75.6], ff: [17.1, 86.1], kb: [35.3, 75.6], fb: [17.1, 86.1] };
  const DOWNDOG = { head: [93, 42.1], sh: [82.1, 37], hip: [56, 30], el: [87.9, 53], ha: [93.1, 72.3], kf: [39.9, 43.5], ff: [26.4, 59.6], kb: [39.9, 43.5], fb: [26.4, 59.6] };

  // One full sun-salutation cycle: standing -> raised -> fold -> lunge -> plank ->
  // eight-limbed -> up-dog -> down-dog -> lunge -> fold -> raised -> standing (loop).
  const POSES = [STANDING, RAISED, FOLD, LUNGE, PLANK, EIGHTLIMB, UPDOG, DOWNDOG, LUNGE, FOLD, RAISED, STANDING];
  const JOINTS = ["head", "sh", "hip", "el", "ha", "kf", "ff", "kb", "fb"];

  // Each pose is held (a real pause, like a breath) before easing into the next one —
  // continuous constant-speed drifting between poses does not read as an actual person
  // moving through a sequence. Longer holds at the poses usually held longest in practice
  // (down-dog, the standing poses); the eight-limbed bridge pose is brief by nature.
  const HOLD = [1600, 1000, 1300, 1500, 1000, 600, 1400, 1900, 1500, 1300, 1000];
  const MOVE = [900, 1300, 1200, 1000, 900, 1000, 1200, 1200, 1200, 1300, 900];
  const SEG_START = [];
  let _acc = 0;
  for (let i = 0; i < HOLD.length; i++) { SEG_START.push(_acc); _acc += HOLD[i] + MOVE[i]; }
  const CYCLE = _acc;

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

      ctx.fillStyle = "rgba(" + r + "," + g + "," + b + ",0.92)";

      // Every limb is a filled tapered quad (wider at the body end, narrower at the
      // extremity) plus a round joint cap at each end — a solid silhouette, not a wire
      // stick figure. One fill per segment, so this stays cheap to draw every frame.
      const quad = (a, b2, w1, w2) => {
        const p1 = this._pt(pose, a), p2 = this._pt(pose, b2);
        const dxL = p2[0] - p1[0], dyL = p2[1] - p1[1];
        const l = Math.hypot(dxL, dyL) || 1;
        const nx = (-dyL / l), ny = (dxL / l);
        const r1 = Math.max(1.4, w1 * s / 2), r2 = Math.max(1.2, w2 * s / 2);
        ctx.beginPath();
        ctx.moveTo(p1[0] + nx * r1, p1[1] + ny * r1);
        ctx.lineTo(p2[0] + nx * r2, p2[1] + ny * r2);
        ctx.lineTo(p2[0] - nx * r2, p2[1] - ny * r2);
        ctx.lineTo(p1[0] - nx * r1, p1[1] - ny * r1);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath(); ctx.arc(p2[0], p2[1], r2, 0, 6.2832); ctx.fill();
      };
      const joint = (a, w) => {
        const p = this._pt(pose, a);
        ctx.beginPath(); ctx.arc(p[0], p[1], Math.max(1.4, w * s / 2), 0, 6.2832); ctx.fill();
      };

      quad("hip", "kb", 8.5, 7);        // back thigh (behind the torso/front leg)
      quad("kb", "fb", 7, 5.5);         // back shin
      quad("hip", "kf", 8.5, 7);        // front thigh
      quad("kf", "ff", 7, 5.5);         // front shin

      // torso as a filled tapered band (hip wider than shoulder), the figure's core mass
      quad("sh", "hip", 5.5, 7);
      joint("hip", 7); joint("sh", 5.5);

      quad("sh", "el", 6.5, 5.5);       // upper arm
      quad("el", "ha", 5.5, 4.5);       // forearm
      quad("head", "sh", 5, 5.5);       // neck

      const headPt = this._pt(pose, "head");
      ctx.beginPath(); ctx.arc(headPt[0], headPt[1], Math.max(3, 7.5 * s), 0, 6.2832); ctx.fill();
    }
    _step(now) {
      if (!this._running) return;
      const t = (now - this._t0) % CYCLE;
      let i = SEG_START.length - 1;
      for (let k = 0; k < SEG_START.length; k++) {
        if (t < SEG_START[k] + HOLD[k] + MOVE[k]) { i = k; break; }
      }
      const segT = t - SEG_START[i];
      if (segT < HOLD[i]) {
        this._draw(POSES[i]);
      } else {
        const localT = (segT - HOLD[i]) / MOVE[i];
        this._draw(lerpPose(POSES[i], POSES[i + 1], localT));
      }
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
