# Backend Migration zu httpOnly Cookies - Briefing

**Datum:** 2025-11-15
**Projekt:** make-ki-frontend & make-ki-backend
**Ziel:** Migration von localStorage JWT-Tokens zu httpOnly Cookies für verbesserte Sicherheit

---

## 🎯 Überblick

Das Frontend wurde bereits auf Token-Expiry-Validierung und sichere Token-Handhabung optimiert. Der nächste Schritt ist die Migration zu **httpOnly Cookies**, um XSS-Angriffe zu verhindern.

### Aktuelle Situation (Frontend)

**Login-Flow:**
1. User gibt Email ein (`/login.html`)
2. Backend sendet Einmal-Code per Email (`POST /api/auth/request-code`)
3. User gibt Code ein
4. Backend validiert Code und gibt JWT-Token zurück (`POST /api/auth/login`)
5. Frontend speichert Token in `localStorage.setItem('jwt', data.token)`
6. User wird zu `/formular/index.html` weitergeleitet
7. Formular wird ausgefüllt (`formbuilder_de_SINGLE_FULL.js`)
8. Formular-Daten werden ans Backend gesendet mit `Authorization: Bearer <token>`

### Problem

**Sicherheitslücke:** JWT-Token in localStorage ist anfällig für XSS-Angriffe:
- Jeder JavaScript-Code kann Token auslesen
- Bei XSS-Injection kann Angreifer Token stehlen
- Token kann nicht mit httpOnly, Secure, SameSite Flags geschützt werden

### Lösung

**httpOnly Cookies:**
- Backend setzt Cookie bei Login (nicht JS-lesbar)
- Cookie wird automatisch bei jedem Request mitgesendet
- XSS kann Cookie nicht auslesen
- Zusätzliche Sicherheit durch Cookie-Flags

---

## 📋 Backend-Anforderungen

### Bekannte Backend-Struktur

**Technologie:** Vermutlich FastAPI oder Flask (Python)
**Basis-URL:** `/api`
**Deployment:** Railway (laut Code-Kommentaren)

**Bestehende Endpoints:**

#### Auth-Endpoints
```
POST /api/auth/request-code
Body: { "email": "user@example.com" }
Response: { "success": true } oder 404/429
- Sendet Einmal-Code per Email
- Rate-Limiting vorhanden
- Idempotency-Key Support

POST /api/auth/login
Body: { "email": "user@example.com", "code": "123456" }
Response: { "token": "eyJ..." }
- Validiert Code
- Gibt JWT-Token zurück (AKTUELL in Response Body)
- Fehler: 400 (invalid_code), 404 (unknown_email), 429 (rate_limited)
```

#### Form/Briefing-Endpoints
```
POST /api/analyze
Authorization: Bearer <token>
Body: { formData }
- Verarbeitet Formular-Daten

GET /api/result/{reportId}
Authorization: Bearer <token>
- Gibt Ergebnis zurück

POST /api/feedback
Authorization: Bearer <token>
Body: { feedback_data }
- Speichert Feedback

GET /api/briefings/{briefing_id}
Authorization: Bearer <token>
- Lädt Briefing zum Prefill
```

#### Admin-Endpoints
```
GET /api/admin/briefings/{id}
GET /api/admin/briefings/{id}/latest-analysis
GET /api/admin/briefings/{id}/reports
POST /api/admin/briefings/{id}/rerun
GET /api/admin/analyses/{id}/html
GET /api/stats?start=...&end=...
GET /api/feedback-logs
GET /api/export-logs?start=...&end=...
GET /api/export-feedback
```

### Token-Struktur (JWT)

**Payload (aktuell):**
```json
{
  "email": "user@example.com",
  "sub": "user@example.com",
  "exp": 1731686400,
  // weitere Claims
}
```

---

## 🔨 Erforderliche Backend-Änderungen

### 1. Login-Endpoint anpassen (`/api/auth/login`)

**Aktuell:**
```python
@app.post("/auth/login")
async def login(data: LoginRequest):
    # Code validieren
    user = validate_code(data.email, data.code)
    if not user:
        raise HTTPException(400, detail={"error": "invalid_code"})

    # Token erstellen
    token = create_jwt(user)

    # AKTUELL: Token im Response Body
    return {"token": token}
```

**NEU (Phase 1 - Hybrid):**
```python
@app.post("/auth/login")
async def login(data: LoginRequest):
    # Code validieren
    user = validate_code(data.email, data.code)
    if not user:
        raise HTTPException(400, detail={"error": "invalid_code"})

    # Token erstellen
    token = create_jwt(user)

    # Response mit Cookie UND Token (Hybrid-Modus)
    response = JSONResponse({
        "success": True,
        "email": user.email,
        "token": token  # Temporär für alte Clients
    })

    # httpOnly Cookie setzen
    response.set_cookie(
        key="auth_token",
        value=token,
        httponly=True,        # Nicht von JavaScript lesbar
        secure=True,          # Nur über HTTPS (in Production)
        samesite="lax",       # CSRF-Schutz
        max_age=3600,         # 1 Stunde (anpassen nach Bedarf)
        path="/",
        domain=None           # Oder spezifische Domain
    )

    return response
```

**NEU (Phase 2 - Nur Cookie):**
```python
# Token im Response Body entfernen
return JSONResponse({
    "success": True,
    "email": user.email
})
# Cookie bleibt
```

---

### 2. Neuer Endpoint: `/api/auth/me`

**Zweck:** User-Info abrufen (für Email-Anzeige, Token-Validierung)

```python
from fastapi import Cookie, HTTPException

@app.get("/auth/me")
async def get_current_user(auth_token: str = Cookie(None)):
    """
    Gibt Informationen über den aktuell eingeloggten User zurück.
    Wird vom Frontend genutzt für:
    - Email-Anzeige im UI
    - Prüfung ob noch eingeloggt
    - Token-Expiry-Info
    """
    if not auth_token:
        raise HTTPException(401, detail="Not authenticated")

    try:
        payload = decode_jwt(auth_token)
        return {
            "email": payload.get("email") or payload.get("sub"),
            "exp": payload.get("exp"),
            "is_admin": payload.get("is_admin", False)  # falls relevant
        }
    except JWTError:
        raise HTTPException(401, detail="Invalid token")
```

---

### 3. Neuer Endpoint: `/api/auth/logout`

**Zweck:** Cookie löschen (serverseitig)

```python
@app.post("/auth/logout")
async def logout():
    """
    Löscht das Auth-Cookie.
    Frontend ruft dies beim Logout auf.
    """
    response = JSONResponse({"success": True})
    response.delete_cookie(
        key="auth_token",
        path="/",
        domain=None  # Muss mit set_cookie übereinstimmen
    )
    return response
```

---

### 4. Auth-Dependency anpassen

**Aktuell (vermutlich):**
```python
from fastapi import Depends, Header, HTTPException

def get_current_user(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(401)
    token = authorization[7:]
    payload = decode_jwt(token)
    return payload
```

**NEU (Hybrid - Cookie UND Header):**
```python
from fastapi import Depends, Header, Cookie, HTTPException
from typing import Optional

def get_current_user(
    authorization: Optional[str] = Header(None),
    auth_token: Optional[str] = Cookie(None)
):
    """
    Akzeptiert Token aus Cookie ODER Authorization Header.
    Priorität: Cookie > Header (Cookie ist sicherer)
    """
    token = None

    # 1. Versuch: Cookie
    if auth_token:
        token = auth_token
    # 2. Versuch: Authorization Header (Fallback)
    elif authorization and authorization.startswith("Bearer "):
        token = authorization[7:]

    if not token:
        raise HTTPException(401, detail="Not authenticated")

    try:
        payload = decode_jwt(token)
        return payload
    except JWTError as e:
        raise HTTPException(401, detail="Invalid token")
```

**NEU (Phase 2 - Nur Cookie):**
```python
def get_current_user(auth_token: str = Cookie(None)):
    if not auth_token:
        raise HTTPException(401, detail="Not authenticated")

    try:
        payload = decode_jwt(auth_token)
        return payload
    except JWTError:
        raise HTTPException(401, detail="Invalid token")
```

---

### 5. Alle geschützten Endpoints aktualisieren

**Beispiel - Aktuell:**
```python
@app.post("/api/analyze")
async def analyze(data: dict, user = Depends(get_current_user)):
    # user enthält JWT-Payload
    pass
```

**Bleibt gleich!** Die Dependency `get_current_user` wird aktualisiert (siehe oben), aber die Endpoint-Signatur bleibt identisch.

---

### 6. CORS-Konfiguration prüfen

**WICHTIG:** Falls Frontend und Backend auf verschiedenen Domains/Ports laufen:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://your-frontend-domain.com"
    ],
    allow_credentials=True,  # KRITISCH für Cookies!
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**Ohne `allow_credentials=True` funktionieren Cookies NICHT bei Cross-Origin!**

---

## 🧪 Test-Szenarien

### 1. Login-Flow testen

**Test:**
```bash
# Request Code
curl -X POST http://localhost:8000/api/auth/request-code \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'

# Login (sollte Cookie setzen)
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "code": "123456"}' \
  -c cookies.txt \
  -v

# Sollte Set-Cookie Header zeigen:
# Set-Cookie: auth_token=eyJ...; HttpOnly; Secure; SameSite=Lax; Path=/
```

### 2. Geschützte Endpoints mit Cookie

**Test:**
```bash
# Mit Cookie
curl http://localhost:8000/api/auth/me \
  -b cookies.txt

# Sollte User-Info zurückgeben
```

### 3. Hybrid-Modus: Cookie UND Bearer

**Test:**
```bash
# Mit Bearer Token (Fallback)
curl http://localhost:8000/api/auth/me \
  -H "Authorization: Bearer eyJ..."

# Sollte auch funktionieren (während Hybrid-Phase)
```

### 4. Logout-Flow

**Test:**
```bash
curl -X POST http://localhost:8000/api/auth/logout \
  -b cookies.txt \
  -c cookies_after.txt \
  -v

# Sollte Cookie löschen (Max-Age=0 oder Expires in Vergangenheit)
```

### 5. 401 bei fehlendem/ungültigem Cookie

**Test:**
```bash
curl http://localhost:8000/api/auth/me
# Sollte 401 zurückgeben
```

---

## 🔄 Migrations-Phasen

### Phase 1: Backend Hybrid-Modus (Start hier!)

**Backend-Änderungen:**
- [x] Login setzt Cookie **zusätzlich** zu Token in Response
- [x] `get_current_user` akzeptiert Cookie **oder** Bearer Header
- [x] Neue Endpoints: `/auth/me`, `/auth/logout`
- [x] CORS mit `allow_credentials=True`

**Frontend:** Keine Änderungen nötig, läuft weiter mit localStorage

**Vorteil:** Backend ist bereit, aber Frontend kann schrittweise migriert werden

---

### Phase 2: Frontend-Migration (Nach Backend Phase 1)

**Frontend-Änderungen:**
- Login speichert nur noch Email, nicht Token
- API-Helper entfernen Token-Header-Logik
- Guards nutzen `/auth/me` oder warten auf 401
- Logout ruft `/auth/logout` auf

**Backend:** Keine Änderungen, läuft im Hybrid-Modus

---

### Phase 3: Backend nur Cookie (Optional, später)

**Backend-Änderungen:**
- Login-Response enthält **kein** `token`-Feld mehr
- `get_current_user` akzeptiert **nur** Cookie
- Bearer-Support entfernen

**Frontend:** Muss bereits migriert sein (Phase 2)

---

## 📁 Datei-Struktur (Backend)

**Vermutete Struktur:**
```
backend/
├── main.py oder app.py
│   ├── FastAPI/Flask App-Initialisierung
│   └── CORS-Middleware
├── auth/
│   ├── __init__.py
│   ├── routes.py         # /auth/login, /auth/request-code
│   ├── dependencies.py   # get_current_user
│   └── utils.py          # create_jwt, decode_jwt, send_email
├── api/
│   ├── analyze.py        # /api/analyze
│   ├── briefings.py      # /api/briefings/*
│   ├── admin.py          # /api/admin/*
│   └── feedback.py       # /api/feedback
└── requirements.txt
```

---

## 🎯 Konkrete Aufgaben für nächsten Chat

### Priorität 1: MUSS (Phase 1)
1. **Login-Endpoint:** Cookie setzen (zusätzlich zu Token in Response)
2. **Auth-Dependency:** Cookie-Token akzeptieren (zusätzlich zu Bearer)
3. **Neuer Endpoint:** `GET /auth/me`
4. **Neuer Endpoint:** `POST /auth/logout`
5. **CORS:** `allow_credentials=True` aktivieren

### Priorität 2: SOLL
6. Cookie-Parameter tunen (max_age, domain, secure basierend auf Environment)
7. Tests schreiben für neue Endpoints
8. Logging für Cookie-basierte Auth

### Priorität 3: KANN
9. Session-Management (Token-Refresh)
10. Admin-Only Cookies (für Admin-Endpoints)

---

## 🔍 Wichtige Hinweise

### Security Best Practices

**Cookie-Flags:**
```python
httponly=True   # IMMER aktivieren (verhindert XSS)
secure=True     # In Production IMMER (nur HTTPS)
samesite="lax"  # Gegen CSRF, "strict" für höchste Sicherheit
```

**Token-Expiry:**
- Aktuell: JWT enthält `exp` Claim
- Cookie `max_age` sollte mit JWT `exp` übereinstimmen
- Frontend prüft nicht mehr Expiry (Cookie-Expiry ist Browser-Job)

**Development vs Production:**
```python
import os

ENVIRONMENT = os.getenv("ENVIRONMENT", "development")

response.set_cookie(
    key="auth_token",
    value=token,
    httponly=True,
    secure=(ENVIRONMENT == "production"),  # Nur HTTPS in Production
    samesite="lax",
    ...
)
```

### CORS bei Cross-Origin

**Wichtig wenn Frontend ≠ Backend Domain:**

```python
# Frontend: http://localhost:3000
# Backend:  http://localhost:8000

# Backend MUSS:
allow_origins=["http://localhost:3000"]
allow_credentials=True

# Frontend MUSS:
fetch(url, { credentials: 'include' })
```

**Fehler ohne `allow_credentials`:**
```
Access to fetch at 'http://localhost:8000/api/auth/me' from origin
'http://localhost:3000' has been blocked by CORS policy:
The value of the 'Access-Control-Allow-Credentials' header in the
response is '' which must be 'true' when the request's credentials
mode is 'include'.
```

---

## 📞 Kontaktpunkte Frontend ↔ Backend

### 1. Login
**Frontend:** `js/login.js:157-169`
```javascript
POST /api/auth/login
Body: { email, code }
Aktuell erwartet: { token: "eyJ..." }
Zukünftig erwartet: { success: true, email: "..." }
+ Set-Cookie Header
```

### 2. Token-Verwendung
**Frontend-Dateien die Token nutzen:**
- `js/api.js` - API-Helper
- `formular/api.js` - API-Helper
- `formular/boot.js` - JWT-Guard
- `formular/index.html` - JWT-Guard
- `formular/admin.html` - JWT-Guard + API-Calls
- `admin/detail.js` - API-Helper
- `formular/formbuilder_de_SINGLE_FULL.js` - Form-Submit

### 3. Email-Extraktion
**Frontend:** `formular/report.html:187-209`
```javascript
// Aktuell: Email aus JWT-Payload
const payload = JSON.parse(atob(token.split('.')[1]));
userEmail = payload.email;

// Zukünftig: Email aus /auth/me oder localStorage
```

---

## ✅ Checkliste für Backend-Entwickler

- [ ] Code-Repo geklont und lokale Entwicklung aufgesetzt
- [ ] Aktuellen Login-Flow verstanden (`/auth/request-code` + `/auth/login`)
- [ ] JWT-Token-Erstellung und -Validierung lokalisiert
- [ ] `get_current_user` Dependency gefunden
- [ ] CORS-Middleware lokalisiert
- [ ] Login-Endpoint angepasst (Cookie setzen)
- [ ] Auth-Dependency angepasst (Cookie akzeptieren)
- [ ] `/auth/me` Endpoint erstellt
- [ ] `/auth/logout` Endpoint erstellt
- [ ] CORS `allow_credentials=True` aktiviert
- [ ] Lokale Tests durchgeführt (curl/Postman)
- [ ] Frontend-Kompatibilität geprüft (Hybrid-Modus)
- [ ] Environment-Variable für `secure` Flag
- [ ] Deployment vorbereitet (Railway Config)

---

## 🚀 Quick-Start für Backend-Chat

**Initiale Anweisung für neuen Chat:**

```
Ich möchte das Backend für httpOnly Cookie-Authentication anpassen.

Kontext:
- FastAPI/Flask Backend für KI-Readiness-Fragebogen
- Aktuell: JWT-Token im Response Body, Frontend speichert in localStorage
- Ziel: JWT-Token als httpOnly Cookie setzen (XSS-Schutz)

Bitte:
1. Zeige mir die aktuelle Struktur der Auth-Endpoints
2. Passe /auth/login an: Cookie setzen (Hybrid-Modus)
3. Passe get_current_user an: Cookie UND Bearer akzeptieren
4. Erstelle /auth/me Endpoint
5. Erstelle /auth/logout Endpoint
6. Prüfe/aktiviere CORS allow_credentials

Siehe BACKEND_MIGRATION_BRIEFING.md für Details.
```

---

## 📚 Referenzen

**Frontend-Änderungen (bereits committed):**
- Commit: `c452424` - "Fix kritische Fehler in Token-Mechanik und Sicherheitslücken"
- Branch: `claude/check-github-token-errors-017CgQP3M6ZGzp41KLHyrB3f`

**Geänderte Frontend-Dateien:**
- `js/api.js` - Token-Expiry + isTokenExpired
- `formular/api.js` - Token-Fix + 401-Handling
- `formular/boot.js` - Expiry-Check
- `formular/index.html` - JWT-Guard
- `formular/admin.html` - Sichere Downloads
- `admin/detail.js` - Token-Validierung

**Nächste Schritte:**
1. Backend-Migration (dieser Chat)
2. Frontend-Anpassung auf Cookie-basierte Auth
3. Testing & Deployment

---

**Ende des Briefings**
