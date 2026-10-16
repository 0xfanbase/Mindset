# Security audit — Mindset (2026-10-16)

Same bar as Bitcoin-Engine-Room `pipeline/notes/SECURITY_AUDIT_2026-10-16.md`. Scope: public
GitHub Pages PWA (life-in-weeks). No invented vulns.

## Findings

| Severity | Finding | Status |
|----------|---------|--------|
| MEDIUM | No CSP (Pages cannot set response headers; meta missing) | **Fixed** — meta CSP on `index.html` |
| MEDIUM | SW cached any OK GET (no same-origin / `basic` gate) | **Fixed** — origin check + `res.type === "basic"`; CACHE → `mindset-v29` |
| LOW | No `Referrer-Policy` | **Fixed** — `no-referrer` meta (privacy for a personal calendar) |
| — | XSS via `innerHTML` / URL / hash / epigraph injection | **Clean** — DOM built with `createElement` + `textContent` only; epigraph is a hardcoded const; no URL/hash params |
| — | `localStorage` / session storage | **Clean** — zero runtime references (verifier-gated since v4.0) |
| — | Supply chain (CDN / npm / SRI) | **Clean** — zero runtime deps, self-hosted fonts, no CDN scripts |
| — | Secrets in repo / Actions | **Clean** — no secrets; `pages-deploy.yml` uses default `GITHUB_TOKEN` with `contents: read` + `pages: write` + `id-token: write` only; verify gate before deploy; artifact stages runtime files only (no `audits/` / `BUILD-PLAN.md`) |
| — | Open redirects / CORS app config | **Clean** — no redirects; no app-controlled CORS. Pages platform sends `Access-Control-Allow-Origin: *` (residual, below) |
| LOW | No branch protection on `main` | **Documented** — enable required reviews + status checks in GitHub settings |
| LOW | Actions: `allowed_actions: all`, `sha_pinning_required: false` | **Documented** — prefer pin third-party actions to commit SHA; `checkout`/`setup-node`/`deploy-pages` are official |
| LOW | Dependabot security updates disabled | **Documented** — negligible while there is no `package.json` / lockfile |
| LOW | GitHub Pages `Access-Control-Allow-Origin: *` | **Documented** — platform default; cannot fix in-repo. Site is static + `noindex` |
| LOW | No response headers (`X-Content-Type-Options`, etc.) | **Documented** — Pages project sites cannot set them; CSP meta is the available control |
| INFO | PII: initials `J`/`B` + birth months `1989-12` / `1988-11` in client `lib.mjs` | **Intentional** — product data for the life calendar (invariant 1 / README). Month precision only, never exact DOB or real names. Residual re-identification if combined with other public info; not a code defect |
| INFO | Public git still holds `audits/` / `BUILD-PLAN.md` | **Accepted** — not shipped to Pages; process docs. Names remain denylist-gated by `verify.mjs` |

## Fixed this pass
- CSP meta (`default-src 'self'`; no `'unsafe-inline'`/`'unsafe-eval'` on scripts; `worker-src 'self'`).
- Referrer meta `no-referrer`.
- Service worker same-origin + basic-type cache gate; CACHE `mindset-v29`; Appendix C.2 synced.
- Verifier +4 checks (CSP, referrer, XSS sinks, SW gate) → **75/75**.

## Residual risk (short)
A static personal PWA with no backend, no third-party JS, and no storage is a small attack
surface. Remaining risk is mostly **ops**: unprotected `main`, unpinned Actions majors, and
GitHub Pages platform headers/CORS. Compromised `main` still equals compromised site (true of
any Pages deploy). Birth months + initials are public by design.
