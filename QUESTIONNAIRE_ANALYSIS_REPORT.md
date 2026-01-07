# Questionnaire Analysis Report

**Date:** 2026-01-07
**Analyzed:** `formular/formbuilder_de_SINGLE_FULL.js` vs `formular/formbuilder_en_SINGLE_FULL.js`
**DE File:** 908 lines
**EN File:** 904 lines

---

## Executive Summary

Deep analysis of both questionnaire files reveals several critical issues requiring immediate attention:

| Metric | Value |
|--------|-------|
| Total DE Fields | 50 |
| Total EN Fields | 49 |
| Critical Issues | 4 |
| Important Issues | 3 |
| Minor Issues | 2 |

**Key Findings:**
- EN COMPANY_SIZE uses wrong values (`solo`/`team`/`kmu` instead of `1`/`2–10`/`11–100`)
- EN is missing the `gastronomie` branch (12 branches vs 13 in DE)
- DE has a bug in showIf logic (line 283) - checks for `"solo"` but values are `"1"`
- EN uses hyphen (-) instead of en-dash (–) in number ranges

---

## 1. Field Inventory

### DE Fields (50 total):

**Block 1 - Firmendaten & Branche (11 keys):**
1. `branche` - Industry selector
2. `unternehmensgroesse` - Company size
3. `selbststaendig` - Business type for solo (conditional)
4. `bundesland` - German state (conditional, DE-only)
5. `country` - Country selector with optgroups
6. `hauptleistung` - Main service (textarea)
7. `zielgruppen` - Target groups (checkbox)
8. `jahresumsatz` - Annual revenue
9. `it_infrastruktur` - IT infrastructure
10. `interne_ki_kompetenzen` - Internal AI competence
11. `datenquellen` - Data sources (checkbox)

**Block 2 - Status Quo (5 keys):**
12. `digitalisierungsgrad` - Digitalization level (slider)
13. `prozesse_papierlos` - Paperless processes
14. `automatisierungsgrad` - Automation level
15. `ki_einsatz` - Current AI usage (checkbox)
16. `ki_kompetenz` - Team AI competence

**Block 3 - Ziele & Use Cases (7 keys):**
17. `ki_ziele` - AI goals (checkbox)
18. `ki_projekte` - Existing AI projects (textarea)
19. `anwendungsfaelle` - Use cases (checkbox)
20. `zeitersparnis_prioritaet` - Time-saving priority (textarea)
21. `pilot_bereich` - Best pilot area
22. `geschaeftsmodell_evolution` - Business model evolution (textarea)
23. `vision_3_jahre` - 3-year vision (textarea)

**Block 4 - Strategie & Governance (6 keys):**
24. `strategische_ziele` - Strategic goals (textarea)
25. `ki_guardrails` - AI guardrails (textarea)
26. `massnahmen_komplexitaet` - Implementation complexity
27. `roadmap_vorhanden` - Roadmap available
28. `governance_richtlinien` - Governance guidelines
29. `change_management` - Change willingness

**Block 5 - Ressourcen & Präferenzen (5 keys):**
30. `zeitbudget` - Time budget
31. `vorhandene_tools` - Existing tools (checkbox)
32. `regulierte_branche` - Regulated industry (checkbox)
33. `trainings_interessen` - Training interests (checkbox)
34. `vision_prioritaet` - Strategic priority

**Block 6 - Rechtliches & Compliance (7 keys):**
35. `datenschutzbeauftragter` - DPO available
36. `technische_massnahmen` - Technical measures
37. `folgenabschaetzung` - DPIA status
38. `meldewege` - Incident reporting
39. `loeschregeln` - Deletion rules
40. `ai_act_kenntnis` - EU AI Act knowledge
41. `ki_hemmnisse` - AI barriers (checkbox)

**Block 7 - Förderung & Investition (8 keys):**
42. `bisherige_foerdermittel` - Previous funding
43. `interesse_foerderung` - Funding interest
44. `erfahrung_beratung` - Previous consulting
45. `investitionsbudget` - Investment budget
46. `marktposition` - Market position
47. `benchmark_wettbewerb` - Competitor comparison
48. `innovationsprozess` - Innovation process
49. `risikofreude` - Risk appetite (slider)

**Block 8 - Datenschutz & Absenden (1 key):**
50. `datenschutz` - Privacy consent

---

### EN Fields (49 total):

**Differences from DE:**

| DE Field | EN Equivalent | Status |
|----------|---------------|--------|
| `selbststaendig` | `business_type` | Different key (intentional) |
| `bundesland` | - | **MISSING** (intentional for international) |
| `bisherige_foerdermittel` | Same key | **hidden: true** |
| `interesse_foerderung` | Same key | **hidden: true** |

**EN Block 1 keys (10 instead of 11):**
`branche`, `unternehmensgroesse`, `business_type`, `country`, `hauptleistung`, `zielgruppen`, `jahresumsatz`, `it_infrastruktur`, `interne_ki_kompetenzen`, `datenquellen`

---

## 2. Branch Analysis

### DE Branches (13 options) - Lines 259-268:

| # | Value | Label (DE) |
|---|-------|------------|
| 1 | `marketing` | Marketing & Werbung |
| 2 | `beratung` | Beratung & Dienstleistungen |
| 3 | `it` | IT & Software |
| 4 | `finanzen` | Finanzen & Versicherungen |
| 5 | `handel` | Handel & E-Commerce |
| 6 | `bildung` | Bildung |
| 7 | `verwaltung` | Verwaltung |
| 8 | `gesundheit` | Gesundheit & Pflege |
| 9 | `bau` | Bauwesen & Architektur |
| 10 | `medien` | Medien & Kreativwirtschaft |
| 11 | `industrie` | Industrie & Produktion |
| 12 | `logistik` | Transport & Logistik |
| 13 | `gastronomie` | Gastronomie & Tourismus |

### EN Branches (12 options) - Lines 258-266:

| # | Value | Label (EN) | Status |
|---|-------|------------|--------|
| 1 | `marketing` | Marketing & Advertising | ✅ |
| 2 | `beratung` | Consulting & Services | ✅ |
| 3 | `it` | IT & Software | ✅ |
| 4 | `finanzen` | Finance & Insurance | ✅ |
| 5 | `handel` | Retail & E-Commerce | ✅ |
| 6 | `bildung` | Education | ✅ |
| 7 | `verwaltung` | Public Administration | ✅ |
| 8 | `gesundheit` | Healthcare | ✅ |
| 9 | `bau` | Construction & Architecture | ✅ |
| 10 | `medien` | Media & Creative Industries | ✅ |
| 11 | `industrie` | Manufacturing & Production | ✅ |
| 12 | `logistik` | Transport & Logistics | ✅ |
| 13 | `gastronomie` | - | ❌ **MISSING** |

### 🔴 CRITICAL: Missing Branch

**EN is missing `gastronomie` (Hospitality & Tourism)**

Expected addition:
```javascript
{ value: "gastronomie", label: "Hospitality & Tourism" }
```

---

## 3. COMPANY_SIZE Analysis (unternehmensgroesse)

### DE Values (Lines 271-274) - CORRECT:

```javascript
{ value: "1", label: "1 (Solo-Selbstständig/Freiberuflich)" }
{ value: "2–10", label: "2–10 (Kleines Team)" }
{ value: "11–100", label: "11–100 (KMU)" }
```

**Key observations:**
- Values are numeric strings: `"1"`, `"2–10"`, `"11–100"`
- Uses en-dash (–, U+2013) in ranges, NOT hyphen (-)

### EN Values (Lines 269-272) - INCORRECT:

```javascript
{ value: "solo", label: "1 (Solo/Freelancer)" }
{ value: "team", label: "2-10 (Small Team)" }
{ value: "kmu", label: "11-100 (SME)" }
```

### 🔴 CRITICAL Issues Found:

| Issue | Current (EN) | Should Be |
|-------|--------------|-----------|
| Value 1 | `"solo"` | `"1"` |
| Value 2 | `"team"` | `"2–10"` (en-dash) |
| Value 3 | `"kmu"` | `"11–100"` (en-dash) |
| Label ranges | Uses hyphen `-` | Should use en-dash `–` |

### Character Analysis:

```
En-dash: – (U+2013) - used for ranges
Hyphen: - (U+002D) - used for compound words

DE correctly uses: 2–10, 11–100 (en-dash)
EN incorrectly uses: 2-10, 11-100 (hyphen)
```

### Required Fix:

```javascript
// EN BEFORE:
{ value: "solo", label: "1 (Solo/Freelancer)" }
{ value: "team", label: "2-10 (Small Team)" }
{ value: "kmu", label: "11-100 (SME)" }

// EN AFTER:
{ value: "1", label: "1 (Solo/Freelancer)" }
{ value: "2–10", label: "2–10 (Small Team)" }
{ value: "11–100", label: "11–100 (SME)" }
```

---

## 4. Conditional Logic Analysis

### All showIf Functions Found:

**DE File:**

| Line | Field | Condition | Status |
|------|-------|-----------|--------|
| 283 | `selbststaendig` | `data.unternehmensgroesse === "solo"` | ❌ **BUG** |
| 294 | `bundesland` | `data.country === "DE" \|\| !data.country` | ✅ OK |

**EN File:**

| Line | Field | Condition | Status |
|------|-------|-----------|--------|
| 281 | `business_type` | `data.unternehmensgroesse === "solo"` | ⚠️ Works now, breaks after fix |

### 🔴 CRITICAL: DE showIf Bug (Line 283)

```javascript
// CURRENT (BUG):
showIf: function (data) { return data.unternehmensgroesse === "solo"; }

// The values are "1", "2–10", "11–100" - NOT "solo"!
// This condition will NEVER match.

// FIX:
showIf: function (data) { return data.unternehmensgroesse === "1"; }
```

### 🔴 CRITICAL: EN showIf Cascading Fix Required (Line 281)

After fixing EN COMPANY_SIZE values, the EN showIf must also change:

```javascript
// CURRENT (works with current wrong values):
showIf: function (data) { return data.unternehmensgroesse === "solo"; }

// AFTER FIXING VALUES (must update):
showIf: function (data) { return data.unternehmensgroesse === "1"; }
```

---

## 5. Payload Construction Analysis

### DE Payload (Lines 739-769):

```javascript
payload.branche = data.branche || payload.branche || "";
payload.unternehmensgroesse = data.unternehmensgroesse || payload.unternehmensgroesse || "";
payload.country = data.country || payload.country || "DE";  // ← Default: "DE"
payload.bundesland = data.bundesland || payload.bundesland || "";
payload.hauptleistung = data.hauptleistung || payload.hauptleistung || "";
```

### EN Payload (Lines 736-747):

```javascript
payload.branche = data.branche || payload.branche || "";
payload.unternehmensgroesse = data.unternehmensgroesse || payload.unternehmensgroesse || "";
payload.country = data.country || payload.country || "";  // ← Default: "" (no default)
// NO bundesland
payload.hauptleistung = data.hauptleistung || payload.hauptleistung || "";
```

### robustSubmitForm Label Collection:

**DE (Lines 867-871):**
```javascript
payload.branche_label = _collectLabelFor("branche", payload.branche);
payload.unternehmensgroesse_label = _collectLabelFor("unternehmensgroesse", payload.unternehmensgroesse);
payload.country_label = _collectLabelFor("country", payload.country);
payload.bundesland_label = _collectLabelFor("bundesland", payload.bundesland);
payload.jahresumsatz_label = _collectLabelFor("jahresumsatz", data.jahresumsatz || "");
```

**EN (Lines 864-867):**
```javascript
payload.branche_label = _collectLabelFor("branche", payload.branche);
payload.unternehmensgroesse_label = _collectLabelFor("unternehmensgroesse", payload.unternehmensgroesse);
payload.country_label = _collectLabelFor("country", payload.country);
// NO bundesland_label (intentional - no bundesland field)
payload.jahresumsatz_label = _collectLabelFor("jahresumsatz", data.jahresumsatz || "");
```

### Payload Status: ✅ OK

Both files use consistent patterns. The `_collectLabelFor` helper will correctly resolve labels based on the values in the fields array.

---

## 6. Structure & Flow Analysis

### Block Comparison:

| Block # | DE Title | EN Title | DE Keys | EN Keys | Match |
|---------|----------|----------|---------|---------|-------|
| 1 | Firmendaten & Branche | Company Data & Industry | 11 | 10 | ⚠️ |
| 2 | Status Quo | Status Quo | 5 | 5 | ✅ |
| 3 | Ziele & Use Cases | Goals & Use Cases | 7 | 7 | ✅ |
| 4 | Strategie & Governance | Strategy & Governance | 6 | 6 | ✅ |
| 5 | Ressourcen & Präferenzen | Resources & Preferences | 5 | 5 | ✅ |
| 6 | Rechtliches & Compliance | Legal & Compliance | 7 | 7 | ✅ |
| 7 | Förderung & Investition | Investment Framework | 8 | 6* | ⚠️ |
| 8 | Datenschutz & Absenden | Privacy & Submit | 1 | 1 | ✅ |

*EN Block 7 has 6 visible keys (2 hidden: `bisherige_foerdermittel`, `interesse_foerderung`)

### Block 1 Differences:

**DE Block 1 keys:**
```javascript
["branche", "unternehmensgroesse", "selbststaendig", "country", "bundesland",
 "hauptleistung", "zielgruppen", "jahresumsatz", "it_infrastruktur",
 "interne_ki_kompetenzen", "datenquellen"]
```

**EN Block 1 keys:**
```javascript
["branche", "unternehmensgroesse", "business_type", "country",
 "hauptleistung", "zielgruppen", "jahresumsatz", "it_infrastruktur",
 "interne_ki_kompetenzen", "datenquellen"]
```

**Differences:**
- `selbststaendig` → `business_type` (different key for same purpose)
- `bundesland` not present in EN (intentional - Germany-specific)

---

## Issues Summary

### 🔴 CRITICAL (Must Fix):

1. **EN COMPANY_SIZE Values Wrong** (Line 269-272)
   - Values: `"solo"`, `"team"`, `"kmu"`
   - Should be: `"1"`, `"2–10"`, `"11–100"`
   - Impact: Backend receives inconsistent data

2. **EN Missing gastronomie Branch** (Line 265)
   - Only 12 branches instead of 13
   - Impact: Users in hospitality industry cannot select their sector

3. **DE showIf Bug** (Line 283)
   - Condition: `data.unternehmensgroesse === "solo"`
   - Should be: `data.unternehmensgroesse === "1"`
   - Impact: `selbststaendig` field NEVER shows for solo users

4. **EN showIf Will Break** (Line 281)
   - Currently works with wrong values
   - Must be updated when values are fixed
   - Impact: `business_type` won't show after value fix

### 🟡 IMPORTANT (Should Fix):

1. **EN Uses Hyphen Instead of En-dash**
   - Labels: `"2-10"`, `"11-100"` should be `"2–10"`, `"11–100"`
   - Impact: Visual inconsistency

2. **Different Field Keys** (Design Decision)
   - DE: `selbststaendig` → EN: `business_type`
   - Impact: Backend must handle both keys

3. **EN Missing bundesland** (Intentional)
   - Only relevant for German regional funding
   - Impact: None for international users

### 🟢 MINOR (Nice to Fix):

1. **EN Hidden Funding Fields**
   - `bisherige_foerdermittel`, `interesse_foerderung` have `hidden: true`
   - This is intentional for non-DE users

2. **Block Key Count Differences**
   - Block 1: DE has 11 keys, EN has 10 (due to bundesland)
   - Block 7: DE has 8 keys, EN has 6 visible (2 hidden)

---

## Recommendations

### Fix Priority:

1. **FIRST: Fix DE showIf bug** (Line 283)
   - Quick fix, independent of other changes
   - Currently broken in production

2. **SECOND: Fix EN COMPANY_SIZE values** (Lines 269-272)
   - Change values to match DE
   - Use en-dash for ranges

3. **THIRD: Fix EN showIf** (Line 281)
   - Must be done AFTER or WITH value fix
   - Change `"solo"` to `"1"`

4. **FOURTH: Add gastronomie branch to EN** (Line 265)
   - Add missing option
   - Ensure same position as DE (last)

### Implementation Strategy:

```
1. Create backup of both files
2. Fix DE Line 283: "solo" → "1"
3. Fix EN Lines 269-272: Values and labels with en-dash
4. Fix EN Line 281: "solo" → "1"
5. Add EN Line 265: gastronomie branch
6. Validate both files
7. Test conditional logic
8. Commit with detailed message
```

---

## Ready for Phase 2: Sync & Fix

Based on this analysis, proceed with:

### DE Fixes:
- [ ] Line 283: showIf `"solo"` → `"1"`

### EN Sync:
- [ ] Lines 269-272: COMPANY_SIZE values `"solo"`/`"team"`/`"kmu"` → `"1"`/`"2–10"`/`"11–100"`
- [ ] Lines 269-272: Labels use en-dash (–) not hyphen (-)
- [ ] Line 281: showIf `"solo"` → `"1"`
- [ ] Line 265: Add `{ value: "gastronomie", label: "Hospitality & Tourism" }`

### Testing Plan:
1. Verify field counts match expected
2. Test COMPANY_SIZE selector renders correct values
3. Test conditional fields appear when company size = "1"
4. Test all 13 branches appear in dropdown
5. Verify form submission payload contains correct values
