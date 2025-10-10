# filename: scripts/ci_check_schema_frontend.py
# Validate that index pages include schema scripts and meta; warn if not.
import re, sys, pathlib

ROOT = pathlib.Path(__file__).resolve().parents[1]
pages = [ROOT / "index.html", ROOT / "index_en.html"]

errs = []
for p in pages:
    try:
        html = p.read_text(encoding="utf-8")
    except Exception as e:
        errs.append(f"missing {p.name}: {e}")
        continue
    if 'name="api-base"' not in html:
        errs.append(f"{p.name}: missing <meta name='api-base'>")
    if "schema_client.js" not in html:
        errs.append(f"{p.name}: missing schema_client.js")
    if "schema_autofill.js" not in html:
        errs.append(f"{p.name}: missing schema_autofill.js")

if errs:
    print("Schema Frontend Guard failed:")
    for e in errs:
        print(" -", e)
    sys.exit(2)

print("Frontend schema guards OK")
