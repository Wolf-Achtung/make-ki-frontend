/* ========================================================================
 * Smart-Chips Suggestion-Map (DE) — Sprint C1 MVP
 *
 * Kontextuelle Vorschlags-Chips für Freitext-Felder im Chat-Widget.
 * Wird im Browser VOR chat-widget.js geladen. Setzt window.SMART_CHIPS_DE
 * und window.getSmartChips(fieldKey, branche).
 *
 * ------------------------------------------------------------------------
 * Pflege-Regeln (verbindlich)
 * ------------------------------------------------------------------------
 *  1. Max. 60 Zeichen pro Chip-Text — sonst Mobile-Umbruch im Chip.
 *  2. KMU-Sprache: Geschäftsführer-verständlich, keine Consultant-Buzzwords.
 *  3. Ergänzungsfähig: Chip-Text ist ein Anfang, den der User in der
 *     Textarea weiterschreibt (z. B. "Leads generieren" → "Leads generieren,
 *     vor allem für B2B mit langen Zyklen").
 *  4. Branche-Varianten müssen sich vom Default sichtbar unterscheiden —
 *     sonst lieber nur `default` nutzen, der Pflegeaufwand lohnt sich nicht.
 *  5. Branche-Schlüssel exakt wie in `state.collected_fields.branche` —
 *     Lowercase, kein Leerzeichen ("marketing", nicht "Marketing & Werbung").
 *  6. Pro Eintrag max. 5 Suggestions — mehr überlädt die Chip-Leiste optisch.
 *
 * ------------------------------------------------------------------------
 * Quellen
 * ------------------------------------------------------------------------
 *  - Briefing: docs/sprints/sprint-c1-smart-chips-briefing.md
 *  - Konzept:  docs/ux-analysis/chat-widget-smart-chips-concept.md
 *
 * Hinweis zur Konzept-Doku: Die Event-Lifecycle-Tabelle in Konzept §B
 * besagte ursprünglich "sendMessage clearend Chips NICHT". Das ist
 * obsolet — überstimmt durch das Briefing: clearSmartChips() läuft am
 * Ende von sendMessage() (vermeidet stale Chips während des typing-
 * Indicators).
 *
 * ======================================================================== */

(function() {
    "use strict";

    window.SMART_CHIPS_DE = {

        /* --------------------------------------------------------------
         * hauptleistung — Was bietet das Unternehmen an?
         * Generisch über alle 13 Branchen, kein byBranche.
         * ------------------------------------------------------------ */
        hauptleistung: {
            default: [
                "Beratung und Strategieentwicklung",
                "Software- und Web-Entwicklung",
                "Kreativ- und Marketingleistungen",
                "Schulungen und Weiterbildung",
                "Vertrieb und Handel"
            ]
        },

        /* --------------------------------------------------------------
         * vision_3_jahre — Wo wollen Sie in 3 Jahren stehen?
         * Holistisch, NICHT KI-spezifisch — Vision ist breiter.
         * ------------------------------------------------------------ */
        vision_3_jahre: {
            default: [
                "Marktführer in unserer Nische werden",
                "Geschäftsmodell digital transformieren",
                "Team gezielt auf Kernkompetenzen ausbauen",
                "Neue Geschäftsfelder erschließen",
                "Unabhängiger von einzelnen Großkunden werden"
            ]
        },

        /* --------------------------------------------------------------
         * strategische_ziele — Hauptfeld mit Branche-Varianten
         * default = alle Branchen außerhalb der byBranche-Liste
         * byBranche.{marketing|it|beratung} = spezifische Ziele
         * ------------------------------------------------------------ */
        strategische_ziele: {
            default: [
                "Effizienz im Tagesgeschäft steigern",
                "Mitarbeiter von Routinearbeit entlasten",
                "Kundenzufriedenheit messbar verbessern",
                "Wettbewerbsvorteil ausbauen"
            ],
            byBranche: {
                marketing: [
                    "Leads generieren und qualifizieren",
                    "Content-Produktion skalieren",
                    "Personalisierung in der Customer Journey",
                    "Kampagnen-Performance verbessern"
                ],
                it: [
                    "Code-Qualität durch KI-Reviews steigern",
                    "Incident-Response beschleunigen",
                    "Technische Dokumentation automatisieren",
                    "Test-Coverage systematisch erhöhen"
                ],
                beratung: [
                    "Research-Zeit pro Mandat halbieren",
                    "Berichte und Analysen automatisiert erstellen",
                    "Wissensmanagement strukturiert aufbauen",
                    "Mandantenkommunikation effizienter gestalten"
                ]
            }
        }

    };

    /* ----------------------------------------------------------------------
     * Lookup-Helper
     *  - field:    Feldname aus state.next_fields[0]
     *  - branche:  Wert aus state.collected_fields.branche (Lowercase-Slug)
     * Returns: Array von Strings oder null (nichts gefunden = keine Chips).
     * -------------------------------------------------------------------- */
    window.getSmartChips = function(field, branche) {
        var entry = window.SMART_CHIPS_DE && window.SMART_CHIPS_DE[field];
        if (!entry) return null;
        if (branche && entry.byBranche && entry.byBranche[branche]) {
            return entry.byBranche[branche];
        }
        return entry.default || null;
    };

})();
