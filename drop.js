// drop.js — a single calm dripping drop of water (the signature element, BUILD-PLAN.md §4.6)
// <mindset-drop color="#7FB0FF" glow="#7FB0FF" animate="1">
// Slow bead -> pear-shaped stretch -> detach + satellite -> impact squash -> big slow ripples.
// Pauses when hidden; static frame under reduced motion.
(function () {
  if (customElements.get("mindset-drop")) return;

  function hexToRgb(hex) {
    const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex || "");
    return m ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)] : [127, 176, 255];
  }
  const smooth = (t) => t * t * (3 - 2 * t);
  const clamp01 = (t) => Math.max(0, Math.min(1, t));

  const DUR = 9500;                 // one full breath of a cycle
  const FORM_END = 0.52;            // bead grows and sags
  const FALL_END = 0.585;           // detach + fall
  const SPLASH_END = 0.63;          // impact squash melts into the surface

  class MindsetDrop extends HTMLElement {
    static get observedAttributes() { return ["color", "glow", "ring", "animate"]; }
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

    _setup() {
      const r = this.getBoundingClientRect();
      if (r.width < 10 || r.height < 10) return;
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
      const S = 64, c = document.createElement("canvas");
      c.width = S; c.height = S;
      const x = c.getContext("2d");
      const grad = x.createRadialGradient(S / 2, S / 2, 1, S / 2, S / 2, S / 2);
      grad.addColorStop(0, "rgba(" + r + "," + g + "," + b + ",0.5)");
      grad.addColorStop(1, "rgba(" + r + "," + g + "," + b + ",0)");
      x.fillStyle = grad; x.fillRect(0, 0, S, S);
      this._spriteC = c;
    }
    _fill(ctx, cx, y, r) {
      const [cr, cg, cb] = hexToRgb(this._color);
      const lr = Math.round(cr + (255 - cr) * 0.55), lg = Math.round(cg + (255 - cg) * 0.55), lb = Math.round(cb + (255 - cb) * 0.55);
      const dr = Math.round(cr * 0.72), dg = Math.round(cg * 0.78), db = Math.round(cb * 0.9);
      const g = ctx.createRadialGradient(cx - r * 0.4, y - r * 0.45, r * 0.12, cx, y, r * 1.6);
      g.addColorStop(0, "rgba(" + lr + "," + lg + "," + lb + ",0.95)");
      g.addColorStop(0.5, "rgba(" + cr + "," + cg + "," + cb + ",0.88)");
      g.addColorStop(1, "rgba(" + dr + "," + dg + "," + db + ",0.8)");
      ctx.fillStyle = g;
    }
    _rim(ctx) {
      const [r, g, b] = hexToRgb(this._color);
      ctx.strokeStyle = "rgba(" + r + "," + g + "," + b + ",0.35)";
      ctx.lineWidth = 0.75;
    }
    _shine(ctx, cx, y, r) {
      ctx.fillStyle = "rgba(255,255,255,0.6)";
      ctx.beginPath();
      ctx.ellipse(cx - r * 0.34, y - r * 0.3, Math.max(0.5, r * 0.2), Math.max(0.8, r * 0.32), -0.5, 0, 6.2832);
      ctx.fill();
    }
    // hanging bead: pinched neck at top, full pear-shaped belly
    _bead(ctx, cx, top, y, r, sag) {
      const belly = r * (1 + 0.18 * sag);
      const neckW = Math.max(0.6, r * 0.22 * (1 - sag * 0.5));
      ctx.beginPath();
      ctx.moveTo(cx - neckW, top);
      ctx.bezierCurveTo(cx - neckW - r * 0.25, y - r * 0.85, cx - belly * 1.06, y - r * 0.25, cx - belly, y + r * 0.15);
      ctx.bezierCurveTo(cx - belly * 0.92, y + r * 0.85, cx - r * 0.5, y + r * 1.02, cx, y + r * 1.05);
      ctx.bezierCurveTo(cx + r * 0.5, y + r * 1.02, cx + belly * 0.92, y + r * 0.85, cx + belly, y + r * 0.15);
      ctx.bezierCurveTo(cx + belly * 1.06, y - r * 0.25, cx + neckW + r * 0.25, y - r * 0.85, cx + neckW, top);
      ctx.closePath();
    }
    _ripple(ctx, cx, surfY, rq, baseAlpha, maxR) {
      if (rq <= 0 || rq >= 1) return;
      const [r, g, b] = hexToRgb(this._color);
      const grow = 1 - Math.pow(1 - rq, 2.2); // fast start, long slow finish
      const rx = 4 + maxR * grow;
      ctx.globalAlpha = Math.pow(1 - rq, 1.3) * baseAlpha;
      ctx.strokeStyle = "rgba(" + r + "," + g + "," + b + ",0.8)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(cx, surfY, rx, rx * 0.26, 0, 0, 6.2832);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
    _draw(k) {
      const ctx = this._ctx, w = this._w, h = this._h;
      const cx = w / 2, hangY = 7, surfY = h - 13;
      const maxR = Math.min(w / 2 - 6, 56);
      ctx.clearRect(0, 0, w, h);
      this._ensureSprite();

      if (k < FORM_END) {
        // the bead grows, then sags under its own weight
        const q = smooth(k / FORM_END);
        const r = 2 + 3.4 * q;
        const sag = clamp01((q - 0.72) / 0.28);
        const y = hangY + r + 1.5 + sag * 3.5;
        const gs = 24 + r * 5;
        ctx.globalAlpha = 0.45 + 0.3 * q;
        ctx.drawImage(this._spriteC, cx - gs / 2, y - gs / 2, gs, gs);
        ctx.globalAlpha = 1;
        this._fill(ctx, cx, y, r);
        this._bead(ctx, cx, hangY, y, r, sag);
        ctx.fill();
        this._rim(ctx); ctx.stroke();
        this._shine(ctx, cx, y, r);
      } else if (k < FALL_END) {
        // detach and fall — stretched by acceleration, satellite bead trailing
        const q = (k - FORM_END) / (FALL_END - FORM_END);
        const y0 = hangY + 11, y1 = surfY - 4;
        const y = y0 + (y1 - y0) * q * q;
        const r = 4.6, stretch = 1 + 0.3 * q;
        const gs = 38;
        ctx.globalAlpha = 0.65;
        ctx.drawImage(this._spriteC, cx - gs / 2, y - gs / 2, gs, gs);
        ctx.globalAlpha = 1;
        this._fill(ctx, cx, y, r);
        ctx.beginPath();
        ctx.ellipse(cx, y, r * 0.86, r * stretch, 0, 0, 6.2832);
        ctx.fill();
        this._rim(ctx); ctx.stroke();
        this._shine(ctx, cx, y, r);
        // satellite droplet
        const sy = y - 12 - 4 * q;
        this._fill(ctx, cx, sy, 1.4);
        ctx.beginPath(); ctx.arc(cx, sy, 1.4, 0, 6.2832); ctx.fill();
        // fresh bead already forming
        this._fill(ctx, cx, hangY + 3, 1.5);
        this._bead(ctx, cx, hangY, hangY + 3, 1.5, 0);
        ctx.fill();
      } else {
        // impact squash, then wide slow rings — the zen part
        const q = (k - FALL_END) / (1 - FALL_END);
        if (k < SPLASH_END) {
          const sq = (k - FALL_END) / (SPLASH_END - FALL_END);
          const rx = 4.5 + 4 * sq, ry = 2.6 * (1 - sq) + 0.6;
          ctx.globalAlpha = 1 - sq * 0.5;
          this._fill(ctx, cx, surfY - ry / 2, rx);
          ctx.beginPath();
          ctx.ellipse(cx, surfY - ry / 2, rx, ry, 0, 0, 6.2832);
          ctx.fill();
          ctx.globalAlpha = 1;
        }
        this._ripple(ctx, cx, surfY, q, 0.55, maxR);
        this._ripple(ctx, cx, surfY, (q - 0.16) / 0.84, 0.4, maxR * 0.86);
        this._ripple(ctx, cx, surfY, (q - 0.34) / 0.66, 0.28, maxR * 0.68);
        const gs = 26 * (1 - q);
        if (gs > 2) {
          ctx.globalAlpha = 0.35 * (1 - q);
          ctx.drawImage(this._spriteC, cx - gs / 2, surfY - gs / 2, gs, gs);
          ctx.globalAlpha = 1;
        }
        // the next bead quietly returns
        const r2 = 1.5 + 2 * smooth(clamp01(q * 1.1));
        this._fill(ctx, cx, hangY + 1.5 + r2, r2);
        this._bead(ctx, cx, hangY, hangY + 1.5 + r2, r2, 0);
        ctx.fill();
        this._rim(ctx); ctx.stroke();
      }
    }
    _step(now) {
      if (!this._running) return;
      this._draw(((now - this._t0) % DUR) / DUR);
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
      const ctx = this._ctx, cx = this._w / 2, hangY = 7, surfY = this._h - 13;
      ctx.clearRect(0, 0, this._w, this._h);
      this._ensureSprite();
      const r = 4.4, y = hangY + r + 2;
      const gs = 24 + r * 5;
      ctx.globalAlpha = 0.55;
      ctx.drawImage(this._spriteC, cx - gs / 2, y - gs / 2, gs, gs);
      ctx.globalAlpha = 1;
      this._fill(ctx, cx, y, r);
      this._bead(ctx, cx, hangY, y, r, 0.4);
      ctx.fill();
      this._rim(ctx); ctx.stroke();
      this._shine(ctx, cx, y, r);
      this._ripple(ctx, cx, surfY, 0.35, 0.5, Math.min(this._w / 2 - 6, 56));
    }
  }
  customElements.define("mindset-drop", MindsetDrop);
})();
