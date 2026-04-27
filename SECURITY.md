# Security Policy

## Vulnerability Reporting

Wenn Sie eine Sicherheitslücke in diesem Projekt entdecken, melden Sie diese bitte
**vertraulich** und **nicht** über öffentliche GitHub Issues.

### Kontakt

- **E-Mail:** wolf@ki-sicherheit.jetzt
- **Bevorzugt:** PGP-verschlüsselt (Schlüssel auf Anfrage)

### Was bitte mitschicken

- Beschreibung der Schwachstelle (Klasse, betroffene Komponente)
- Reproduktionsschritte / Proof-of-Concept
- Impact-Einschätzung (welche Daten, welche Nutzer)
- Ihre Kontaktdaten für Rückfragen

### Was Sie erwartet

- **24 h:** Eingangsbestätigung
- **72 h:** Erste Einschätzung (akzeptiert/abgelehnt + grobe Severity)
- **30 Tage:** Patch oder Workaround für High/Critical
- Abstimmung über Disclosure-Zeitplan, Credits in Release-Notes auf Wunsch

## Scope

Dieses Repo enthält das **statische Frontend** (HTML/JS/CSS) für ki-sicherheit.jetzt.
Backend-Schwachstellen (Railway/FastAPI-Service) bitte ebenfalls an die Adresse oben —
wir routen intern.

## Out of Scope

- Findings, die nur bei modifiziertem Browser/Client reproduzierbar sind
- DoS-Tests gegen die Live-Infrastruktur (bitte erst absprechen)
- Best-Practice-Hinweise ohne konkreten Exploit (gerne separat als Issue)

## Hall of Fame

Reporter mit gültigen Findings werden — sofern gewünscht — namentlich
in den Release-Notes des entsprechenden Patches genannt.
