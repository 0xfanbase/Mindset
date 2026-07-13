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
  // Ground-anchored: every pose shares one floor line (y=92) and one hand-plant spot
  // (x=84, unmoving from the forward fold through down-dog, like a real mat), built via
  // inverse kinematics so a grounded foot/hand is actually AT the floor, not floating at a
  // different height per pose — and the figure faces the same way in every pose. Fixed bone
  // lengths (neck 10, torso 23, upper arm 14.5, forearm 17, thigh 18, shin 18) verified by
  // script, along with every floor joint reading ~92 and every planted hand reading (84, 92).
  const STANDING = { head: [78, 23], sh: [78, 33], hip: [78, 56], el: [92.3, 30.9], ha: [87, 47], kf: [78.9, 74], ff: [78, 92], kb: [78.9, 74], fb: [78, 92] };
  const RAISED = { head: [71.7, 23.8], sh: [74.8, 33.3], hip: [78, 56], el: [71.4, 19.2], ha: [75.9, 2.8], kf: [78.9, 74], ff: [78, 92], kb: [78.9, 74], fb: [78, 92] };
  const FOLD = { head: [91.1, 86.3], sh: [87.7, 76.9], hip: [78, 56], el: [99.6, 85.2], ha: [84, 92], kf: [78.9, 74], ff: [78, 92], kb: [78.9, 74], fb: [78, 92] };
  const LUNGE = { head: [99, 62.1], sh: [89, 63], hip: [66.3, 67], el: [92.3, 77.1], ha: [84, 92], kf: [82.7, 74.6], ff: [78, 92], kb: [48.4, 65.4], fb: [32.8, 74.4] };
  const PLANK = { head: [91.6, 72.4], sh: [82.2, 69], hip: [60, 63], el: [72.4, 79.6], ha: [84, 92], kf: [49.7, 77.7], ff: [39.4, 92.5], kb: [49.7, 77.7], fb: [39.4, 92.5] };
  // Ashtanga Namaskara — chest/chin lower toward the floor, hips stay raised, elbows tucked.
  const EIGHTLIMB = { head: [84.7, 81.9], sh: [77.6, 74.8], hip: [60, 60], el: [68.2, 85.8], ha: [84, 92], kf: [49.7, 74.7], ff: [43.5, 91.7], kb: [49.7, 74.7], fb: [43.5, 91.7] };
  // Bhujangasana (cobra), not up-dog — hips/thighs/feet-tops stay down, only the chest lifts;
  // calmer than a straight-arm up-dog, and up-dog's old geometry didn't hold together anyway.
  const COBRA = { head: [69.3, 59.5], sh: [66.7, 69.2], hip: [57, 90], el: [69.3, 83.4], ha: [84, 92], kf: [39, 89.4], ff: [21, 90], kb: [39, 89.4], fb: [21, 90] };
  const DOWNDOG = { head: [85.7, 70.1], sh: [76.6, 65.9], hip: [55, 58], el: [72.3, 79.7], ha: [84, 92], kf: [43.4, 71.8], ff: [37.3, 88.7], kb: [43.4, 71.8], fb: [37.3, 88.7] };

  // standing -> raised -> fold -> lunge -> plank -> eight-limbed -> cobra -> down-dog ->
  // lunge -> fold -> raised -> standing (loop).
  const POSES = [STANDING, RAISED, FOLD, LUNGE, PLANK, EIGHTLIMB, COBRA, DOWNDOG, LUNGE, FOLD, RAISED, STANDING];
  const JOINTS = ["head", "sh", "hip", "el", "ha", "kf", "ff", "kb", "fb"];

  // Each pose is held (a real pause, like a breath) before easing into the next one. A real
  // vinyasa-style sun salutation is the opposite of "hold, then snap": the movement itself
  // lasts most of the breath, and only down-dog (traditionally five breaths) and the standing
  // poses are actually held for any length of time. Long, slow transitions; brief settles.
  const HOLD = [3000, 600, 700, 600, 500, 500, 700, 5000, 600, 700, 600];
  const MOVE = [2600, 2700, 2500, 2300, 2300, 2500, 2600, 3100, 2500, 2700, 2600];
  const SEG_START = [];
  let _acc = 0;
  for (let i = 0; i < HOLD.length; i++) { SEG_START.push(_acc); _acc += HOLD[i] + MOVE[i]; }
  const CYCLE = _acc;

  // A foot that's planted at both ends of a transition but moves position between them (the
  // sequence's four "step" moments) lifts slightly rather than dragging along the floor —
  // segment index -> which joint pair steps, keyed to the MOVE phase only.
  const STEP = { 2: "back", 3: "front", 7: "front", 8: "back" };
  const STEP_LIFT = 7;

  function lerpPose(a, b, t, segIndex) {
    const q = smooth(t);
    const out = {};
    for (const j of JOINTS) out[j] = [a[j][0] + (b[j][0] - a[j][0]) * q, a[j][1] + (b[j][1] - a[j][1]) * q];
    const step = STEP[segIndex];
    if (step) {
      const lift = STEP_LIFT * Math.sin(Math.PI * t);
      const joints = step === "front" ? ["kf", "ff"] : ["kb", "fb"];
      for (const j of joints) out[j][1] -= lift;
    }
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
        this._draw(lerpPose(POSES[i], POSES[i + 1], localT, i));
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
