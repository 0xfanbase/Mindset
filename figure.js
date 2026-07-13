// figure.js — a small bottle of light, glowing slowly, on repeat (BUILD-PLAN.md §4.6)
// <mindset-figure color="#7FB0FF" glow="#7FB0FF" animate="1">
// A glass bottle holding a soft light that breathes: brightens and dims on one slow, even
// cycle, with a couple of embers drifting up inside. Nothing sudden, nothing that startles —
// Zen-like. Pauses when hidden; static mid-breath frame under reduced motion.
(function () {
  if (customElements.get("mindset-figure")) return;

  function hexToRgb(hex) {
    const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex || "");
    return m ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)] : [127, 176, 255];
  }

  // Normalized bottle box (x: 0-60, y: 0-96). A simple apothecary-bottle silhouette: narrow
  // neck, rounded shoulders, straight sides, rounded base.
  const BOX_W = 60, BOX_H = 96;
  const BREATHE_CYCLE = 7000; // one slow brighten-dim breath
  const MOTE_CYCLE = 9000;
  const MOTES = [{ x: 24, delay: 0 }, { x: 36, delay: 3000 }, { x: 30, delay: 6000 }];

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
    attributeChangedCallback() {
      if (!this._ready || !this._ctx) return;
      this._spriteC = null;
      if (!this._running) this._drawStatic();
    }
    get _color() { return this.getAttribute("color") || "#7FB0FF"; }
    get _animated() { return this.getAttribute("animate") !== "0" && !this._mql.matches; }

    // Retries until the element actually has a size — a connectedCallback firing before
    // layout/CSS is ready must not silently give up on ever animating.
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
    // Offscreen radial-gradient sprite for the glow, rendered once per size/color change,
    // then drawn scaled per frame — cheap, with no per-frame gradient/blur recompute.
    _ensureSprite() {
      if (this._spriteC) return;
      const [r, g, b] = hexToRgb(this.getAttribute("glow") || this._color);
      const S = 96, c = document.createElement("canvas");
      c.width = S; c.height = S;
      const x = c.getContext("2d");
      const grad = x.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
      grad.addColorStop(0, "rgba(" + r + "," + g + "," + b + ",0.95)");
      grad.addColorStop(0.4, "rgba(" + r + "," + g + "," + b + ",0.5)");
      grad.addColorStop(1, "rgba(" + r + "," + g + "," + b + ",0)");
      x.fillStyle = grad; x.fillRect(0, 0, S, S);
      this._spriteC = c;
    }
    // Map the normalized bottle box onto the actual canvas, preserving aspect ratio.
    _scale() {
      const pad = 5;
      const s = Math.min((this._w - pad * 2) / BOX_W, (this._h - pad * 2) / BOX_H);
      const ox = (this._w - BOX_W * s) / 2, oy = (this._h - BOX_H * s) / 2;
      return { s, ox, oy };
    }
    _bottlePath() {
      const { s, ox, oy } = this._scale();
      const X = (x) => ox + x * s, Y = (y) => oy + y * s;
      const ctx = this._ctx;
      ctx.beginPath();
      ctx.moveTo(X(24), Y(4));
      ctx.lineTo(X(36), Y(4));
      ctx.lineTo(X(36), Y(20));
      ctx.bezierCurveTo(X(36), Y(26), X(50), Y(28), X(50), Y(40));
      ctx.lineTo(X(50), Y(78));
      ctx.quadraticCurveTo(X(50), Y(90), X(38), Y(90));
      ctx.lineTo(X(22), Y(90));
      ctx.quadraticCurveTo(X(10), Y(90), X(10), Y(78));
      ctx.lineTo(X(10), Y(40));
      ctx.bezierCurveTo(X(10), Y(28), X(24), Y(26), X(24), Y(20));
      ctx.closePath();
    }
    _draw(elapsed) {
      const ctx = this._ctx, w = this._w, h = this._h;
      ctx.clearRect(0, 0, w, h);
      this._ensureSprite();
      const [cr, cg, cb] = hexToRgb(this._color);
      const { s, ox, oy } = this._scale();
      const X = (x) => ox + x * s, Y = (y) => oy + y * s;

      this._bottlePath();
      ctx.strokeStyle = "rgba(" + cr + "," + cg + "," + cb + ",0.30)";
      ctx.lineWidth = Math.max(1, 1.5 * s);
      ctx.stroke();

      ctx.save();
      this._bottlePath();
      ctx.clip();

      // the light itself, breathing slowly — a smooth sine, never a sudden jump
      const breathe = (Math.sin((elapsed / BREATHE_CYCLE) * Math.PI * 2 - Math.PI / 2) + 1) / 2;
      const cx = X(30), cy = Y(62);
      const r = (13 + 7 * breathe) * s;
      ctx.globalAlpha = 0.55 + 0.4 * breathe;
      ctx.drawImage(this._spriteC, cx - r, cy - r, r * 2, r * 2);
      ctx.globalAlpha = 1;
      ctx.beginPath(); ctx.arc(cx, cy, Math.max(1.2, 2.4 * s), 0, 6.2832);
      ctx.fillStyle = "rgba(" + cr + "," + cg + "," + cb + ",0.9)";
      ctx.fill();

      // a couple of embers drifting slowly upward inside the glass, looping and fading
      for (const m of MOTES) {
        const mt = ((elapsed + m.delay) % MOTE_CYCLE) / MOTE_CYCLE;
        const fade = Math.sin(mt * Math.PI);
        if (fade <= 0.02) continue;
        const my = Y(82 - mt * 58);
        const mr = Math.max(1, 2.6 * s);
        ctx.globalAlpha = fade * 0.7;
        ctx.drawImage(this._spriteC, X(m.x) - mr, my - mr, mr * 2, mr * 2);
      }
      ctx.globalAlpha = 1;
      ctx.restore();
    }
    _step(now) {
      if (!this._running) return;
      this._draw(now - this._t0);
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
      this._draw(BREATHE_CYCLE * 0.25); // a calm, mid-bright resting frame
    }
  }
  customElements.define("mindset-figure", MindsetFigure);
})();
