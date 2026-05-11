# Security Refactor Plan — Rookies

**Date:** 2026-05-10
**Scope:** Frontend → Backend → Database/Environment

---

## Priority Summary

| # | Severity | Location | Issue |
|---|----------|----------|-------|
| 1 | CRITICAL | Backend | Hardcoded JWT secret default value |
| 2 | CRITICAL | Frontend | JWT stored in localStorage (XSS token theft risk) |
| 3 | HIGH | Backend | No rate limiting on auth endpoints |
| 4 | HIGH | Backend | No account lockout after failed login attempts |
| 5 | HIGH | Frontend | No Next.js middleware for server-side route protection |
| 6 | HIGH | Frontend | No security headers in next.config.ts |
| 7 | MEDIUM | Backend | No password strength validation |
| 8 | MEDIUM | Backend | JWT expiration too long (24h) |
| 9 | MEDIUM | Backend | No HTTPS/HSTS enforcement |
| 10 | MEDIUM | Backend | Status field not validated on component updates |
| 11 | MEDIUM | Backend | Admin self-demotion check needs edge-case hardening |
| 12 | LOW | Frontend | Role-based UI hiding is client-side only (backend is correct) |
| 13 | LOW | Backend | Activation token uses bcrypt (appropriate but fine) |

---

## Detailed Findings & Fixes

### 1. Hardcoded JWT Secret Default (CRITICAL)
- **File:** `backend/app/config.py:7`
- **Current:** `jwt_secret: str = "change-me-to-a-random-secret"`
- **Risk:** If `.env` is missing or misconfigured, all tokens are forgeable.
- **Fix:** Remove the default. Add fail-fast at startup:
  ```python
  @computed_field
  @property
  def jwt_secret(self) -> str:
      secret = os.getenv("JWT_SECRET", "")
      if not secret or secret == "change-me-to-a-random-secret":
          raise RuntimeError("JWT_SECRET must be set to a strong random value.")
      return secret
  ```
- **`.env.example`:** Document that `JWT_SECRET` must be a 256-bit random string. Recommend: `openssl rand -hex 32`.

### 2. JWT Stored in localStorage (CRITICAL — XSS Attack Vector)
- **File:** `frontend/src/lib/api.ts:34-45`
- **Current:** Token stored in `localStorage`, read/written by client JS.
- **Risk:** Any XSS payload (e.g., injected via component `notes`) can exfiltrate the token.
- **Fix (Cookie-based approach):**
  - **Backend `routes.py`:** On `POST /auth/login`, set `access_token` as an `HttpOnly`, `SameSite=Strict`, `Secure` cookie. Remove token from JSON body response.
  - **Backend:** `POST /auth/logout` clears the cookie.
  - **Frontend `lib/api.ts`:** Remove all `localStorage` token logic. All API calls use `credentials: "include"` instead of the Authorization header approach.
  - **Alternative (hybrid):** Keep Authorization header for API calls but ALSO set httpOnly cookie as a defense-in-depth measure. The cookie can't be stolen by JS, the header works for API calls.

### 3. No Rate Limiting on Auth Endpoints (HIGH)
- **File:** `backend/app/features/auth/routes.py` (all auth endpoints)
- **Risk:** Brute force on `/auth/login`, token guessing on `/auth/activate`.
- **Fix:** Install `slowapi`. Add to `app/main.py`:
  ```python
  from slowapi import Limiter
  from slowapi.util import get_remote_address
  limiter = Limiter(key_func=get_remote_address)
  app.state.limiter = limiter

  @app.post("/api/v1/auth/login")
  @limiter.limit("5/minute")
  async def login(...)
  ```
- Apply stricter limits: `2/minute` for login, `3/minute` for activate, `1/minute` for seed.

### 4. No Account Lockout After Failed Attempts (HIGH)
- **File:** `backend/app/features/auth/service.py:141-167`
- **Risk:** Unlimited password guessing.
- **Fix:** Add fields to `Member` model:
  ```python
  failed_login_attempts = IntField(default=0)
  locked_until = DateTimeField()
  ```
  On failed login: increment counter, lock for 15 min after 5 failures. Reset on success. `require_admin` dependency should also check `locked_until`.

### 5. No Next.js Server-Side Route Middleware (HIGH)
- **File:** `frontend/src/middleware.ts` (missing)
- **Risk:** Protected pages may briefly render before client redirect.
- **Fix:** Create `middleware.ts` at `frontend/src/middleware.ts`:
  ```typescript
  import { NextResponse } from 'next/server'
  import type { NextRequest } from 'next/server'

  export function middleware(request: NextRequest) {
    const publicPaths = ['/login', '/activate', '/health']
    const path = request.nextUrl.pathname
    if (publicPaths.some(p => path.startsWith(p))) return NextResponse.next()
    const token = request.cookies.get('access_token')
    if (!token) return NextResponse.redirect(new URL('/login', request.url))
    return NextResponse.next()
  }
  ```
  Protect all routes under `(app)/`.

### 6. No Security Headers in next.config.ts (HIGH)
- **File:** `frontend/next.config.ts`
- **Risk:** No XSS, clickjacking, or MIME-sniffing protection.
- **Fix:** Add headers:
  ```typescript
  async headers() {
    return [{
      source: '/:path*',
      headers: [
        { key: 'Content-Security-Policy', value: "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';" },
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      ],
    }]
  }
  ```
  *Note: CSP needs refinement after identifying all script/font/image origins. Run `npm run build` after to check for console errors from inline styles/scripts.*

### 7. No Password Strength Validation (MEDIUM)
- **File:** `backend/app/features/auth/schemas.py:9`
- **Risk:** Weak passwords easily cracked.
- **Fix:** Add Pydantic validator:
  ```python
  @field_validator('password')
  @classmethod
  def validate_password(cls, v: str) -> str:
      if len(v) < 10:
          raise ValueError('Must be at least 10 characters')
      if not re.search(r'[A-Z]', v):
          raise ValueError('Must contain an uppercase letter')
      if not re.search(r'[a-z]', v):
          raise ValueError('Must contain a lowercase letter')
      if not re.search(r'[0-9]', v):
          raise ValueError('Must contain a number')
      return v
  ```
  Error responses must stay generic ("Invalid credentials") to prevent username enumeration.

### 8. JWT Expiration Too Long (MEDIUM)
- **File:** `backend/app/config.py:9`
- **Current:** `jwt_expire_minutes: int = 1440  # 24 hours`
- **Risk:** Stolen tokens remain valid too long.
- **Fix:** Reduce to 60 minutes. Add a rotating refresh token:
  1. Add `refresh_token_hash` field to `Member` model.
  2. On login, store bcrypt hash of a random refresh token.
  3. Add `POST /auth/refresh` that accepts the refresh token and issues a new access token.
  4. Frontend stores the refresh token in httpOnly cookie (separate from access token cookie).

### 9. No HTTPS / HSTS Enforcement (MEDIUM)
- **File:** `backend/app/main.py`
- **Risk:** Tokens intercepted over HTTP.
- **Fix:** Render handles HTTPS termination. Configure Render to always redirect HTTP → HTTPS and enable HSTS. Backend trust proxy settings:
  ```python
  app = FastAPI(title="Rookies API", trusted_hosts=["your-backend.onrender.com"])
  ```

### 10. Status Field Not Validated on Component Updates (MEDIUM)
- **File:** `backend/app/features/components/schemas.py:47-51`
- **Current:** `status: str | None = None` — no enum restriction.
- **Risk:** Invalid status values could be stored.
- **Fix:** Add `Literal` type:
  ```python
  status: Literal["available", "in_use", "loaned", "under_maintenance", "decommissioned"] | None = None
  ```

### 11. Admin Self-Demotion Race Condition (MEDIUM)
- **File:** `backend/app/features/auth/service.py:64-68`
- **Risk:** Race condition if two admins demote themselves simultaneously.
- **Fix:** Use atomic check:
  ```python
  admin_count = Member.objects(role="admin", is_active=True).count()
  if admin_count <= 1 and member.role == "admin":
      raise HTTPException(403, "Cannot demote the only admin.")
  ```
  Consider wrapping in a retry loop or using `find_one_and_update` with a query that filters by `role != "admin" OR count() > 1`.

### 12. Client-Side Role Hiding (LOW — Acceptable)
- **File:** `frontend/src/components/Sidebar.tsx:50-57`
- **Note:** This is acceptable because the **backend** enforces role checks on every protected endpoint. UI hiding is cosmetic.
- **No change needed.** Document this so future devs don't waste time "fixing" it.

### 13. Activation Token bcrypt (LOW — Acceptable)
- **File:** `backend/app/features/auth/service.py:89`
- **Note:** bcrypt on a one-time setup token is slow but appropriate since account setup is infrequent. No change needed.

---

## Implementation Order

### Phase 1 — Quick Wins (Low effort, high impact)
1. Add security headers to `next.config.ts` [#6]
2. Add status `Literal` validation in component schemas [#10]
3. Add server-side attachment size validation in schemas [#14]
4. Harden admin self-demotion with atomic check [#11]

### Phase 2 — Auth Hardening (High impact, higher effort)
5. Fix JWT secret default → fail-fast on startup [#1]
6. Replace localStorage with httpOnly cookie for token [#2]
7. Add rate limiting on all auth endpoints [#3]
8. Add account lockout after failed attempts [#4]
9. Reduce JWT expiration + add refresh token endpoint [#8]

### Phase 3 — Infrastructure
10. Create Next.js `middleware.ts` for server-side route protection [#5]
11. Add password strength validation in Pydantic schemas [#7]
12. Configure HTTPS/HSTS in production deployment (Render dashboard) [#9]

---

## Affected Files Reference

| File | Changes |
|------|---------|
| `backend/app/config.py` | JWT secret fail-fast, expiration reduction |
| `backend/app/main.py` | slowapi rate limiter, CORS/HTTPS config |
| `backend/app/features/auth/models.py` | lockout fields (`failed_login_attempts`, `locked_until`) |
| `backend/app/features/auth/schemas.py` | password validation |
| `backend/app/features/auth/service.py` | lockout logic, atomic admin demotion |
| `backend/app/features/auth/routes.py` | httpOnly cookie, rate limits |
| `backend/app/features/components/schemas.py` | status `Literal`, attachment size |
| `backend/requirements.txt` | add `slowapi` |
| `backend/.env.example` | document `JWT_SECRET` generation |
| `frontend/src/lib/api.ts` | remove localStorage, use `credentials: "include"` |
| `frontend/src/middleware.ts` | new file — server-side auth guard |
| `frontend/next.config.ts` | security headers |
| `frontend/.env.example` | no changes needed |

---

## Verification Checklist

- [ ] `pytest tests/e2e/test_auth.py` — all pass after refactor
- [ ] Login brute force returns 429 after threshold
- [ ] Locked account returns 423 after lockout
- [ ] httpOnly cookie is set on login, sent on subsequent requests
- [ ] No token in localStorage after refactor (verify browser DevTools)
- [ ] Security headers present on all frontend responses
- [ ] Invalid component status returns 422
- [ ] `JWT_SECRET` not set → backend fails to start with clear error
- [ ] Password < 10 chars → activation returns 422 with generic message
- [ ] CSP doesn't break the app (check `npm run build` for console errors)