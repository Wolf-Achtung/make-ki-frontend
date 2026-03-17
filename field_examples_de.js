// FIELD_EXAMPLES — Dynamische Kontext-Beispiele nach Branche + Größe
// Praxisnahe Sprache, wie echte Menschen über ihren Alltag reden
// 13 Branchen × 3 Größen + Default-Fallback
// Felder: 7 Textarea (hauptleistung, ki_projekte, zeitersparnis_prioritaet, geschaeftsmodell_evolution, vision_3_jahre, strategische_ziele, ki_guardrails)
//         3 Select-Hints (pilot_bereich, massnahmen_komplexitaet, investitionsbudget)
//         1 Strategy (s5_vision)
// Lookup: branche+size → branche+"default" → "default"+size → "default"+"default"

var FIELD_EXAMPLES = {

"handel": {
  "solo": {
    "hauptleistung": { "example": "Ich verkaufe handgemachte Keramik über meinen eigenen Shopify-Shop und auf Etsy. Jedes Stück ist ein Unikat. Meine Kunden schätzen die persönliche Beratung — viele schreiben mir direkt per Instagram oder WhatsApp.", "hint": "Einfach beschreiben: Was verkaufen Sie, wo, und warum kaufen die Leute bei Ihnen?" },
    "ki_projekte": { "example": "Ich nutze ChatGPT, wenn mir die Worte fehlen — für Produktbeschreibungen oder Instagram-Texte. Canva macht mir die Fotos hübsch. Richtig geplant ist das nicht, ich mache das eher, wenn ich abends noch Zeit habe.", "hint": "Auch wenn Sie nur ab und zu ChatGPT nutzen — das zählt schon." },
    "zeitersparnis_prioritaet": { "example": "Am meisten nervt mich, dass ich für jedes neue Produkt 20-30 Minuten an der Beschreibung sitze. Dazu kommen die ganzen Nachrichten — 'Wann kommt mein Paket?', 'Habt ihr das auch in Blau?' — das sind locker 1-2 Stunden am Tag.", "hint": "Was nervt Sie am meisten? Was hält Sie von der eigentlichen Arbeit ab?" },
    "geschaeftsmodell_evolution": { "example": "Ich könnte mir vorstellen, dass der Shop automatisch Sachen empfiehlt, die zusammenpassen — also wenn jemand eine Tasse kauft, gleich die passende Untertasse. Und vielleicht irgendwann eine englische Version vom Shop.", "hint": "Träumen Sie ruhig ein bisschen — was wäre cool, wenn es einfach ginge?" },
    "vision_3_jahre": { "example": "In 3 Jahren will ich den ganzen Verwaltungskram nicht mehr selbst machen: Produkttexte, Social Media, Kundenanfragen — das soll laufen. Ich will meine Zeit am Töpfertisch verbringen, nicht am Laptop.", "hint": "Wie soll Ihr Arbeitsalltag in ein paar Jahren aussehen?" },
    "strategische_ziele": { "example": "Erstmal: Die Standard-Kundenanfragen irgendwie automatisch beantworten. Dann: Produktbeschreibungen schneller hinkriegen. Und wenn ich träumen darf: Social-Media-Posts für zwei Wochen im Voraus vorbereiten lassen.", "hint": "Was würden Sie als erstes ändern, wenn Sie einen unsichtbaren Helfer hätten?" },
    "ki_guardrails": { "example": "Preise darf niemand außer mir ändern. Und KI-Texte gehen nie raus, ohne dass ich drübergelesen habe — meine Kunden kennen meine Stimme, die merken sofort wenn was komisch klingt.", "hint": "Was soll auf keinen Fall automatisch passieren?" },
    "pilot_bereich": { "hint": "Die meisten Solo-Händler starten mit Produkttexten oder Social Media — da merken Sie den Unterschied sofort." },
    "massnahmen_komplexitaet": { "hint": "Niedrig = Tools wie ChatGPT oder Shopify-Apps nutzen. Mittel = einen Chatbot einrichten. Hoch = ein eigenes System bauen lassen." },
    "investitionsbudget": { "hint": "Viele starten mit 20-50€/Monat für ChatGPT Plus oder Shopify-Apps. Das reicht für den Anfang." },
    "s5_vision": { "example": "Ich will meinen Shop so aufstellen, dass er auch läuft, wenn ich gerade in der Werkstatt bin. Der ganze Papierkram soll mich nicht mehr aufhalten.", "hint": "Was wäre für Sie persönlich der größte Gewinn?" }
  },
  "team": {
    "hauptleistung": { "example": "Wir haben einen Online-Shop und ein Ladengeschäft für regionale Feinkost aus Sachsen. Über Shopify verkaufen wir an Endkunden, außerdem beliefern wir Restaurants und Hotels in der Umgebung. Was uns ausmacht: Wir kennen jeden Erzeuger persönlich.", "hint": "Was verkaufen Sie, über welche Kanäle, und was macht Sie besonders?" },
    "ki_projekte": { "example": "Ein Kollege nutzt ChatGPT für Produkttexte und Social-Media-Posts. Letzten Monat hat jemand einen Chatbot für den Shop ausprobiert, aber wir haben ihn nicht live geschaltet. Shopify hätte wohl KI-Funktionen für Empfehlungen, aber wir haben die noch nie angeschaut.", "hint": "Auch wenn jemand im Team einfach mal was ausprobiert hat — das ist schon relevant." },
    "zeitersparnis_prioritaet": { "example": "Die Kundenanfragen fressen uns auf: 'Wann kommt meine Bestellung?', 'Ist da Gluten drin?', 'Liefert ihr auch nach München?' — das sind locker 2-3 Stunden am Tag. Und unsere Bestandsplanung mit Excel ist ein Witz — bei Saisonware verschätzen wir uns regelmäßig.", "hint": "Was raubt Ihrem Team jeden Tag die meiste Zeit und Nerven?" },
    "geschaeftsmodell_evolution": { "example": "Abo-Boxen wären super — jeden Monat eine Auswahl, zusammengestellt nach dem, was der Kunde mag. Oder ein 'Genuss-Berater' auf der Website: 'Ich suche was für ein Dinner mit 4 Personen' — und der schlägt die passenden Produkte vor.", "hint": "Was wäre möglich, wenn Technik kein Hindernis wäre?" },
    "vision_3_jahre": { "example": "Die nervigen Standardfragen soll ein Bot beantworten — das spart uns locker eine halbe Stelle. Die Bestandsplanung soll so laufen, dass wir nicht mehr auf Bergen von Marmelade sitzen bleiben. Und im Shop sollen Kunden Empfehlungen bekommen, die wirklich passen.", "hint": "Wenn Sie 3 Jahre vorspulen — wie arbeitet Ihr Team?" },
    "strategische_ziele": { "example": "Zuerst einen FAQ-Bot, der die Top-20-Fragen beantwortet. Dann weg von der Excel-Bestandsplanung. Und irgendwann personalisierte Empfehlungen im Shop, die den Warenkorb größer machen.", "hint": "Was würden Sie als erstes, zweites, drittes angehen?" },
    "ki_guardrails": { "example": "Allergie-Infos darf nie eine Maschine alleine beantworten — das muss immer ein Mensch prüfen. Preise werden nicht automatisch geändert. Und wenn ein Bot antwortet, soll der Kunde das auch wissen.", "hint": "Wo darf eine Maschine auf keinen Fall alleine entscheiden?" },
    "pilot_bereich": { "hint": "Die meisten Teams im Handel starten mit einem FAQ-Bot — das entlastet sofort und man sieht schnell, ob es funktioniert." },
    "massnahmen_komplexitaet": { "hint": "Niedrig = Shopify-App aktivieren. Mittel = einen Chatbot einrichten und trainieren. Hoch = eigenes System für die Bestandsplanung." },
    "investitionsbudget": { "hint": "Teams starten meistens mit 200-500€/Monat für Tools. Größere Projekte wie Bestandsplanung kosten ab 5.000€." },
    "s5_vision": { "example": "Wir wollen weniger Zeit mit Routinefragen und Excel-Tabellen verbringen und mehr mit unseren Erzeugern und Kunden. Die Technik soll im Hintergrund laufen, nicht unseren Alltag bestimmen.", "hint": "Was wäre der größte Gewinn für Ihr Team?" }
  },
  "kmu": {
    "hauptleistung": { "example": "Wir verkaufen Sportartikel und Outdoor-Ausrüstung — über unseren eigenen Online-Shop, zwei Filialen und auf Amazon und eBay. 45 Leute im Team: Lager, Versand, Kundenservice, Marketing. Etwa 30% unseres Sortiments sind Eigenmarken.", "hint": "Beschreiben Sie Ihr Geschäft so, wie Sie es einem Bekannten erklären würden." },
    "ki_projekte": { "example": "Das Marketing-Team schreibt Produkttexte mit Jasper. Im Kundenservice testen wir gerade einen Zendesk-Bot für die Standardfragen. Im Lager haben wir ein Prognosetool, aber das ist eher simpel. Und Controlling baut Dashboards in Power BI — bisher ohne KI.", "hint": "Einfach auflisten, was in den verschiedenen Abteilungen schon läuft." },
    "zeitersparnis_prioritaet": { "example": "Unser Kundenservice beantwortet über 200 Anfragen am Tag — die Hälfte davon sind 'Wo ist mein Paket?' und 'Wie funktioniert die Retoure?'. Produktdaten auf drei Kanälen pflegen kostet uns zwei volle Stellen. Und bei der Saisonplanung liegen wir regelmäßig 15-20% daneben.", "hint": "Welche Prozesse binden die meisten Leute — und wo geht am meisten schief?" },
    "geschaeftsmodell_evolution": { "example": "Dynamische Preise über alle Kanäle wären ein Traum — bisher machen wir das manuell. Und wenn das System vorhersagen könnte, was nächsten Monat gefragt ist, könnten wir viel besser einkaufen. Personalisierte Empfehlungen haben wir bisher nur auf Amazon, nicht im eigenen Shop.", "hint": "Was wäre möglich, wenn Sie die Daten hätten und die Technik mitspielen würde?" },
    "vision_3_jahre": { "example": "Wir wollen den Kundenservice soweit automatisieren, dass sich unsere Leute auf die kniffligen Fälle konzentrieren können. Die Bestandsplanung soll endlich zuverlässig sein. Und im eigenen Shop soll es so gut personalisiert sein wie bei den großen Plattformen.", "hint": "Wie soll Ihr Unternehmen in 3 Jahren arbeiten?" },
    "strategische_ziele": { "example": "Erstens: Standard-Kundenanfragen automatisch beantworten lassen. Zweitens: Produktdaten nur einmal pflegen und automatisch auf alle Kanäle verteilen. Drittens: Bestandsprognosen von 80% auf 95% Trefferquote bringen.", "hint": "Was sind die drei Dinge, die den größten Unterschied machen würden?" },
    "ki_guardrails": { "example": "Preise darf kein Algorithmus alleine ändern — das muss immer übers Category Management laufen. Kundendaten bleiben bei uns, da wird nichts an KI-Anbieter zum Trainieren geschickt. Und bevor wir irgendwas mit KI im Kundenservice machen, muss der Betriebsrat mit am Tisch sitzen.", "hint": "Was sind die roten Linien in Ihrem Unternehmen?" },
    "pilot_bereich": { "hint": "Bei größeren Handelsunternehmen bringt der Kundenservice meistens den schnellsten ROI — hohes Volumen, viele Standardfragen." },
    "massnahmen_komplexitaet": { "hint": "Niedrig = vorhandene Tools erweitern. Mittel = neues System einführen und Prozesse anpassen. Hoch = mehrere Abteilungen gleichzeitig umstellen." },
    "investitionsbudget": { "hint": "Die meisten KMU im Handel investieren 10.000-50.000€ im ersten Jahr. Große Projekte wie eine neue Bestandsplanung können auch mehr kosten." },
    "s5_vision": { "example": "Wir wollen, dass unsere Leute sich um die wichtigen Sachen kümmern können — schwierige Kundenfälle, Sortimentsplanung, Lieferantenbeziehungen. Die Routine soll automatisch laufen.", "hint": "Was wäre der größte Gewinn für Ihr Unternehmen?" }
  }
},

"beratung": {
  "solo": {
    "hauptleistung": { "example": "Ich berate kleine und mittelgroße Firmen bei der Digitalisierung — also wie sie ihre Abläufe in den Griff kriegen. Meistens arbeite ich mit 5-6 Kunden gleichzeitig, mal auf Stundenbasis, mal als Projektpauschale.", "hint": "Was machen Sie genau, für wen, und wie rechnen Sie ab?" },
    "ki_projekte": { "example": "ChatGPT ist mein täglicher Begleiter — für Recherche, wenn ich schnell einen Überblick brauche, für Entwürfe von Präsentationen oder wenn ich nach einem Meeting die Notizen zusammenfassen will. Otter.ai läuft bei Kundengesprächen mit.", "hint": "Was nutzen Sie schon — auch privat oder zum Ausprobieren?" },
    "zeitersparnis_prioritaet": { "example": "Angebote schreiben ist der Horror — jedes Mal 3-4 Stunden, und die Hälfte wird eh nichts. Dazu kommt die Recherche für Kundenprojekte, das dauert auch immer. Und nach jedem Meeting sitze ich nochmal 30-45 Minuten am Protokoll.", "hint": "Welche Aufgaben halten Sie davon ab, das zu tun, wofür Kunden Sie eigentlich bezahlen?" },
    "geschaeftsmodell_evolution": { "example": "Ich könnte mir vorstellen, automatisierte Branchen-Analysen als Produkt anzubieten — statt jedes Mal von null zu recherchieren. Oder ein monatliches Update-Format für Bestandskunden, das ich mit KI-Unterstützung erstelle.", "hint": "Was könnten Sie zusätzlich anbieten, wenn die Erstellung weniger Arbeit wäre?" },
    "vision_3_jahre": { "example": "In 3 Jahren will ich die ganze Recherche- und Dokumentationsarbeit in einem Bruchteil der Zeit erledigen. Angebote sollen in einer Stunde stehen, nicht in vier. Und vielleicht habe ich dann ein digitales Produkt, das auch Geld bringt, wenn ich gerade keinen Kunden berate.", "hint": "Wie soll Ihr Arbeitsalltag in ein paar Jahren aussehen?" },
    "strategische_ziele": { "example": "Schritt 1: Angebote in der halben Zeit schreiben. Schritt 2: Automatische Wettbewerbsanalysen als Standard-Baustein in meiner Beratung. Schritt 3: Kundenkommunikation mit einem vernünftigen CRM organisieren.", "hint": "Was würden Sie als erstes, zweites, drittes angehen?" },
    "ki_guardrails": { "example": "Alles was an Kunden geht, lese ich vorher durch — KI-generierte Empfehlungen schicke ich nie ungeprüft raus. Kundendaten kommen nur in europäische Tools. Und ich sage meinen Kunden, wo ich KI einsetze.", "hint": "Was muss in Ihrer Beratung unter Ihrer persönlichen Kontrolle bleiben?" },
    "pilot_bereich": { "hint": "Die meisten Solo-Berater starten mit Angebotserstellung oder Recherche — da spart man sofort spürbar Zeit." },
    "massnahmen_komplexitaet": { "hint": "Niedrig = ChatGPT mit guten Vorlagen nutzen. Mittel = spezialisierte Tools für Ihre Arbeit finden. Hoch = ein eigenes digitales Beratungsprodukt bauen." },
    "investitionsbudget": { "hint": "Die meisten starten mit 30-100€/Monat. Ein digitales Produkt kostet ab 3.000€ Entwicklung." },
    "s5_vision": { "example": "Ich will mehr beraten und weniger tippen. KI soll mir den Papierkram abnehmen, damit ich mich auf das konzentrieren kann, wofür meine Kunden mich buchen.", "hint": "Was wäre für Sie persönlich der größte Gewinn?" }
  },
  "team": {
    "hauptleistung": { "example": "Wir sind 6 Berater und machen Organisationsentwicklung und Change Management. Unsere Kunden sind Mittelständler mit 50-500 Leuten. Einige buchen uns auf Tagessatz, andere haben laufende Retainer.", "hint": "Was beraten Sie, wie groß ist Ihr Team, und wer sind Ihre Kunden?" },
    "ki_projekte": { "example": "Im Team nutzt fast jeder ChatGPT oder Claude — für Recherche, Textentwürfe, mal ein Brainstorming. Ein Kollege hat einen eigenen GPT gebaut, der häufige Fragen zu unserer Methodik beantwortet. Und wir testen gerade Copilot für Kundenpräsentationen.", "hint": "Was nutzt Ihr Team schon — auch ohne dass es offiziell freigegeben ist?" },
    "zeitersparnis_prioritaet": { "example": "Die Angebotserstellung frisst uns 15-20% unserer Beraterzeit. Jeden Freitag sitzen alle 3-4 Stunden an Projektdoku und Statusberichten. Und das größte Problem: Wissen aus abgeschlossenen Projekten geht verloren — wir fangen ständig von vorne an.", "hint": "Was hält Ihr Team davon ab, mehr beim Kunden zu sein?" },
    "geschaeftsmodell_evolution": { "example": "Wir könnten KI-gestützte Kurzanalysen als Einstiegsprodukt für Neukunden anbieten — quasi ein Schnell-Check, bevor das richtige Projekt startet. Oder automatisierte Zwischen-Reports, damit Kunden immer wissen, wo sie stehen.", "hint": "Was könnten Sie zusätzlich anbieten, wenn die Erstellung einfacher wäre?" },
    "vision_3_jahre": { "example": "Wir wollen, dass sich jeder Berater auf Strategie und Kundengespräche konzentrieren kann — nicht auf PowerPoint und Protokolle. Angebote sollen in Stunden stehen statt in Tagen. Und unser gesammeltes Wissen aus 200 Projekten soll endlich nutzbar sein.", "hint": "Wie soll Ihr Team in 2-3 Jahren arbeiten?" },
    "strategische_ziele": { "example": "Angebotsprozess drastisch verkürzen. Alle Berater auf die gleichen Tools bringen. Ein Wissenssystem aufbauen, in dem man findet, was Kollegen schon erarbeitet haben.", "hint": "Was sind die Top-3-Baustellen in Ihrem Team?" },
    "ki_guardrails": { "example": "Kundendaten packen wir nicht in irgendwelche kostenlosen KI-Tools — nur in freigegebene Enterprise-Versionen. Jede Empfehlung, die an den Kunden geht, wird von einem Senior gegengelesen. Und wir sagen unseren Kunden offen, wo wir KI einsetzen.", "hint": "Welche Regeln braucht Ihr Team beim KI-Einsatz?" },
    "pilot_bereich": { "hint": "Beratungsteams starten am besten mit Angeboten, Dokumentation oder dem Wissensmanagement — da merkt jeder sofort den Unterschied." },
    "massnahmen_komplexitaet": { "hint": "Niedrig = gemeinsame Tool-Lizenzen. Mittel = interne Prozesse umstellen. Hoch = eigene KI-gestützte Beratungsprodukte für Kunden bauen." },
    "investitionsbudget": { "hint": "Teams investieren meistens 500-2.000€/Monat für Lizenzen. Eigenentwicklungen ab 10.000€." },
    "s5_vision": { "example": "Weniger Schreibtisch, mehr Kunde. KI soll uns die Zuarbeit abnehmen, damit unsere Berater das tun, was sie am besten können: beraten.", "hint": "Was wäre der größte Gewinn für Ihr Team?" }
  },
  "kmu": {
    "hauptleistung": { "example": "Wir sind ein Beratungshaus mit 60 Leuten und vier Bereichen: Strategie, Operations, Digitalisierung und HR. Unsere Kunden reichen vom Mittelstand bis zum Konzern, Projekte liegen zwischen 50k und 500k. Wir arbeiten viel in der DACH-Region.", "hint": "Beschreiben Sie Ihr Unternehmen so, wie Sie es einem neuen Mitarbeiter erklären würden." },
    "ki_projekte": { "example": "Die Digitalisierungs-Abteilung hat ein eigenes KI-Assessment als Produkt gebaut. Intern testen wir eine Wissensdatenbank mit KI-Suche, damit nicht jeder das Rad neu erfindet. Marketing macht Content mit KI. Und HR experimentiert mit KI-unterstütztem Bewerber-Screening.", "hint": "Was passiert in den einzelnen Abteilungen — auch wenn es nur Experimente sind?" },
    "zeitersparnis_prioritaet": { "example": "Angebotserstellung bindet ein Viertel der Partner-Kapazität. Das Staffing — wer passt auf welches Projekt? — ist ein ewiger manueller Prozess. Quality Reviews kosten 10-15% der Projektzeit. Und unser Wissen aus 500+ abgeschlossenen Projekten? Liegt irgendwo auf einem SharePoint und keiner findet was.", "hint": "Welche Prozesse kosten unverhältnismäßig viel Zeit und Ressourcen?" },
    "geschaeftsmodell_evolution": { "example": "Wir könnten KI-gestützte Analysen als skalierbares Produkt neben dem klassischen Projektgeschäft anbieten. Oder eine Art Dauer-Beratung für Bestandskunden — automatisierte Impulse und Benchmarks, die wir dann in der persönlichen Beratung vertiefen.", "hint": "Welche neuen Angebote oder Erlösquellen könnten entstehen?" },
    "vision_3_jahre": { "example": "Jeder Berater hat einen KI-Assistenten, der recherchiert, analysiert und dokumentiert. Wir haben 2-3 eigene KI-Produkte, die 20% vom Umsatz machen. Ein Kundenprojekt, das früher 6 Wochen gedauert hat, schaffen wir in 3. Und wir gelten als die Beratung, die KI wirklich verstanden hat.", "hint": "Wo soll Ihr Unternehmen stehen — und wie soll es sich anfühlen?" },
    "strategische_ziele": { "example": "KI-Governance fürs ganze Haus einführen. Die Wissensdatenbank mit KI-Suche endlich ausrollen. Mindestens zwei eigene KI-Produkte auf den Markt bringen. Und KI-Kompetenz als Pflicht-Baustein in die Berater-Ausbildung aufnehmen.", "hint": "Was steht auf Ihrer Liste für die nächsten 6-12 Monate?" },
    "ki_guardrails": { "example": "Kundendaten nur in zugelassenen Enterprise-Tools. Bevor ein neuer KI-Use-Case produktiv geht, macht Compliance einen Check. Betriebsrat ist bei KI-Themen mit im Boot. Und alles was KI-generiert ist, wird als solches gekennzeichnet.", "hint": "Welche Regeln braucht ein Unternehmen Ihrer Größe?" },
    "pilot_bereich": { "hint": "Größere Beratungen starten oft im Backoffice — Angebote, Wissensmanagement — bevor KI an den Kunden kommt." },
    "massnahmen_komplexitaet": { "hint": "Niedrig = Lizenzen ausrollen. Mittel = Abteilungsübergreifende Einführung. Hoch = eigene KI-Produkte für Kunden entwickeln." },
    "investitionsbudget": { "hint": "Beratungshäuser dieser Größe investieren typisch 50.000-200.000€/Jahr. Eigenentwicklung von Produkten kommt oben drauf." },
    "s5_vision": { "example": "Wir wollen, dass KI uns schneller und besser macht — intern für unsere Arbeit und extern als Angebot an unsere Kunden. In drei Jahren soll es selbstverständlich sein, nicht die Ausnahme.", "hint": "Was ist die große Vision?" }
  }
},

"it": {
  "solo": {
    "hauptleistung": { "example": "Ich bin Freelance-Webentwickler, hauptsächlich React und Node.js. Meine Kunden sind Startups und kleine Agenturen, die schnell ein MVP oder eine Web-App brauchen. Manchmal Stundensatz, manchmal Festpreis.", "hint": "Welche Technologien, welche Kunden, wie rechnen Sie ab?" },
    "ki_projekte": { "example": "GitHub Copilot läuft bei mir den ganzen Tag. ChatGPT frage ich, wenn ich bei einem Architekturproblem feststecke oder was debuggen muss. Cursor nutze ich als Editor. Und bei einem Kundenprojekt habe ich die OpenAI-API integriert.", "hint": "Was läuft bei Ihnen schon nebenbei mit?" },
    "zeitersparnis_prioritaet": { "example": "Legacy-Code refactoren — das frisst Zeit ohne Ende. Dokumentation schreibe ich ehrlich gesagt meistens erst, wenn der Kunde meckert. Und Projektschätzungen für Angebote sind auch immer ein Kampf. Testing mache ich noch viel zu viel von Hand.", "hint": "Was nervt am meisten im Arbeitsalltag?" },
    "geschaeftsmodell_evolution": { "example": "Ich könnte mit KI-Unterstützung viel schneller liefern — das wäre ein echtes Verkaufsargument. Oder ein eigenes kleines SaaS-Produkt nebenher aufbauen. Und KI-Integration könnte ein zweites Standbein werden — das fragen immer mehr Kunden an.", "hint": "Was wird möglich, wenn Sie schneller und effizienter arbeiten?" },
    "vision_3_jahre": { "example": "In 3 Jahren will ich doppelt so schnell entwickeln wie heute. Ich will ein eigenes Produkt haben, das auch Geld bringt, wenn ich gerade kein Kundenprojekt habe. Und ich will als der Typ bekannt sein, der KI sinnvoll in Projekte einbauen kann.", "hint": "Wie soll sich Ihre Arbeit verändern?" },
    "strategische_ziele": { "example": "In jedem Projekt KI-Coding-Tools nutzen, nicht nur wenn ich dran denke. Automatische Tests generieren lassen statt sie von Hand zu schreiben. Und endlich das MVP für mein eigenes Produkt fertig machen.", "hint": "Was sind die nächsten konkreten Schritte?" },
    "ki_guardrails": { "example": "Kunden-Code packe ich nicht in öffentliche KI-Tools, ohne vorher den NDA zu checken. Sicherheitskritische Sachen wie Auth oder Bezahlung mache ich grundsätzlich selbst. Und KI-Code wird immer reviewed, bevor er live geht.", "hint": "Wo ziehen Sie die Grenze?" },
    "pilot_bereich": { "hint": "Als Entwickler bringt KI-unterstütztes Coding (Copilot, Cursor) den direktesten Nutzen — das steckt in der täglichen Kernarbeit." },
    "massnahmen_komplexitaet": { "hint": "Niedrig = Copilot anschalten. Mittel = KI in die CI/CD-Pipeline einbauen. Hoch = ein eigenes KI-Produkt entwickeln." },
    "investitionsbudget": { "hint": "Die meisten Entwickler zahlen 20-50€/Monat für KI-Tools. Ein eigenes Produkt kostet ab 2.000-5.000€ zum Starten." },
    "s5_vision": { "example": "KI soll mir den Rücken freihalten — weniger Routine, mehr Architektur und kreative Problemlösung. Und irgendwann ein eigenes Produkt, das auch ohne mich läuft.", "hint": "Was ist Ihr Ziel?" }
  },
  "team": {
    "hauptleistung": { "example": "Wir machen Softwareentwicklung und IT-Beratung für Mittelständler: Cloud-Migration, Web-Apps und API-Integrationen. Im Team sind 5 Entwickler, ein DevOps-Mensch und ein Projektmanager. Wir arbeiten agil in 2-Wochen-Sprints.", "hint": "Was machen Sie, wie ist Ihr Team aufgestellt?" },
    "ki_projekte": { "example": "Alle Entwickler nutzen Copilot. Wir haben intern einen Slack-Bot mit der GPT-API gebaut, den das ganze Team zum Nachschlagen nutzt. Zwei Kundenprojekte haben KI-Features — ein Chatbot und eine Dokumentenanalyse. DevOps probiert gerade KI-gestütztes Monitoring aus.", "hint": "Was läuft im Team — intern und für Kunden?" },
    "zeitersparnis_prioritaet": { "example": "Code-Reviews dauern ewig, besonders bei großen PRs. Dokumentation schreiben wir alle ungern — die ist chronisch veraltet. Bug-Triage im Backlog kostet jeden Sprint Zeit. Und neue Entwickler brauchen 3-4 Wochen, bis sie produktiv sind.", "hint": "Was bremst Ihr Team am meisten?" },
    "geschaeftsmodell_evolution": { "example": "KI-Integration als Service könnte ein neues Standbein werden — die Nachfrage ist da. Oder ein eigenes Produkt, z.B. ein Dokumenten-Analyse-Tool als SaaS. Einige Kunden fragen schon direkt nach KI-Expertise.", "hint": "Was könnten Sie zusätzlich anbieten?" },
    "vision_3_jahre": { "example": "Jedes Projekt nutzt KI — beim Entwickeln, Testen und Deployen. Wir haben ein eigenes Produkt, das 30% vom Umsatz bringt. Und im Markt kennt man uns als die, die KI nicht nur predigen sondern auch können.", "hint": "Wo soll Ihr Team in 2-3 Jahren stehen?" },
    "strategische_ziele": { "example": "Einheitliche KI-Toolchain fürs ganze Team — nicht jeder sein eigenes Ding. Automatisierte Code-Reviews und Test-Generierung. Das erste eigene Produkt als MVP rausbringen. Und KI-Integration aktiv als Service vermarkten.", "hint": "Was steht als nächstes an?" },
    "ki_guardrails": { "example": "Für Kundenprojekte nur Enterprise-Tools mit SSO und Audit-Log. Kein Kundendaten-Upload in kostenlose KI-Dienste — egal wie praktisch das wäre. Und jeder KI-Einsatz in der Produktion kriegt ein Security-Review.", "hint": "Welche Regeln braucht Ihr Team?" },
    "pilot_bereich": { "hint": "IT-Teams profitieren am meisten, wenn KI direkt in die Kernarbeit kommt: Entwicklung, Testing und Deployment." },
    "massnahmen_komplexitaet": { "hint": "Niedrig = Team-Lizenzen für Copilot. Mittel = KI in die Build-Pipeline integrieren. Hoch = eigene Produkte entwickeln." },
    "investitionsbudget": { "hint": "Pro Entwickler 20-50€/Monat für KI-Tools. Produktentwicklung ab 15.000€." },
    "s5_vision": { "example": "Wir wollen KI so selbstverständlich nutzen wie Git — in unserer eigenen Arbeit und als Kompetenz, die wir Kunden verkaufen können.", "hint": "Was ist die Vision?" }
  },
  "kmu": {
    "hauptleistung": { "example": "Wir sind ein IT-Systemhaus mit 75 Leuten: Managed Services, Cloud-Infrastruktur, Softwareentwicklung und IT-Security. Eigene Rechenzentren in Deutschland. Über 200 Bestandskunden, hauptsächlich Mittelstand in der DACH-Region.", "hint": "Beschreiben Sie Ihr Unternehmen." },
    "ki_projekte": { "example": "Im Managed-Services-Bereich testen wir KI für Monitoring und Anomalie-Erkennung. Die Entwickler nutzen alle Copilot und wir haben eine interne GPT-Instanz. Der Vertrieb experimentiert mit KI-Lead-Scoring. Und HR hat die Bewerbervorauswahl teilweise automatisiert.", "hint": "Was passiert in den einzelnen Abteilungen?" },
    "zeitersparnis_prioritaet": { "example": "Unser 1st-Level-Support bearbeitet über 500 Tickets pro Woche — 60% davon sind Standardprobleme, die sich wiederholen. Angebotskalkulation für komplexe Projekte dauert 2-3 Tage pro Angebot. Compliance-Doku für Kunden ist unglaublich aufwändig. Und Wissen wandert mit, wenn Leute die Abteilung wechseln.", "hint": "Wo stecken die meisten Ressourcen drin?" },
    "geschaeftsmodell_evolution": { "example": "KI-Services für unsere Bestandskunden wären naheliegend — eine managed KI-Plattform quasi. Automatisierte Security-Audits könnten wir als Premium-Service anbieten. Und KI-Beratung als eigener Geschäftsbereich wird immer häufiger angefragt.", "hint": "Welche neuen Geschäftsfelder sehen Sie?" },
    "vision_3_jahre": { "example": "Der 1st-Level-Support soll zu 80% automatisch laufen. Wir bieten Managed KI als eigenen Service an. Jeder Mitarbeiter hat seinen KI-Assistenten. Und KI-Services machen 25% unseres Umsatzes aus.", "hint": "Wo soll Ihr Unternehmen stehen?" },
    "strategische_ziele": { "example": "KI-Strategie verabschieden, die für alle Bereiche gilt. 1st-Level-Automatisierung auf 60% hochfahren. Mindestens drei KI-gestützte Services für Kunden launchen. KI-Kompetenz-Programm für alle Mitarbeitenden.", "hint": "Was steht auf der Roadmap?" },
    "ki_guardrails": { "example": "Alles muss durch unser Governance-Framework — mit Risikoklassen für jeden Use Case. Kundendaten verarbeiten wir nur in unseren eigenen Rechenzentren oder zertifizierten EU-Clouds. Mit dem Betriebsrat haben wir eine KI-Vereinbarung. Und regelmäßige Audits sind Pflicht. Überwachung von Mitarbeitern ist absolut tabu.", "hint": "Welche Governance braucht ein Unternehmen Ihrer Größe?" },
    "pilot_bereich": { "hint": "IT-Systemhäuser starten oft beim internen Support — hohes Ticket-Volumen und direkt messbare Einsparungen." },
    "massnahmen_komplexitaet": { "hint": "Niedrig = Lizenzen ausrollen. Mittel = Prozesse umstellen. Hoch = KI-Produkte für Kunden und unternehmensweite Transformation." },
    "investitionsbudget": { "hint": "IT-KMU investieren typisch 100.000-500.000€/Jahr in KI. Eigene Plattformen können nochmal so viel kosten." },
    "s5_vision": { "example": "KI soll bei uns zwei Dinge gleichzeitig sein: intern ein Effizienz-Turbo und extern ein neues Geschäftsfeld. Managed KI als dritte Säule neben Managed IT und Softwareentwicklung.", "hint": "Was ist die Gesamtvision?" }
  }
},

"marketing": {
  "solo": {
    "hauptleistung": { "example": "Ich mache Online-Marketing für kleine Firmen und Startups: SEO, Content, Social Media. Meistens 4-6 Kunden auf Retainer-Basis, also monatlich feste Stunden pro Kunde.", "hint": "Was genau machen Sie, für wen?" },
    "ki_projekte": { "example": "Ohne ChatGPT wäre ich aufgeschmissen — Textentwürfe, Blog-Ideen, Social-Media-Posts. Midjourney für Bildideen. Surfer SEO hat KI-Optimierung eingebaut. Und Canva macht die Grafiken halb von alleine.", "hint": "Im Marketing nutzt man KI oft schon ganz selbstverständlich — was gehört bei Ihnen dazu?" },
    "zeitersparnis_prioritaet": { "example": "Content-Erstellung frisst 60% meiner Zeit — Blog, Social, Newsletter. Das monatliche Reporting für jeden Kunden dauert 2-3 Stunden. Keyword-Recherche für ein neues Projekt ist auch immer ein halber Tag. Und die ganzen Abstimmungsschleifen mit Kunden…", "hint": "Was frisst Ihnen die meiste produktive Zeit?" },
    "geschaeftsmodell_evolution": { "example": "Wenn ich mit KI doppelt so schnell Texte erstellen kann, kann ich auch doppelt so viele Kunden betreuen. Oder automatische SEO-Reports als Self-Service — die Kunden können sich das dann selber runterladen, statt dass ich jedes Mal manuell ran muss.", "hint": "Was wird möglich, wenn Sie schneller arbeiten können?" },
    "vision_3_jahre": { "example": "Content dreimal so schnell produzieren wie jetzt. Kampagnen laufen und optimieren sich größtenteils von selbst. Und vielleicht habe ich ein eigenes Tool — einen KI-Content-Planer oder so — das mir auch passives Einkommen bringt.", "hint": "Wie sieht Ihre Arbeit in ein paar Jahren aus?" },
    "strategische_ziele": { "example": "Texte in der halben Zeit schreiben. Reporting-Templates, die sich fast von selbst befüllen. A/B-Tests automatisch auswerten. Und irgendwann mal loslegen mit dem eigenen Produkt, das mir schon ewig im Kopf rumspukt.", "hint": "Was steht als nächstes an?" },
    "ki_guardrails": { "example": "KI-Texte gehen nie 1:1 raus — ich lese alles nochmal und passe den Ton an den Kunden an. Die Markenstimme ist wichtiger als Effizienz. Und keine KI-generierten Bilder, die echte Menschen simulieren.", "hint": "Was darf KI nicht alleine entscheiden?" },
    "pilot_bereich": { "hint": "Im Marketing ist Content-Erstellung der offensichtlichste Einstieg — sofort messbar, sofort spürbar." },
    "massnahmen_komplexitaet": { "hint": "Niedrig = KI-Features in vorhandenen Tools nutzen. Mittel = eigene Workflows aufbauen. Hoch = eigene Tools entwickeln." },
    "investitionsbudget": { "hint": "Die meisten Marketing-Freelancer zahlen 100-300€/Monat für KI-Tools (ChatGPT, Midjourney, SEO-Tools)." },
    "s5_vision": { "example": "Ich will mit gleicher Zeit doppelt so viel schaffen — und die Qualität soll dabei besser werden, nicht schlechter. Langfristig ein eigenes Produkt aufbauen.", "hint": "Was ist Ihr Ziel?" }
  },
  "team": {
    "hauptleistung": { "example": "Digitale Marketing-Agentur mit 8 Leuten: SEO, SEA, Social Media, Content und Performance Marketing. 20 Bestandskunden, hauptsächlich B2B-Mittelstand. Mix aus Projektarbeit und monatlichen Retainern.", "hint": "Welche Services, wie groß ist das Team, wer sind die Kunden?" },
    "ki_projekte": { "example": "Das Content-Team lebt praktisch in ChatGPT und Jasper. SEO arbeitet mit Surfer SEO und KI-Keyword-Analyse. Performance testet KI-gestützte Gebotsoptimierung. Und intern haben wir angefangen, Projektzeitschätzungen mit KI zu machen.", "hint": "Was nutzen die verschiedenen Leute im Team?" },
    "zeitersparnis_prioritaet": { "example": "Das monatliche Kunden-Reporting frisst uns 2 volle Tage im Team. Content produzieren ist der größte Zeitfresser — Blog, Whitepaper, Social für 20 Kunden. Kampagnen auf 5+ Plattformen gleichzeitig aufsetzen und optimieren ist ein ewiger Kreislauf.", "hint": "Was bindet die meiste Teamkapazität?" },
    "geschaeftsmodell_evolution": { "example": "Ein KI-Audit als Einstiegsangebot für Neukunden — 'Wo steht Ihr Marketing digital?' Oder Content-Pakete im Abo — mit KI schaffen wir den doppelten Output. Und unsere eigenen KI-Tools könnten wir auch als White-Label anbieten.", "hint": "Welche neuen Angebote werden durch KI realistisch?" },
    "vision_3_jahre": { "example": "Jeder im Team ist mit KI-Tools 2-3x so produktiv. Reporting läuft auf Knopfdruck. Wir haben eigene KI-Produkte und gelten als die Agentur, die das digitale Marketing wirklich auf dem nächsten Level macht.", "hint": "Wie soll Ihre Agentur in 2-3 Jahren dastehen?" },
    "strategische_ziele": { "example": "Reporting automatisieren — das darf nicht mehr 2 Tage dauern. KI-Content-Workflows als Team-Standard. Kampagnenoptimierung zumindest halbautomatisch. Und den KI-Audit als neues Produkt launchen.", "hint": "Was sind die Top-Prioritäten?" },
    "ki_guardrails": { "example": "Alles was an den Kunden geht, wird von einem Redakteur freigegeben. Die Markenstimme des Kunden hat Vorrang — auch wenn ChatGPT was anderes vorschlägt. Kundenstrategien gehören nicht in öffentliche KI-Tools.", "hint": "Welche Qualitätsregeln braucht das Team?" },
    "pilot_bereich": { "hint": "Marketing-Teams starten meistens mit Content oder Reporting — beides direkt messbar und teamweit skalierbar." },
    "massnahmen_komplexitaet": { "hint": "Niedrig = Team-Lizenzen. Mittel = Workflows umbauen. Hoch = eigene Produkte für Kunden entwickeln." },
    "investitionsbudget": { "hint": "Marketing-Teams investieren 500-2.000€/Monat in KI-Lizenzen. Eigene Produkte ab 10.000€." },
    "s5_vision": { "example": "Wir wollen die Agentur sein, die mit 8 Leuten den Output einer 20-Mann-Agentur liefert — und das in besserer Qualität.", "hint": "Was ist die Vision?" }
  },
  "kmu": {
    "hauptleistung": { "example": "Marketingagentur-Gruppe mit 50 Leuten an 3 Standorten. Wir machen alles: Strategie, Kreation, Digital, Media und Events. Kunden von Mittelstand bis Konzern. Wir spielen in der oberen Liga, aber gegen die ganz Großen wird es eng.", "hint": "Beschreiben Sie Ihr Unternehmen." },
    "ki_projekte": { "example": "Die Kreation nutzt Midjourney und DALL-E für Mood-Boards. Digital hat KI-gestützte Kampagnenoptimierung am Laufen. Strategie testet KI für Marktanalysen. Und wir haben sogar ein kleines Innovation Lab mit 3 Leuten, die nur KI-Sachen ausprobieren.", "hint": "Was passiert in den verschiedenen Abteilungen?" },
    "zeitersparnis_prioritaet": { "example": "Pitches für Neugeschäft verschlingen 40-80 Stunden pro Pitch — und wir gewinnen nicht jeden. Cross-Channel-Reporting für Großkunden: 3-4 Tage pro Monat pro Kunde. Und die ewige Herausforderung: mehr Content produzieren ohne mehr Leute einzustellen.", "hint": "Wo stecken die größten Ressourcen drin?" },
    "geschaeftsmodell_evolution": { "example": "KI-Beratung als eigene Abteilung — die Nachfrage ist da. Datengetriebene Kreation als das, was uns von anderen Agenturen unterscheidet. Und im Pitch unsere eigenen KI-Tools als Wettbewerbsvorteil ausspielen.", "hint": "Wie verändert KI Ihr Geschäftsmodell?" },
    "vision_3_jahre": { "example": "Pitches in der halben Zeit, dafür doppelt so gut. 20% vom Umsatz aus KI-Produkten. Und wenn Kunden an KI im Marketing denken, sollen sie zuerst an uns denken.", "hint": "Wo soll Ihre Agenturgruppe stehen?" },
    "strategische_ziele": { "example": "KI-Governance für die ganze Gruppe. Kreationsprozess mit KI-Support als Standard. Cross-Channel-Reporting automatisieren. KI-Beratung als eigenen Bereich etablieren.", "hint": "Was steht auf der strategischen Agenda?" },
    "ki_guardrails": { "example": "KI-Output ist Rohmaterial für Kreative, nie das Endprodukt. Keine KI-Bilder mit erkennbaren Personen. Kundendaten nicht in externe Tools. Und der Betriebsrat muss bei Prozessautomatisierung mit am Tisch sitzen.", "hint": "Welche Regeln braucht eine Organisation Ihrer Größe?" },
    "pilot_bereich": { "hint": "Große Agenturen profitieren oft am meisten von automatisiertem Reporting oder KI-gestützter Kreation — beides skaliert sofort." },
    "massnahmen_komplexitaet": { "hint": "Niedrig = Team-Tools. Mittel = Agenturweite Prozessumstellung. Hoch = eigene Produkte und KI-Beratungs-Practice." },
    "investitionsbudget": { "hint": "Agenturen dieser Größe investieren 50.000-200.000€/Jahr. Innovation Labs kosten zusätzlich." },
    "s5_vision": { "example": "KI soll uns helfen, schneller besser zu sein — in der Kreation, im Media und im Consulting. Und gleichzeitig ein neues Geschäftsfeld werden.", "hint": "Was ist die Gesamtstrategie?" }
  }
},

"medien": {
  "solo": {
    "hauptleistung": { "example": "Ich mache Film- und Videoproduktion: Imagefilme, Social-Media-Clips und Eventdokumentation. Alles von der Konzeption bis zum fertigen Schnitt — One-Man-Show. Meine Kunden sind Agenturen und mittelständische Firmen.", "hint": "Was produzieren Sie, wie arbeiten Sie?" },
    "ki_projekte": { "example": "DaVinci Resolve macht die Farbkorrektur inzwischen fast von alleine. Descript nutze ich für Transkriptionen und groben Schnitt. Adobe Firefly für Konzeptbilder zum Pitchen. Und wenn ich ein schnelles Voiceover brauche, spielt Elevenlabs den Entwurf ein.", "hint": "Welche KI-Tools stecken schon in Ihrem Workflow?" },
    "zeitersparnis_prioritaet": { "example": "Schneiden kostet mich 60% meiner Arbeitszeit — Rohschnitt, Feinschnitt, nochmal ändern, nochmal ändern. Musik und Sound raussuchen ist jedes Mal ein Krampf. Untertitel erstellen und übersetzen ist langweilig aber notwendig. Und für Akquise und Angebote bleibt dann kaum noch Zeit.", "hint": "Was frisst Ihre produktive Zeit?" },
    "geschaeftsmodell_evolution": { "example": "Aus einem Langformat automatisch 10 Social-Clips generieren — das wäre Gold wert. Oder Videos automatisch in andere Sprachen bringen — Untertitel plus Voiceover-Übersetzung. Das könnte ich als Extra-Service anbieten, ohne dass es mich mehr Zeit kostet.", "hint": "Welche neuen Angebote wären möglich?" },
    "vision_3_jahre": { "example": "Postproduktion in der Hälfte der Zeit. Mehrsprachige Videos als Standardangebot. Und mehr Zeit für die kreative Arbeit — Konzeption und Regie — statt stundenlang am Schnittrechner zu sitzen.", "hint": "Wie soll sich Ihre Arbeit verändern?" },
    "strategische_ziele": { "example": "Rohschnitt-Zeit massiv reduzieren — 40% wäre ein Traum. Untertitel und Übersetzungen automatisieren. Aus jedem Dreh direkt Social-Media-Schnitte raushauen lassen.", "hint": "Was würden Sie als erstes angehen?" },
    "ki_guardrails": { "example": "Die kreative Endentscheidung treffe immer ich — welcher Schnitt, welche Musik, welcher Ton. Wenn KI-Elemente im Spiel sind, sage ich das dem Kunden. Und KI-Stimmen nutze ich nur für Entwürfe, nie im fertigen Film — es sei denn der Kunde will das explizit.", "hint": "Was muss kreativ in Ihrer Hand bleiben?" },
    "pilot_bereich": { "hint": "In der Videoproduktion bringt KI in der Postproduktion am meisten — Schnitt, Farbkorrektur, Untertitel." },
    "massnahmen_komplexitaet": { "hint": "Niedrig = KI-Features in DaVinci/Premiere aktivieren. Mittel = neue Tools in den Workflow einbauen. Hoch = eigene automatisierte Workflows." },
    "investitionsbudget": { "hint": "Die meisten Kreativen zahlen 100-300€/Monat für KI-Tools (Adobe, DaVinci, Descript)." },
    "s5_vision": { "example": "KI soll mir den langweiligen Teil abnehmen — Schnitt, Untertitel, Formatierung — damit ich mehr Zeit habe für das, was mir Spaß macht: Geschichten erzählen.", "hint": "Was ist Ihr Ziel?" }
  },
  "team": {
    "hauptleistung": { "example": "Content-Agentur mit 7 Leuten: Videoproduktion, Podcast, Grafikdesign und Social Media. Unsere Kunden sind Mittelständler und Startups, die regelmäßig Content brauchen. Mix aus Projekten und monatlichen Retainern.", "hint": "Was produzieren Sie, wie ist Ihr Team aufgestellt?" },
    "ki_projekte": { "example": "Die Grafiker nutzen Midjourney und Adobe Firefly für Konzeptentwicklung. Der Video-Editor arbeitet mit Runway und Descript. Die Content-Writer haben ChatGPT und Jasper im Dauereinsatz. Und für die Projektplanung nutzen wir Notion AI.", "hint": "Was nutzen die verschiedenen Leute im Team?" },
    "zeitersparnis_prioritaet": { "example": "Ein Blogpost dauert von der Idee bis zur Veröffentlichung 6-8 Stunden — das ist zu viel. Videoschnitt braucht 2-3 Tage pro Projekt. Social-Media-Planung jede Woche 4-5 Stunden. Und dann die ganzen Abstimmungen mit Kunden, bis alles freigegeben ist.", "hint": "Welche Produktionsschritte kosten am meisten?" },
    "geschaeftsmodell_evolution": { "example": "Content-Pakete im Abo — mit KI schaffen wir deutlich mehr Output ohne mehr Leute. Podcast-Nachbearbeitung automatisieren und als Service anbieten. Oder mehrsprachigen Content als neues Angebot — Übersetzung und Lokalisierung per KI.", "hint": "Was wird durch KI als neues Angebot realistisch?" },
    "vision_3_jahre": { "example": "Doppelter Output bei gleicher Teamgröße. Jedes Gewerk hat KI-Tools, die wirklich im Alltag stecken. Und wir sind als die Agentur bekannt, die modern arbeitet und trotzdem kreativ bleibt.", "hint": "Wie soll Ihre Agentur in 2-3 Jahren arbeiten?" },
    "strategische_ziele": { "example": "Einheitliche Tools für alle Gewerke — nicht jeder sein eigenes Ding. Content-Produktion um 40% beschleunigen. Social-Media-Planung automatisieren. Podcast-Workflow von 3 Tagen auf 1 Tag runter.", "hint": "Was sind die Top-Prioritäten?" },
    "ki_guardrails": { "example": "Die kreative Leitidee kommt immer von uns — KI ist Werkzeug, nicht Kreativdirektor. KI-Bilder werden als solche gekennzeichnet. Kundenstrategien gehören nicht in öffentliche KI-Tools. Und jedes Deliverable geht vor der Abgabe durch einen Senior.", "hint": "Welche Qualitäts- und Ethikregeln braucht Ihr Team?" },
    "pilot_bereich": { "hint": "Content-Teams starten meistens mit Texterstellung — da sieht man den Geschwindigkeitsgewinn am schnellsten." },
    "massnahmen_komplexitaet": { "hint": "Niedrig = KI-Tools für jedes Gewerk. Mittel = Workflows anpassen. Hoch = eigene Plattform oder Produkte." },
    "investitionsbudget": { "hint": "Kreativ-Teams investieren 500-1.500€/Monat in KI-Lizenzen." },
    "s5_vision": { "example": "Mehr Output, bessere Qualität, gleich viele Leute. KI als Werkzeug, nicht als Ersatz für Kreativität.", "hint": "Was ist die Vision?" }
  },
  "kmu": {
    "hauptleistung": { "example": "Wir sind ein Medienhaus mit 40 Leuten: Verlag, Videoproduktion, digitale Plattformen und Events. Unsere eigenen Medien erreichen 500.000 Nutzer im Monat. Daneben produzieren wir auch Content für andere Unternehmen.", "hint": "Beschreiben Sie Ihr Medienunternehmen." },
    "ki_projekte": { "example": "Die Redaktion testet KI-Assistenz für Recherche und Artikelentwürfe. Video nutzt KI für Transkription und automatische Kurzversionen. Ad-Tech baut KI-gestütztes Targeting. Und wir testen gerade einen KI-generierten Newsletter mit personalisierten Inhalten.", "hint": "Was läuft in den einzelnen Abteilungen?" },
    "zeitersparnis_prioritaet": { "example": "Wir müssen immer mehr Content produzieren — 30+ Artikel pro Woche, 5+ Videos, tägliche Social-Posts. 20 Jahre Archiv-Material liegt rum und keiner findet was. Übersetzung für internationale Märkte kostet Unsummen. Und das Werbegeschäft: jede Kampagne ist manuell aufgesetzt.", "hint": "Wo drückt der Schuh am meisten?" },
    "geschaeftsmodell_evolution": { "example": "Personalisierte Feeds — jeder Nutzer sieht anderen Content. Die Werbevermarktung in Echtzeit optimieren. Aus deutschem Content automatisch englische Versionen machen. Und unsere Content-Produktion als Plattform-Service für andere Medienhäuser anbieten.", "hint": "Was verändert KI an Ihrem Geschäft?" },
    "vision_3_jahre": { "example": "50% mehr Content bei gleicher Teamgröße — nicht durch Copy-Paste, sondern durch KI-Assistenz. Personalisierung auf Nutzerebene. Aus einem Text automatisch Video, Podcast und Social-Schnipsel machen. Und unsere Plattform-Technik als Produkt verkaufen.", "hint": "Wo soll Ihr Medienhaus stehen?" },
    "strategische_ziele": { "example": "KI-Assistenz für alle Redakteure einführen. Das Archiv durchsuchbar machen — 20 Jahre Content endlich nutzbar. Automatische Multi-Format-Verwertung: ein Artikel wird zum Social-Post, zum Newsletter und zum Video-Teaser. Personalisierung für die Plattform.", "hint": "Was steht auf der Roadmap?" },
    "ki_guardrails": { "example": "Jeder veröffentlichte Inhalt wird von einem Menschen geprüft — redaktionelle Endkontrolle ist nicht verhandelbar. KI-unterstützter Content wird transparent gekennzeichnet. Faktencheck bleibt menschliche Aufgabe. Und die presserechtliche Verantwortung liegt beim Redakteur, nicht bei der Maschine.", "hint": "Welche publizistischen und ethischen Grenzen ziehen Sie?" },
    "pilot_bereich": { "hint": "Medienhäuser profitieren oft am meisten von der Archiv-Erschließung oder von automatischer Multi-Format-Verwertung." },
    "massnahmen_komplexitaet": { "hint": "Niedrig = Redaktions-Tools. Mittel = Abteilungsübergreifende Workflows. Hoch = eigene KI-Plattform mit Personalisierung." },
    "investitionsbudget": { "hint": "Medien-KMU investieren 50.000-200.000€/Jahr. Eine eigene Plattform kostet deutlich mehr." },
    "s5_vision": { "example": "Mehr relevanter Content, schneller produziert, besser ausgespielt — bei gleichbleibender journalistischer Qualität. Das ist der Balanceakt, den wir hinkriegen müssen.", "hint": "Was ist die Gesamtvision?" }
  }
},

"finanzen": {
  "solo": {
    "hauptleistung": { "example": "Ich bin unabhängiger Finanzberater — Altersvorsorge, Anlagestrategien und Versicherungsoptimierung für Privatkunden und kleine Firmen. Mix aus Provision und Honorar.", "hint": "Was genau beraten Sie, für wen?" },
    "ki_projekte": { "example": "ChatGPT hilft mir bei Marktrecherche und wenn ich Finanzberichte zusammenfassen muss. Excel hat ein KI-Add-in für Szenarien. Und ich bekomme Alerts, wenn sich bei einem Portfolio was tut.", "hint": "Was nutzen Sie schon?" },
    "zeitersparnis_prioritaet": { "example": "Das monatliche Reporting für Kunden — jedes Mal 1-2 Tage. Die ganze Compliance-Dokumentation. Marktbeobachtung, damit ich auf dem Laufenden bleibe. Und die Vorbereitung für Kundentermine.", "hint": "Was hält Sie von der eigentlichen Beratung ab?" },
    "geschaeftsmodell_evolution": { "example": "Automatisierte Reports, die sich fast von selbst schreiben. Ein einfaches Robo-Advisory-Modul für Einsteiger-Kunden. Und ein Monitoring, das mich warnt, bevor der Kunde anruft.", "hint": "Was wäre möglich?" },
    "vision_3_jahre": { "example": "KI macht die Datenarbeit, ich mache die Beratung. Reports erstellen sich in Minuten statt Stunden. Und ich schaffe 50% mehr Kunden, weil die Verwaltung mich nicht mehr auffrisst.", "hint": "Wie soll Ihre Arbeit aussehen?" },
    "strategische_ziele": { "example": "Reporting automatisieren — das muss schneller gehen. Ein Risiko-Screening mit KI aufsetzen. Und die Compliance-Doku zumindest halb automatisch befüllen.", "hint": "Was packen Sie als erstes an?" },
    "ki_guardrails": { "example": "Anlageentscheidungen treffe ich — keine Maschine. BaFin-Auflagen für die Dokumentation bleiben Pflicht. Kundendaten nur in europäischen Systemen. Und KI gibt Kunden niemals direkt eine Empfehlung.", "hint": "Wo ziehen Sie die Grenze?" },
    "pilot_bereich": { "hint": "In der Finanzberatung startet man am besten mit dem Reporting — automatische Portfolio-Updates entlasten sofort." },
    "massnahmen_komplexitaet": { "hint": "Niedrig = KI-Recherche-Tools. Mittel = Portfolio-Monitoring. Hoch = regulierte KI-Systeme (BaFin-konform)." },
    "investitionsbudget": { "hint": "Die meisten starten mit 100-300€/Monat. Regulierte Lösungen kosten deutlich mehr." },
    "s5_vision": { "example": "Weniger Papierkram, mehr echte Beratung. KI soll die Daten sortieren, ich sortiere die Gedanken meiner Kunden.", "hint": "Was wäre der größte Gewinn?" }
  },
  "team": {
    "hauptleistung": { "example": "Versicherungsmakler mit 8 Leuten. Wir machen hauptsächlich Gewerbeversicherungen und betriebliche Altersvorsorge für KMU. Haben einen eigenen Vergleichsrechner gebaut. Mischung aus Bestandskunden und Neugeschäft.", "hint": "Was machen Sie, für wen?" },
    "ki_projekte": { "example": "Der Vergleichsrechner ist noch regel-basiert, keine KI. Im Innendienst nutzen ein paar Leute ChatGPT für E-Mail-Vorlagen. Und wir testen gerade, ob eine KI Schadensmeldungen schneller einordnen kann.", "hint": "Was gibt es schon — auch wenn es noch Experimente sind?" },
    "zeitersparnis_prioritaet": { "example": "Schadensmeldungen bearbeiten und dokumentieren — das frisst 30% der Innendienst-Kapazität. Vertragsänderungen manuell abgleichen ist fehleranfällig und nervt. Und die Kunden rufen ständig an wegen Deckungsumfang und Bedingungen.", "hint": "Was kostet Ihr Team am meisten Zeit?" },
    "geschaeftsmodell_evolution": { "example": "Eine digitale Bedarfsanalyse als Erstberatungstool — der Kunde beantwortet online ein paar Fragen und bekommt eine Einschätzung. Automatische Vertragsverlängerungen mit intelligenten Empfehlungen. Und Schadensprävention statt nur Schadensregulierung.", "hint": "Was könnte sich ändern?" },
    "vision_3_jahre": { "example": "Der Innendienst soll sich um die kniffligen Fälle kümmern, nicht um Standard-Schadensmeldungen. Ein digitaler Funnel bringt uns qualifizierte Leads. Und Schadenbearbeitung geht doppelt so schnell.", "hint": "Wo soll Ihr Unternehmen stehen?" },
    "strategische_ziele": { "example": "Schadensmeldungen automatisieren — die Routine muss schneller gehen. Einen Chat-Bot für die häufigsten Kundenfragen. Vertragsanalyse beschleunigen. Den digitalen Beratungsfunnel aufbauen.", "hint": "Was sind die Prioritäten?" },
    "ki_guardrails": { "example": "Deckungsentscheidungen trifft kein Computer. Kundendaten nur in BaFin-konformen Systemen. Die Beratungspflicht erfüllt immer ein Mensch. KI-Empfehlungen sind Entscheidungshilfen, nicht Entscheidungen.", "hint": "Welche regulatorischen Grenzen müssen Sie beachten?" },
    "pilot_bereich": { "hint": "Im Versicherungsbereich startet man am besten beim Kundenservice — viele Standardfragen zu Deckung und Schäden." },
    "massnahmen_komplexitaet": { "hint": "Niedrig = Chat-Bot für FAQ. Mittel = Schadensprozess-Automatisierung. Hoch = regulierte KI-Beratungstools." },
    "investitionsbudget": { "hint": "Teams investieren 500-2.000€/Monat. Regulierte Lösungen ab 15.000€." },
    "s5_vision": { "example": "Wir wollen unseren Innendienst entlasten und gleichzeitig schneller und besser für unsere Kunden da sein.", "hint": "Was ist Ihr Ziel?" }
  },
  "kmu": {
    "hauptleistung": { "example": "Finanzdienstleister mit 60 Leuten: Vermögensverwaltung, Unternehmensfinanzierung und Versicherungen. BaFin-reguliert. 3 Niederlassungen. Wir verwalten einen dreistelligen Millionenbetrag.", "hint": "Beschreiben Sie Ihr Unternehmen." },
    "ki_projekte": { "example": "Risikomanagement testet KI-gestützte Portfolioanalyse. Compliance evaluiert KI für Transaktions-Monitoring. Im Kundenservice läuft ein Chatbot-Pilot. Und der Vertrieb nutzt KI-Lead-Scoring.", "hint": "Was läuft in den Abteilungen?" },
    "zeitersparnis_prioritaet": { "example": "Compliance und KYC-Prüfungen binden 4 Vollzeitstellen. Kundenreporting frisst jeden Monat 5 Arbeitstage. Portfolio-Rebalancing ist noch manuell. Und die regulatorischen Meldungen an BaFin und Bundesbank kosten Nerven und Zeit.", "hint": "Wo stecken die meisten Ressourcen?" },
    "geschaeftsmodell_evolution": { "example": "KI-gestütztes Risikomanagement als Premium-Service für unsere Kunden. Ein Robo-Advisory-Modul als Einstieg für Neukunden mit kleinerem Volumen. Automatisierte Compliance — das wäre ein Riesengewinn.", "hint": "Welche Möglichkeiten sehen Sie?" },
    "vision_3_jahre": { "example": "Compliance-Aufwand um 60% runter. Robo-Advisory für 30% des Neukundengeschäfts. Echtzeit-Monitoring für alle Portfolios. Und eine Betrugserkennung, die funktioniert.", "hint": "Wo soll Ihr Unternehmen stehen?" },
    "strategische_ziele": { "example": "Compliance-Monitoring mit KI einführen. Reporting automatisieren. Robo-Advisory MVP starten. Und ein KI-Governance-Framework bauen, das auch die BaFin zufriedenstellt.", "hint": "Was sind die Prioritäten?" },
    "ki_guardrails": { "example": "BaFin-Konformität ist nicht verhandelbar. Jede KI-Entscheidung muss erklärbar sein — Black Box geht nicht. Kundendaten nur in deutschen Rechenzentren. Regelmäßige Modell-Audits. Und am Ende entscheidet immer ein Mensch über Geld.", "hint": "Welche regulatorischen Anforderungen gelten?" },
    "pilot_bereich": { "hint": "Regulierte Finanzunternehmen starten oft mit Compliance und Reporting — hoher Druck, klar messbar." },
    "massnahmen_komplexitaet": { "hint": "Niedrig = interne Analysen. Mittel = regulierte Prozesse. Hoch = kundengerichtete KI (BaFin-Prüfung nötig)." },
    "investitionsbudget": { "hint": "Regulierte Finanzunternehmen investieren 100.000-500.000€/Jahr. Kundengerichtete KI kann noch teurer werden." },
    "s5_vision": { "example": "Besseres Risikomanagement, schnellere Compliance, innovative Produkte für Kunden — ohne die regulatorischen Anforderungen zu kompromittieren.", "hint": "Was ist die Gesamtvision?" }
  }
},

"bildung": {
  "solo": {
    "hauptleistung": { "example": "Ich bin freiberufliche Trainerin — Führungskräfteentwicklung und Kommunikation. Mix aus Präsenz-Seminaren und Online-Workshops. Meine Kunden sind Unternehmen und Bildungsträger, die mich für Inhouse-Trainings buchen.", "hint": "Was unterrichten oder trainieren Sie, für wen?" },
    "ki_projekte": { "example": "ChatGPT hilft mir beim Seminarkonzept und bei Handouts. Canva KI für Präsentationen. Otter.ai läuft bei Workshops für die Protokolle mit. Und Notion AI hält meine Kursunterlagen zusammen.", "hint": "Was nutzen Sie schon?" },
    "zeitersparnis_prioritaet": { "example": "Jeder neue Workshop braucht 3-4 Stunden Konzeption und Material. Teilnehmer-Feedback auswerten und den Kurs anpassen. Die ganze Verwaltung — Rechnungen, Termine, Follow-ups. Und mich selbst weiterzubilden kommt immer zu kurz.", "hint": "Was hält Sie vom eigentlichen Training ab?" },
    "geschaeftsmodell_evolution": { "example": "Online-Kurse zum Selbstlernen — mit einem KI-Tutor, der Fragen beantwortet. Personalisierte Lernpfade, die sich an den Teilnehmer anpassen. Oder ein KI-gestütztes Coaching als Ergänzung zu meinen Trainings.", "hint": "Was wird möglich?" },
    "vision_3_jahre": { "example": "Meine Präsenz-Workshops plus KI-gestützte Online-Nachbereitung — die Teilnehmer lernen weiter, auch wenn ich nicht da bin. Meine eigene kleine Kursplattform. Und 50% mehr Teilnehmer, ohne dass ich 50% mehr arbeite.", "hint": "Wie soll Ihre Arbeit aussehen?" },
    "strategische_ziele": { "example": "Kursunterlagen dreimal so schnell erstellen. Den ersten Online-Kurs mit KI-Tutor bauen. Feedback automatisch auswerten und Zertifikate erstellen.", "hint": "Was packen Sie als erstes an?" },
    "ki_guardrails": { "example": "KI ersetzt nicht die persönliche Beziehung im Training — die macht den Unterschied. Bei psychologischen Themen gibt KI keine Empfehlungen. Teilnehmer-Daten bleiben beim jeweiligen Kurs. Und ich sage offen, wo KI mithilft.", "hint": "Was muss menschlich bleiben?" },
    "pilot_bereich": { "hint": "Im Bildungsbereich starten die meisten mit der Materialerstellung — Handouts, Präsentationen, Übungen." },
    "massnahmen_komplexitaet": { "hint": "Niedrig = KI für Materialien. Mittel = Online-Kurs mit KI-Elementen. Hoch = eigene Lernplattform." },
    "investitionsbudget": { "hint": "Die meisten starten mit 50-200€/Monat. Ein Online-Kurs kostet ab 2.000-5.000€ in der Erstellung." },
    "s5_vision": { "example": "Trainings schneller vorbereiten und ein skalierbares Online-Angebot aufbauen — ohne den persönlichen Touch zu verlieren.", "hint": "Was ist Ihr Ziel?" }
  },
  "team": {
    "hauptleistung": { "example": "Weiterbildungsinstitut mit 8 Leuten: Seminare, Zertifikatslehrgänge und Inhouse-Trainings. Schwerpunkt Digitalisierung, Projektmanagement und Führung. Über 200 Seminartage im Jahr.", "hint": "Was bieten Sie an?" },
    "ki_projekte": { "example": "Unsere Trainer nutzen ChatGPT für Unterlagen. Das LMS hat erste KI-Features für Lernempfehlungen. Marketing schreibt Kursbeschreibungen mit KI. Und wir testen einen Chatbot für die Kursberatung auf der Website.", "hint": "Was gibt es schon?" },
    "zeitersparnis_prioritaet": { "example": "Kursunterlagen erstellen und aktualisieren — der größte Zeitfresser. Teilnehmer-Verwaltung und Zertifikate sind auch immer Arbeit. Marketing für über 50 verschiedene Kurse. Und jedes Inhouse-Training muss individuell angepasst werden.", "hint": "Was bindet am meisten Kapazität?" },
    "geschaeftsmodell_evolution": { "example": "Blended Learning — Präsenz plus KI-Tutor für die Nachbereitung. Personalisierte Lernpfade, die sich an das Tempo der Teilnehmer anpassen. Oder Micro-Learning-Häppchen im Abo — jeden Tag 10 Minuten.", "hint": "Welche neuen Formate werden möglich?" },
    "vision_3_jahre": { "example": "Halb Präsenz, halb Online mit KI-Unterstützung. Personalisierte Lernpfade als Alleinstellungsmerkmal. 50% mehr Teilnehmer ohne mehr Trainer einstellen zu müssen. KI-Kompetenz-Zertifizierungen als neues Geschäftsfeld.", "hint": "Wo soll Ihr Institut stehen?" },
    "strategische_ziele": { "example": "Das LMS mit einem KI-Tutor ausstatten. Kursunterlagen-Erstellung halbieren. Personalisierte Empfehlungen für Teilnehmer. Und KI-Kompetenz-Kurse ins Programm aufnehmen — die Nachfrage ist riesig.", "hint": "Was sind die Prioritäten?" },
    "ki_guardrails": { "example": "KI-Tutor ergänzt die Trainer, ersetzt sie nicht. Teilnehmer-Daten nur für Lernzwecke. Prüfungen bewertet ein Mensch. Und wenn KI bei den Materialien mithilft, sagen wir das.", "hint": "Welche pädagogischen Grenzen gelten?" },
    "pilot_bereich": { "hint": "Bildungsinstitute starten oft mit der Kursmaterial-Erstellung oder einem Lern-Chatbot für Teilnehmer." },
    "massnahmen_komplexitaet": { "hint": "Niedrig = KI-Materialerstellung. Mittel = LMS-Integration. Hoch = eigene KI-Lernplattform." },
    "investitionsbudget": { "hint": "Teams investieren 300-1.000€/Monat. Plattform-Entwicklung ab 15.000€." },
    "s5_vision": { "example": "Bessere Lernergebnisse bei höherer Skalierbarkeit — Blended Learning mit KI als unser Alleinstellungsmerkmal.", "hint": "Was ist die Vision?" }
  },
  "kmu": {
    "hauptleistung": { "example": "Bildungsträger mit 70 Leuten: berufliche Weiterbildung, Umschulungen und Integrationskurse. 15 Standorte. AZAV-zertifiziert. Über 3.000 Teilnehmer im Jahr. Auftraggeber: Jobcenter, Unternehmen und Selbstzahler.", "hint": "Beschreiben Sie Ihren Bildungsträger." },
    "ki_projekte": { "example": "Wir testen adaptive Lernpfade im LMS. Für Sprachkurse gibt es einen KI-Einstufungstest. Die Verwaltung probiert KI für Dokumentenerkennung. Und Marketing macht Kurswerbung mit KI-Texten.", "hint": "Was läuft in den Bereichen?" },
    "zeitersparnis_prioritaet": { "example": "Verwaltung frisst uns auf: Teilnehmerdokumentation, Maßnahmenabrechnung mit den Kostenträgern. Kursplanung über 15 Standorte ist ein Logistik-Problem. Qualitätssicherung und AZAV-Doku — notwendig, aber brutal aufwändig. Und jede Zielgruppe braucht andere Materialien.", "hint": "Wo stecken die meisten Ressourcen?" },
    "geschaeftsmodell_evolution": { "example": "Eine eigene Lernplattform, die wir auch anderen Trägern anbieten könnten. Adaptive Lernpfade für alle Formate. Automatische Kompetenzfeststellung statt aufwändiger manueller Tests. Und Vorhersagen, welche Teilnehmer zusätzliche Unterstützung brauchen.", "hint": "Was wird durch KI möglich?" },
    "vision_3_jahre": { "example": "Adaptives Lernen als Standard in allen Kursen. Verwaltungsaufwand um 40% runter. Eigene Plattform als White-Label für andere Träger. Und datengestützte Kursplanung statt Bauchgefühl.", "hint": "Wo soll Ihr Unternehmen stehen?" },
    "strategische_ziele": { "example": "Adaptive Lernplattform für alle Kursformate ausrollen. Verwaltung automatisieren — Teilnehmerdoku und Abrechnung. KI-Einstufungstests für alle Fachbereiche. Datengestützte Kursplanung.", "hint": "Was steht auf der Roadmap?" },
    "ki_guardrails": { "example": "Pädagogische Qualität hat Vorrang vor Automatisierung. Teilnehmer-Daten strikt nach DSGVO und SGB. Keine KI-basierten Entscheidungen über Zulassung. Und alle Systeme müssen barrierefrei sein.", "hint": "Welche besonderen Anforderungen gelten?" },
    "pilot_bereich": { "hint": "Bildungsträger starten oft in der Verwaltung (Dokumentation, Abrechnung) oder beim Einstufungstest." },
    "massnahmen_komplexitaet": { "hint": "Niedrig = Tools für Lehrkräfte. Mittel = LMS-Integration. Hoch = eigene adaptive Plattform." },
    "investitionsbudget": { "hint": "Bildungs-KMU investieren 30.000-150.000€/Jahr. Plattformen kosten mehr." },
    "s5_vision": { "example": "Individuellere Lernerfahrungen bei weniger Verwaltungsaufwand — bessere Ergebnisse für Teilnehmer und Kostenträger.", "hint": "Was ist die Gesamtvision?" }
  }
},

"verwaltung": {
  "solo": {
    "hauptleistung": { "example": "Ich berate Kommunen bei der Digitalisierung — also wie eine Stadtverwaltung ihre Prozesse besser hinkriegt. Von der Analyse bis zur Umsetzungsbegleitung.", "hint": "In welchem Bereich der Verwaltung sind Sie aktiv?" },
    "ki_projekte": { "example": "ChatGPT für Konzeptpapiere und Präsentationen. Recherche zu Vergaberecht und Förderprogrammen lasse ich mir vorfiltern. Und ich begleite gerade eine Kommune bei einem Chatbot-Pilot für Bürgeranfragen.", "hint": "Was nutzen Sie?" },
    "zeitersparnis_prioritaet": { "example": "Recherche zu rechtlichen Rahmenbedingungen — jedes Mal ein halber Tag. Konzepte und Berichte schreiben. Die endlosen Abstimmungsrunden mit verschiedenen Ämtern. Und Fördermittelanträge vorbereiten ist auch immer ein Kraftakt.", "hint": "Was frisst Ihre Zeit?" },
    "geschaeftsmodell_evolution": { "example": "Ein standardisiertes KI-Readiness-Assessment speziell für Verwaltungen — das gibt es so noch kaum. Pilotprojekte begleiten als neues Beratungsfeld. Schulungen zu KI und Datenschutz für Verwaltungsleute.", "hint": "Welche Möglichkeiten sehen Sie?" },
    "vision_3_jahre": { "example": "Der KI-Spezialist für den öffentlichen Sektor sein. Ein Assessment, das ich standardmäßig bei jeder Kommune anbiete. Und 10+ KI-Pilotprojekte pro Jahr begleiten.", "hint": "Wo sehen Sie sich?" },
    "strategische_ziele": { "example": "Standardisiertes Assessment entwickeln. Erstes Pilotprojekt erfolgreich zu Ende bringen. Netzwerk mit kommunalen IT-Dienstleistern aufbauen.", "hint": "Was steht als nächstes an?" },
    "ki_guardrails": { "example": "Im öffentlichen Sektor gelten besondere Datenschutzregeln — BSI-Grundschutz als Minimum. Keine Bürgerdaten in US-Clouds. Jede KI-Entscheidung muss nachvollziehbar und erklärbar sein.", "hint": "Welche besonderen Anforderungen gelten?" },
    "pilot_bereich": { "hint": "Im Verwaltungsbereich startet man meistens bei der Dokumentenerstellung oder Recherche." },
    "massnahmen_komplexitaet": { "hint": "Niedrig = eigene Recherche-Tools. Mittel = Beratungsprodukte entwickeln. Hoch = Verwaltungs-KI-Systeme begleiten." },
    "investitionsbudget": { "hint": "Die meisten starten mit 50-200€/Monat. Produktentwicklung ab 3.000€." },
    "s5_vision": { "example": "Der öffentliche Sektor braucht dringend KI-Kompetenz — und ich will der sein, den man anruft.", "hint": "Was ist Ihre Vision?" }
  },
  "team": {
    "hauptleistung": { "example": "IT-Dienstleister für Kommunen. 8 Leute. Wir betreuen Fachverfahren, begleiten Digitalisierungsprojekte und bauen Bürgerportale. 15 Kommunen in der Region sind unsere Kunden.", "hint": "Was machen Sie?" },
    "ki_projekte": { "example": "Wir testen einen Chatbot für Bürgeranfragen in einer Modellkommune. KI-gestützte Dokumentensortierung für Bauanträge läuft als Pilot. Und intern nutzen wir KI, um Support-Tickets schneller zu bearbeiten.", "hint": "Was gibt es schon?" },
    "zeitersparnis_prioritaet": { "example": "40% der Bürgeranfragen sind immer die gleichen: 'Wo beantrage ich...?', 'Wie lange dauert...?'. Dokumentenverarbeitung ist komplett manuell — Anträge, Bescheide, Formulare. Und der Fachverfahren-Support hat auch viele wiederkehrende Probleme.", "hint": "Was kostet am meisten Kapazität?" },
    "geschaeftsmodell_evolution": { "example": "Den Bürger-Chatbot könnten wir allen unseren 15 Kommunen anbieten — einmal bauen, 15-mal einsetzen. Automatisierte Dokumentenverarbeitung als Service. KI-Entscheidungshilfen für Sachbearbeiter.", "hint": "Was wird als neuer Service möglich?" },
    "vision_3_jahre": { "example": "Bürger-Chatbot als Standard für alle unsere Kommunen. Dokumentenverarbeitung zu 70% automatisiert. KI-Assistenz für jeden Sachbearbeiter. Und wir gelten als der Vorreiter für KI im öffentlichen Sektor in der Region.", "hint": "Wo soll Ihr Unternehmen stehen?" },
    "strategische_ziele": { "example": "Bürger-Chatbot für mindestens 5 Kommunen ausrollen. Dokumentenklassifizierung produktiv schalten. KI-Schulung für Verwaltungsleute anbieten.", "hint": "Was sind die Ziele?" },
    "ki_guardrails": { "example": "BSI-Grundschutz als Minimum. Keine Bürgerdaten in nicht-europäischen Clouds. Alle KI-Entscheidungen müssen nachvollziehbar sein. Barrierefreiheit für alle KI-Interfaces — das ist im öffentlichen Sektor Pflicht.", "hint": "Welche Anforderungen gelten im öffentlichen Bereich?" },
    "pilot_bereich": { "hint": "Im Verwaltungsbereich ist ein FAQ-Bot für Bürger oder die automatisierte Dokumentenbearbeitung meistens der beste Einstieg." },
    "massnahmen_komplexitaet": { "hint": "Niedrig = interner Chatbot. Mittel = Bürgerservice-KI. Hoch = Fachverfahren-Integration." },
    "investitionsbudget": { "hint": "Teams investieren 500-2.000€/Monat. Produktentwicklung ab 20.000€." },
    "s5_vision": { "example": "Schnellerer Bürgerservice und weniger Routinearbeit für Sachbearbeiter — das wollen wir für unsere Kommunen erreichen.", "hint": "Was ist die Vision?" }
  },
  "kmu": {
    "hauptleistung": { "example": "Kommunaler IT-Zweckverband mit 50 Leuten. Wir betreiben die IT für 30 Kommunen — Infrastruktur, Fachverfahren und digitale Services. Eigenes Rechenzentrum. Gerade ist die OZG-Umsetzung unser größtes Thema.", "hint": "Beschreiben Sie Ihren Verband." },
    "ki_projekte": { "example": "KI-Bürgerassistent für 3 Modellkommunen als Pilot. Anomalie-Erkennung im Netzwerk-Monitoring. Wir evaluieren, ob KI Bescheide automatisch erstellen kann. Und erste Mitarbeiterschulungen zu KI-Grundlagen haben wir auch schon gemacht.", "hint": "Was läuft?" },
    "zeitersparnis_prioritaet": { "example": "OZG-Umsetzung — der Rückstand ist enorm. Support für 30 Kommunen gleichzeitig ist ein Skalierungsproblem. Bescheide erstellen geht noch viel manuell und ist fehleranfällig. Und für IT-Security haben wir eigentlich zu wenig Leute.", "hint": "Wo drückt es am meisten?" },
    "geschaeftsmodell_evolution": { "example": "Den KI-Bürgerservice als Gemeinschaftslösung für alle 30 Kommunen — die Kosten teilen sich alle. Automatisierte Bescheiderstellung als Shared Service. KI-Security-Center für alle. Und Datenanalysen für kommunale Planung.", "hint": "Was kann der Verband seinen Kommunen bieten?" },
    "vision_3_jahre": { "example": "KI ist Standardkomponente in der kommunalen IT: Bürgerservice, Sachbearbeitung, IT-Security. OZG-Dienste laufen mit KI-Unterstützung. Und andere Zweckverbände schauen sich bei uns ab, wie es geht.", "hint": "Wo soll der Verband stehen?" },
    "strategische_ziele": { "example": "Bürgerassistent für alle 30 Kommunen. Automatisierte Bescheide für die 3 wichtigsten Fachverfahren. KI-Security-Monitoring produktiv. KI-Governance-Rahmen, der auch rechtlich hält.", "hint": "Was steht auf der Roadmap?" },
    "ki_guardrails": { "example": "BSI-Grundschutz und IT-Grundschutz-Kompendium. Deutsche Rechenzentren, souveräne Cloud. Jede KI-Entscheidung vollständig nachvollziehbar. DSGVO plus Landesdatenschutzgesetz. Und kein KI-Einsatz ohne vorherige Risikofolgenabschätzung.", "hint": "Welche öffentlich-rechtlichen Anforderungen gelten?" },
    "pilot_bereich": { "hint": "Zweckverbände starten oft mit dem Bürgerservice oder IT-Security-Monitoring — beides lässt sich über alle Kommunen skalieren." },
    "massnahmen_komplexitaet": { "hint": "Niedrig = interne Tools. Mittel = Gemeinschaftslösungen für alle Kommunen. Hoch = Fachverfahren-Integration und souveräne KI." },
    "investitionsbudget": { "hint": "Kommunale IT investiert 50.000-300.000€/Jahr. Gemeinschaftslösungen entsprechend mehr." },
    "s5_vision": { "example": "KI als Gemeinschaftslösung — effizienterer Bürgerservice, sichere IT und moderne Verwaltung für alle unsere 30 Kommunen, bei geteilten Kosten.", "hint": "Was ist die Gesamtvision?" }
  }
},

"gesundheit": {
  "solo": {
    "hauptleistung": { "example": "Physiotherapie-Praxis, alleine geführt. Orthopädie und Sportphysiotherapie. 30-35 Patienten pro Woche, Kasse und Privat. Alles von der Behandlung bis zur Abrechnung mache ich selbst.", "hint": "Was machen Sie, wie groß ist Ihre Praxis?" },
    "ki_projekte": { "example": "Meine Praxissoftware hat so eine KI-Terminplanung, die ist ganz okay. ChatGPT nutze ich manchmal für Patienteninformationen oder wenn ich individuelle Übungspläne zusammenstellen muss.", "hint": "Was nutzen Sie schon — auch wenn es nur Kleinigkeiten sind?" },
    "zeitersparnis_prioritaet": { "example": "Nach jeder Behandlung 10-15 Minuten Dokumentation — das summiert sich bei 7 Patienten am Tag massiv. Die ewige Terminiererei und No-Show-Patienten. Kassenabrechnungen. Und Übungspläne individuell zusammenstellen dauert auch.", "hint": "Was hält Sie von der Behandlung ab?" },
    "geschaeftsmodell_evolution": { "example": "Übungspläne per App — der Patient macht zu Hause weiter und die App erinnert ihn. Dokumentation per Sprache statt Tippen, direkt während der Behandlung. Vielleicht irgendwann Telemedizin für die Nachsorge.", "hint": "Was wäre möglich?" },
    "vision_3_jahre": { "example": "Dokumentation per Sprache, direkt während ich behandle. Patienten bekommen ihre Übungen in einer App. Terminmanagement läuft von alleine. Und ich habe wieder mehr Zeit für das, was ich eigentlich gelernt habe: Menschen behandeln.", "hint": "Wie soll Ihr Praxis-Alltag aussehen?" },
    "strategische_ziele": { "example": "Dokumentationszeit halbieren — das wäre schon riesig. Terminerinnerungen automatisch verschicken, damit weniger Patienten nicht auftauchen. Und digitale Übungspläne statt Zettelwirtschaft.", "hint": "Was würden Sie als erstes ändern?" },
    "ki_guardrails": { "example": "Diagnosen stelle ich — nicht die Maschine. Patientendaten nur im Praxissystem, nirgendwo sonst. Befundberichte unterschreibe immer ich persönlich. Und keine Patientendaten an KI-Anbieter weitergeben.", "hint": "Was muss in Ihrer Hand bleiben?" },
    "pilot_bereich": { "hint": "Im Gesundheitsbereich startet man am sichersten mit Verwaltung: Terminplanung, Dokumentation, Erinnerungen." },
    "massnahmen_komplexitaet": { "hint": "Niedrig = Terminplanung-KI. Mittel = Sprachdokumentation. Hoch = Patienten-App." },
    "investitionsbudget": { "hint": "Praxen starten oft mit 50-200€/Monat. Größere Systeme ab 3.000€." },
    "s5_vision": { "example": "Weniger Papierkram, mehr Patientenzeit. So einfach ist das.", "hint": "Was wäre der größte Gewinn?" }
  },
  "team": {
    "hauptleistung": { "example": "Gemeinschaftspraxis — 3 Ärzte, 5 MFA. Allgemeinmedizin und Innere. Über 150 Patientenkontakte pro Woche. Kasse und Privat. Wir haben auch ein kleines Labor angeschlossen.", "hint": "Beschreiben Sie Ihre Praxis." },
    "ki_projekte": { "example": "Die Praxissoftware optimiert Termine ein bisschen mit KI. Wir testen gerade Dragon Medical für Arztbriefe — Diktieren statt Tippen. Eine MFA nutzt ChatGPT für Patienteninformationen. Und im Labor schauen wir uns an, ob KI bei der Befundvorauswertung helfen kann.", "hint": "Was gibt es schon in der Praxis?" },
    "zeitersparnis_prioritaet": { "example": "Arztbriefe: 1-2 Stunden pro Arzt pro Tag. Das ist Irrsinn. Überweisungen organisieren und Befunde hin- und herschicken. Terminplanung und diese ewigen Wartezeiten-Diskussionen. Und der Quartalsabschluss mit den Abrechnungen ist jedes Mal ein Alptraum.", "hint": "Was kostet Ihr Team am meisten Zeit?" },
    "geschaeftsmodell_evolution": { "example": "Wenn Patienten online vorher schon ein paar Fragen beantworten könnten, wäre der Termin viel effizienter. Ein Recall-System, das automatisch an Vorsorge erinnert. Und Telemedizin für Nachkontrollen — der Patient muss nicht jedes Mal in die Praxis kommen.", "hint": "Was würde Ihren Patienten und Ihrem Team helfen?" },
    "vision_3_jahre": { "example": "Arztbriefe in 2 Minuten statt 20. Patienten kriegen automatisch ihre Vorsorge-Erinnerungen. MFA werden von Papierkram entlastet. Und wir haben endlich wieder mehr als 5 Minuten pro Patient.", "hint": "Wie soll Ihre Praxis arbeiten?" },
    "strategische_ziele": { "example": "Arztbrief-Erstellung mit Spracherkennung — das ist Nummer 1. Automatische Terminplanung, die versteht was dringend ist. Recall-System für Vorsorgeuntersuchungen. Und die digitale Patientenakte wirklich vollständig nutzen.", "hint": "Was sind die dringendsten Ziele?" },
    "ki_guardrails": { "example": "Diagnosen stellt der Arzt, nicht der Computer — KI kann unterstützen, aber nicht entscheiden. Patientendaten bleiben im Praxissystem und in der Konnektorumgebung. Die Schweigepflicht gilt auch für KI-Systeme. Und bei diagnostischen Tools muss die Medizinprodukte-Verordnung beachtet werden.", "hint": "Welche medizinischen und rechtlichen Grenzen gibt es?" },
    "pilot_bereich": { "hint": "Praxen starten am besten mit Spracherkennung für Arztbriefe — die Zeitersparnis ist sofort spürbar." },
    "massnahmen_komplexitaet": { "hint": "Niedrig = Spracherkennung. Mittel = Recall und Triage-System. Hoch = diagnostische KI (da gelten strenge Vorschriften)." },
    "investitionsbudget": { "hint": "Praxisteams investieren 500-2.000€/Monat. Diagnostische Systeme kosten deutlich mehr." },
    "s5_vision": { "example": "Die Verwaltungslast muss runter, damit wir endlich wieder mehr Zeit für die Patienten haben. Das ist es im Kern.", "hint": "Was ist das Ziel?" }
  },
  "kmu": {
    "hauptleistung": { "example": "MVZ mit 15 Fachrichtungen und 80 Mitarbeitenden. Drei Standorte. Über 2.000 Patientenkontakte pro Woche. Eigenes Labor und Radiologie. Wir arbeiten an der Schnittstelle ambulant/stationär.", "hint": "Beschreiben Sie Ihr MVZ." },
    "ki_projekte": { "example": "In der Radiologie testen wir KI-Bildanalyse — die erkennt Auffälligkeiten, die der Radiologe dann prüft. Labor hat eine KI-Befundvorauswertung. Termine werden standortübergreifend KI-optimiert. Und wir schauen gerade, ob KI bei der Abrechnungs-Codierung helfen kann.", "hint": "Was läuft in den verschiedenen Bereichen?" },
    "zeitersparnis_prioritaet": { "example": "Arztbriefe über alle 15 Fachrichtungen — das ist ein Berg. Die Abrechnung mit EBM und DRG ist hochkomplex und fehleranfällig. Die Terminkoordination über 3 Standorte ist ein Logistik-Problem. Und QM-Dokumentation für die Zertifizierung verschlingt Ressourcen.", "hint": "Wo stecken die meisten Ressourcen?" },
    "geschaeftsmodell_evolution": { "example": "KI-Diagnostik als Qualitätsmerkmal — 'bei uns wird doppelt gecheckt, auch von der KI'. Telemedizin mit KI-Vorbefragung. Automatische Zuweiser-Kommunikation. Und datengestützte Versorgungsforschung für die Kostenträger.", "hint": "Was wird möglich?" },
    "vision_3_jahre": { "example": "KI-Bildanalyse in der Radiologie ist Standard. Arztbriefe schreiben sich quasi von alleine. Die Ressourcenplanung über alle Standorte ist KI-optimiert. Und Telemedizin mit KI-Vorbefragung gehört fest zu unserem Angebot.", "hint": "Wo soll Ihr MVZ stehen?" },
    "strategische_ziele": { "example": "KI-Bildanalyse in der Radiologie produktiv schalten. Arztbrief-Automation für alle Fachrichtungen. Abrechnungs-KI einführen. Und ein KI-Governance-Framework bauen, das auch den Datenschutzbeauftragten zufriedenstellt.", "hint": "Was steht auf der Liste?" },
    "ki_guardrails": { "example": "Medizinprodukte-Verordnung für alles, was diagnostisch ist. Patientendaten nur in zertifizierten Systemen. Der Arzt hat immer das letzte Wort. Ethikkommission einbeziehen bei heiklen Anwendungen. Und den Patienten sagen, wo KI mithilft.", "hint": "Welche Regeln braucht ein MVZ Ihrer Größe?" },
    "pilot_bereich": { "hint": "MVZ starten oft in der Radiologie (Bildanalyse) oder bei Arztbriefen — beides mit hohem Impact und klaren Messgrößen." },
    "massnahmen_komplexitaet": { "hint": "Niedrig = Dokumentation. Mittel = Abrechnungs-KI. Hoch = diagnostische KI (Zulassung nach Medizinprodukte-Verordnung nötig)." },
    "investitionsbudget": { "hint": "Gesundheits-KMU investieren 50.000-300.000€/Jahr. Medizinische KI-Systeme können nochmal deutlich mehr kosten." },
    "s5_vision": { "example": "Bessere Medizin mit weniger Bürokratie. Die KI soll unseren Ärzten und MFA den Rücken freihalten, damit sie sich auf die Patienten konzentrieren können.", "hint": "Was ist die Gesamtvision?" }
  }
},

"bau": {
  "solo": {
    "hauptleistung": { "example": "Freiberuflicher Architekt — Wohnungsbau und energetische Sanierung. Ich mache alles von der Entwurfsplanung bis zur Bauleitung. Meistens 3-5 Projekte parallel.", "hint": "Was planen oder bauen Sie?" },
    "ki_projekte": { "example": "Für Visualisierungen nutze ich manchmal Midjourney oder Stable Diffusion — damit kann ich Bauherren schnell zeigen, wie es aussehen könnte. ChatGPT hilft bei Leistungsbeschreibungen. Und ArchiCAD hat inzwischen auch KI-Features, die ich aber noch kaum kenne.", "hint": "Was nutzen Sie schon?" },
    "zeitersparnis_prioritaet": { "example": "Leistungsverzeichnisse und Ausschreibungen vorbereiten — das ist jedes Mal ein Kraftakt. Behörden-Korrespondenz und Baugenehmigungsunterlagen. Rendering für Kundenpräsentationen. Und das Dokumentieren auf der Baustelle.", "hint": "Was hält Sie von der eigentlichen Planungsarbeit ab?" },
    "geschaeftsmodell_evolution": { "example": "Schnelle Entwurfsvarianten per KI — dem Bauherren in Minuten drei Optionen zeigen statt in drei Tagen. Automatische Energieberechnungen. Virtuelle Begehungen als Premium-Service.", "hint": "Was wäre möglich?" },
    "vision_3_jahre": { "example": "Visualisierungen in Echtzeit, direkt im Kundengespräch. Leistungsverzeichnisse, die sich weitgehend aus dem BIM-Modell generieren. Und endlich wieder mehr Zeit für den kreativen Entwurf.", "hint": "Wie soll Ihre Arbeit aussehen?" },
    "strategische_ziele": { "example": "Renderings massiv beschleunigen. Leistungsverzeichnisse zumindest teilautomatisieren. Energieberechnungen per KI schneller hinkriegen.", "hint": "Was packen Sie als erstes an?" },
    "ki_guardrails": { "example": "Statik wird nie alleine von KI gemacht — da muss immer ein Prüfingenieur ran. KI-Visualisierungen kennzeichne ich klar als Entwurf. Baurechtliches prüfe ich immer manuell. Und Kostenangaben an Bauherren gehen nie ungeprüft raus.", "hint": "Wo sind die fachlichen Grenzen?" },
    "pilot_bereich": { "hint": "Architekten starten meistens mit Visualisierungen oder der Dokumentation — da spart man sofort sichtbar Zeit." },
    "massnahmen_komplexitaet": { "hint": "Niedrig = KI-Renderings. Mittel = LV-Automation. Hoch = BIM-KI-Integration." },
    "investitionsbudget": { "hint": "Die meisten Architekten starten mit 100-300€/Monat. BIM-KI-Lösungen kosten mehr." },
    "s5_vision": { "example": "Weniger Papierkram, schnellere Visualisierungen, mehr Zeit am Zeichentisch. Das wäre schon viel.", "hint": "Was ist Ihr Ziel?" }
  },
  "team": {
    "hauptleistung": { "example": "Architekturbüro mit 7 Leuten. Gewerbebau und öffentliche Gebäude. Wir arbeiten BIM-basiert und decken alle Leistungsphasen ab. Projekte zwischen 1 und 20 Millionen Bauvolumen.", "hint": "Beschreiben Sie Ihr Büro." },
    "ki_projekte": { "example": "Unsere BIM-Software hat KI-gestützte Kollisionsprüfung — spart viel Nacharbeit. Für Wettbewerbe nutzen wir KI-Renderings. ChatGPT hilft bei Leistungsbeschreibungen und Protokollen. Und wir testen gerade, ob KI die Mengenermittlung übernehmen kann.", "hint": "Was nutzt Ihr Team?" },
    "zeitersparnis_prioritaet": { "example": "Ausschreibungsunterlagen und LV-Erstellung — der größte Zeitfresser. Kollisionsprüfung im BIM-Modell war früher schlimmer, ist aber immer noch aufwändig. Behördenkommunikation und Genehmigungen. Und die Bauleitung-Doku mit Mängellisten und Fotos.", "hint": "Welche Planungsphasen kosten am meisten?" },
    "geschaeftsmodell_evolution": { "example": "Parametrisches Design — dem Kunden 20 Varianten in einer Stunde zeigen statt 3 in einer Woche. Automatisierte Nachhaltigkeitszertifizierung. Und langfristig: Digitaler Zwilling als Service nach der Fertigstellung.", "hint": "Was wird möglich?" },
    "vision_3_jahre": { "example": "BIM mit KI-Assistenz in jeder Leistungsphase. LV-Erstellung weitgehend automatisch. Energieplanung als Standard-KI-Feature. Und wir gewinnen mehr Wettbewerbe, weil wir schneller liefern.", "hint": "Wo soll Ihr Büro stehen?" },
    "strategische_ziele": { "example": "BIM-KI für Kollisionsprüfung und Mengenermittlung richtig nutzen. LV-Automatisierung für Standardprojekte. KI-Renderings als festen Workflow etablieren. Bauleitung-Doku digitalisieren.", "hint": "Was sind die Ziele?" },
    "ki_guardrails": { "example": "Statik ohne Prüfingenieur geht nicht — egal was die KI sagt. Baurechtliche Prüfung bleibt Handarbeit. KI-Kostenschätzungen sind Orientierung, nie verbindliche Kalkulation. Und das Urheberrecht an Entwürfen muss geklärt sein, wenn KI mithilft.", "hint": "Welche fachlichen und rechtlichen Grenzen gibt es?" },
    "pilot_bereich": { "hint": "Architekturbüros starten oft mit Renderings oder der Dokumentation — beides zeigt schnell sichtbaren Nutzen." },
    "massnahmen_komplexitaet": { "hint": "Niedrig = Renderings. Mittel = BIM-Integration. Hoch = Parametrisches Design und Digitaler Zwilling." },
    "investitionsbudget": { "hint": "Architekturbüros investieren 500-2.000€/Monat. BIM-KI-Lösungen ab 10.000€." },
    "s5_vision": { "example": "KI in jeder Planungsphase — von schnelleren Entwürfen über automatisierte Ausschreibungen bis zur Bauleitung. Das spart Zeit und macht uns wettbewerbsfähiger.", "hint": "Was ist die Vision?" }
  },
  "kmu": {
    "hauptleistung": { "example": "Bauunternehmen mit 80 Leuten: Schlüsselfertigbau, Sanierung und Projektentwicklung. Eigene Planungsabteilung. Projekte zwischen 5 und 50 Millionen. Gewerbe- und Wohnungsbau, regional verwurzelt.", "hint": "Beschreiben Sie Ihr Bauunternehmen." },
    "ki_projekte": { "example": "In der Planung nutzen wir BIM mit KI-Kollisionsprüfung. Wir testen Drohnen-Monitoring auf der Baustelle — die KI soll aus den Bildern den Baufortschritt erkennen. Die Kalkulation probiert ein KI-Tool für Kostenprognosen aus. Und der Einkauf nutzt KI-gestützte Preisvergleiche.", "hint": "Was läuft in den Abteilungen?" },
    "zeitersparnis_prioritaet": { "example": "Angebotskalkulation: 3-5 Tage pro Ausschreibung — und wir gewinnen nicht jede. Baustellendokumentation mit Mängelmanagement ist ein Riesenaufwand. Die Koordination der Nachunternehmer und Terminplanung. Materialbestellung und Lieferketten. Und ESG-Dokumentation wird auch immer aufwändiger.", "hint": "Wo liegen die größten Baustellen — pun intended?" },
    "geschaeftsmodell_evolution": { "example": "Schnellere Kalkulation = schnellere Reaktion auf Ausschreibungen = mehr Aufträge. Vorhersage von Bauzeit und Kosten, bevor es Überraschungen gibt. Digitaler Zwilling nach Fertigstellung als Service anbieten. Automatisches Nachhaltigkeitsreporting.", "hint": "Was wird strategisch möglich?" },
    "vision_3_jahre": { "example": "Durchgängig digital von der Kalkulation bis zur Abnahme. Terminplanung, die wirklich funktioniert. Automatische Mängelerkennung auf der Baustelle per Bild-KI. Und Nachhaltigkeitsbericht auf Knopfdruck.", "hint": "Wo soll Ihr Unternehmen stehen?" },
    "strategische_ziele": { "example": "Kalkulationszeit um 40% senken. Baustellendokumentation automatisieren — Foto machen, KI erkennt und dokumentiert. Terminplanung KI-optimieren. ESG-Reporting automatisieren.", "hint": "Was sind die Prioritäten?" },
    "ki_guardrails": { "example": "Standsicherheit und Statik: nie ohne Prüfingenieur, egal was KI sagt. Arbeitssicherheit: KI-Empfehlungen ersetzen keinen SiGeKo. Vergaberecht bei KI-gestützten Angeboten beachten. Und Gewährleistungsrisiken bei KI-Kalkulationen absichern.", "hint": "Welche bau- und arbeitsrechtlichen Grenzen gibt es?" },
    "pilot_bereich": { "hint": "Bauunternehmen starten oft mit der Kalkulation oder der Baustellendokumentation — beides spart direkt Zeit und Geld." },
    "massnahmen_komplexitaet": { "hint": "Niedrig = Dokumentations-KI. Mittel = Kalkulation und Terminplanung. Hoch = Digitaler Zwilling und Predictive Analytics." },
    "investitionsbudget": { "hint": "Bau-KMU investieren 20.000-100.000€/Jahr. Digitaler Zwilling kann deutlich mehr kosten." },
    "s5_vision": { "example": "Schneller kalkulieren, besser planen, weniger Überraschungen auf der Baustelle. Und Nachhaltigkeit nachweisen, ohne dafür eine halbe Abteilung zu beschäftigen.", "hint": "Was ist die Vision?" }
  }
},

"industrie": {
  "solo": {
    "hauptleistung": { "example": "Ich berate kleine Fertigungsbetriebe als Interim-Produktionsleiter und Lean-Berater. Prozesse verbessern, Verschwendung eliminieren, Durchlaufzeiten verkürzen. Meistens 2-3 Mandate gleichzeitig.", "hint": "In welchem Industriebereich arbeiten Sie?" },
    "ki_projekte": { "example": "ChatGPT für Analyseberichte und Schulungsmaterial. Excel mit KI-Add-ins, wenn ich Produktionsdaten auswerten muss. Und bei einem Kunden begleite ich gerade ein Predictive-Maintenance-Pilotprojekt.", "hint": "Was nutzen Sie?" },
    "zeitersparnis_prioritaet": { "example": "Prozessanalysen und Datenauswertungen für Kunden dauern jeweils 1-2 Tage. Berichte schreiben und Ergebnisse aufbereiten. Schulungsmaterial für die Werker erstellen. Und die Recherche zu neuen Fertigungstechnologien.", "hint": "Was kostet die meiste Zeit?" },
    "geschaeftsmodell_evolution": { "example": "Eine standardisierte KI-Prozessanalyse als Produkt — statt jedes Mal von null anzufangen. Predictive-Maintenance-Beratung als neues Feld. Automatisierte Produktions-Audits auf Basis von Maschinendaten.", "hint": "Was wird möglich?" },
    "vision_3_jahre": { "example": "Der Industrie-4.0-Berater, den man anruft, wenn KI in die Fertigung soll. Ein eigenes Analyse-Tool. Und 10+ Projekte pro Jahr statt 5.", "hint": "Wo sehen Sie sich?" },
    "strategische_ziele": { "example": "Die KI-Prozessanalyse als Standardangebot aufbauen. Erste Predictive-Maintenance-Projekte begleiten. Kontakte zu Maschinenherstellern knüpfen.", "hint": "Was steht an?" },
    "ki_guardrails": { "example": "Maschinensicherheit geht vor alles — KI-Empfehlungen nie ohne Fachprüfung umsetzen. Produktionsdaten der Kunden sind vertraulich. Keine automatisierten Eingriffe in Steuerungen ohne explizite Freigabe.", "hint": "Welche Sicherheitsgrenzen gibt es?" },
    "pilot_bereich": { "hint": "In der Industrie startet man am besten mit Datenanalyse — Produktionsdaten auswerten und Quick Wins identifizieren." },
    "massnahmen_komplexitaet": { "hint": "Niedrig = Analyse-Tools. Mittel = Predictive Analytics. Hoch = Maschinenintegration." },
    "investitionsbudget": { "hint": "Industrie-Berater starten mit 100-300€/Monat. Analyse-Werkzeuge ab 3.000€." },
    "s5_vision": { "example": "KMU-Fertigungsbetrieben zeigen, dass KI kein Hexenwerk ist — konkrete, bezahlbare Lösungen, die sofort was bringen.", "hint": "Was ist Ihr Ziel?" }
  },
  "team": {
    "hauptleistung": { "example": "Metallverarbeitung — CNC-Fertigung, Blechbearbeitung und Baugruppenmontage. 8 Leute. Wir sind Zulieferer für Maschinenbau und Automotive. Losgrößen von Einzelteilen bis 500 Stück.", "hint": "Was produzieren Sie?" },
    "ki_projekte": { "example": "Die CAM-Software hat eine KI-Werkzeugwegoptimierung — die nutzen wir. Angebotskalkulation machen wir noch mit Excel, aber mit einem KI-Add-in. Ein Kollege nutzt ChatGPT für technische Dokumentation. Unsere Maschinen haben Sensoren, aber die Daten wertet noch niemand richtig aus.", "hint": "Wo kommt Datenanalyse oder KI vor?" },
    "zeitersparnis_prioritaet": { "example": "Angebotskalkulation: 30-60 Minuten pro Anfrage — und viele werden dann doch nichts. Die Rüstzeiten zwischen Aufträgen. Qualitätsdokumentation und Prüfprotokolle sind ein Papierberg. Und die Nachkalkulation zeigt uns meistens erst hinterher, wo wir daneben lagen.", "hint": "Was kostet am meisten?" },
    "geschaeftsmodell_evolution": { "example": "Wenn wir in Minuten statt Stunden kalkulieren könnten, hätten wir einen echten Wettbewerbsvorteil. Predictive Maintenance für unsere CNC-Maschinen — ungeplante Stillstände kosten uns richtig Geld. Und automatische Qualitätsprüfung per Kamera statt manueller Messung.", "hint": "Was wäre ein echter Gamechanger?" },
    "vision_3_jahre": { "example": "Angebote in Minuten statt Stunden. Ungeplante Maschinenstillstände halbiert. Qualitätsprüfung teilweise automatisch. Und die Fertigungsplanung ist endlich so gut, dass wir nicht ständig umdisponieren müssen.", "hint": "Wo soll Ihr Betrieb stehen?" },
    "strategische_ziele": { "example": "Kalkulationstool mit KI-Unterstützung einführen. Maschinenmonitoring aufbauen — erstmal die Daten erfassen und verstehen. Qualitätsdoku digitalisieren.", "hint": "Was packen Sie an?" },
    "ki_guardrails": { "example": "Maschinensicherheit hat absolute Priorität — kein automatischer Eingriff, nie. Kundendaten und Zeichnungen bleiben vertraulich. Qualitätsprüfung: KI unterstützt, Endfreigabe macht der Fachmann. Betriebsdaten gehen nicht an externe KI-Anbieter.", "hint": "Wo sind die roten Linien?" },
    "pilot_bereich": { "hint": "Kleine Fertigungsbetriebe starten meistens mit der Kalkulation oder dem Erfassen von Maschinendaten — beides schnell und messbar." },
    "massnahmen_komplexitaet": { "hint": "Niedrig = Kalkulations-Tool. Mittel = Maschinenmonitoring. Hoch = Predictive Maintenance und automatische QS." },
    "investitionsbudget": { "hint": "Kleine Betriebe investieren 500-2.000€/Monat. Maschinenintegration ab 10.000€." },
    "s5_vision": { "example": "Schneller kalkulieren, Maschinen besser auslasten, Qualität zuverlässiger prüfen. Das macht uns als Zulieferer wettbewerbsfähiger.", "hint": "Was ist das Ziel?" }
  },
  "kmu": {
    "hauptleistung": { "example": "Mittelständischer Maschinenbauer mit 90 Leuten. Wir bauen Sondermaschinen und Automatisierungslösungen für Lebensmittel- und Pharma-Industrie. Exportieren in 20 Länder. Von der Konstruktion über Fertigung und Montage bis zum Service — alles aus einer Hand.", "hint": "Beschreiben Sie Ihr Unternehmen." },
    "ki_projekte": { "example": "Die Konstruktion testet KI-gestützte Bauteiloptimierung. Der Service bietet Remote-Monitoring mit Anomalie-Erkennung — wenn eine Maschine beim Kunden komisch läuft, merken wir das. In der Produktion hat das MES erste KI-Features. Vertrieb nutzt Lead-Scoring. Und in der Entwicklung schauen wir uns Generative Design an.", "hint": "Was läuft in den Abteilungen?" },
    "zeitersparnis_prioritaet": { "example": "40% der Konstruktionszeit geht für Varianten drauf — das Rad wird ständig neu erfunden. Der Service-Techniker am Telefon braucht ewig für die Fehldiagnose. Angebotskalkulation für eine Sondermaschine: 1-2 Wochen. Und die technische plus regulatorische Dokumentation ist ein Monster.", "hint": "Wo drückt es am meisten?" },
    "geschaeftsmodell_evolution": { "example": "Predictive Maintenance als Service verkaufen — nicht nur Maschinen bauen, sondern sie dauerhaft am Laufen halten. Das bringt laufende Einnahmen statt einmaliger Verkäufe. Dazu: ein Digitaler Zwilling für vorausschauende Wartung. Und KI-basierte Prozessoptimierung als Beratungsangebot für unsere Kunden.", "hint": "Welche neuen Geschäftsmodelle sehen Sie?" },
    "vision_3_jahre": { "example": "Service-Umsatz verdoppelt durch Predictive Maintenance. Konstruktionszeit für Standardvarianten halbiert. KI-gestützte Qualitätssicherung in der Fertigung. Digitaler Zwilling für jede neue Maschine.", "hint": "Wo soll Ihr Unternehmen stehen?" },
    "strategische_ziele": { "example": "Predictive-Maintenance-Service für 10 Pilotkunden aufsetzen. Konstruktion für Standardvarianten mit KI beschleunigen. MES-Daten für Fertigungsoptimierung richtig nutzen. Service-Chatbot für häufige technische Anfragen.", "hint": "Was sind die Prioritäten?" },
    "ki_guardrails": { "example": "Maschinensicherheit nach CE und Maschinenrichtlinie — da gibt es null Kompromiss. Konstruktionsunterlagen und Kundendaten sind streng vertraulich. KI im Service unterstützt den Techniker, ersetzt ihn nicht. Und bei Export-Software müssen wir auf Compliance achten.", "hint": "Welche Sicherheits- und Compliance-Anforderungen gelten?" },
    "pilot_bereich": { "hint": "Maschinenbauer starten oft beim Service (Remote-Monitoring) oder in der Konstruktion (Variantenoptimierung) — beides bringt hohen ROI." },
    "massnahmen_komplexitaet": { "hint": "Niedrig = Service-Chatbot. Mittel = Maschinendaten-Analyse. Hoch = Predictive Maintenance und Digitaler Zwilling." },
    "investitionsbudget": { "hint": "Industrie-KMU investieren 50.000-300.000€/Jahr. Digitaler Zwilling kann nochmal deutlich mehr kosten." },
    "s5_vision": { "example": "Aus einem Maschinenbauer wird ein Maschinendienstleister: Predictive Maintenance als neues Geschäftsfeld, schnellere Konstruktion und Maschinen, die immer laufen.", "hint": "Was ist die strategische Vision?" }
  }
},

"logistik": {
  "solo": {
    "hauptleistung": { "example": "Logistikberater — ich helfe kleinen Handels- und Produktionsfirmen, ihre Lieferketten und Lagerprozesse zu sortieren. 3-4 Mandate parallel, projektbasiert.", "hint": "Was genau machen Sie?" },
    "ki_projekte": { "example": "ChatGPT für Analyse-Berichte und Konzepte. Excel mit KI für Bestandsanalysen. Und bei einem Kunden begleite ich ein Routenoptimierungs-Pilotprojekt.", "hint": "Was nutzen Sie?" },
    "zeitersparnis_prioritaet": { "example": "Datenaufbereitung für jeden Kunden dauert 1-2 Tage. Berichte schreiben und präsentierbar machen. Recherche zu Logistik-Software — der Markt ist unübersichtlich. Und die Kundenkommunikation mit den ganzen Follow-ups.", "hint": "Was frisst die meiste Zeit?" },
    "geschaeftsmodell_evolution": { "example": "Eine standardisierte Supply-Chain-Analyse als Einstiegsprodukt. KI-Implementierungen in der Logistik begleiten. Benchmark-Reports automatisch erstellen.", "hint": "Was wird möglich?" },
    "vision_3_jahre": { "example": "Der Logistik-KI-Spezialist für KMU. Ein eigenes Analyse-Dashboard. Und mindestens 5 KI-Implementierungen pro Jahr begleiten.", "hint": "Wo sehen Sie sich?" },
    "strategische_ziele": { "example": "Standardisiertes Analyse-Angebot mit KI entwickeln. Erstes Routenoptimierungs-Projekt erfolgreich abschließen. Kontakte zu Logistik-Software-Anbietern aufbauen.", "hint": "Was steht an?" },
    "ki_guardrails": { "example": "Kundendaten vertraulich halten. KI-Empfehlungen immer mit Praxis-Check verbinden — was in der Theorie optimal ist, funktioniert nicht immer im echten Lager.", "hint": "Welche Grenzen gelten?" },
    "pilot_bereich": { "hint": "In der Logistikberatung startet man am besten mit Datenanalyse und Reporting." },
    "massnahmen_komplexitaet": { "hint": "Niedrig = Analyse-Tools. Mittel = Optimierungsprojekte begleiten. Hoch = eigene Plattform." },
    "investitionsbudget": { "hint": "Die meisten starten mit 100-300€/Monat. Analyse-Werkzeuge ab 2.000€." },
    "s5_vision": { "example": "KI-gestützte Logistikoptimierung als bezahlbare Lösung für kleine Firmen — nicht nur für die großen Konzerne.", "hint": "Was ist Ihre Vision?" }
  },
  "team": {
    "hauptleistung": { "example": "Spedition mit 8 Leuten. Stückgut und Teilladungen in DACH — 5 eigene LKW plus Netzwerkpartner. Unsere Kunden sind mittelständische Industrie- und Handelsfirmen.", "hint": "Was transportieren Sie, wie groß ist Ihre Flotte?" },
    "ki_projekte": { "example": "Telematik erfasst Fahrzeugdaten, aber eigentlich schaut da keiner richtig rein. Die Disposition macht noch alles mit Excel. Buchhaltung hat digitale Belege. KI? Nicht wirklich.", "hint": "Wo werden Daten erfasst, aber noch nicht ausgewertet?" },
    "zeitersparnis_prioritaet": { "example": "Disposition: jeden Tag 2-3 Stunden puzzeln, welcher LKW wohin fährt. Frachtpapiere und CMR ausfüllen. Kunden wollen dauernd wissen, wo ihr Zeug ist. Rechnungen schreiben und hinterher telefonieren, wenn nicht bezahlt wird. Und die Fahrer koordinieren kostet auch Nerven.", "hint": "Was frisst die meiste operative Zeit?" },
    "geschaeftsmodell_evolution": { "example": "Wenn die Tourenplanung per KI laufen würde, hätten wir weniger Leerkilometer — das spart direkt Diesel. Sendungsverfolgung automatisch — kein Kunde muss mehr anrufen. Und wenn wir wüssten, wann die Auftragslage anzieht, könnten wir besser planen.", "hint": "Was wäre ein echter Gewinn?" },
    "vision_3_jahre": { "example": "Tourenplanung per KI mit 15% weniger Leerkilometern. Kunden sehen in Echtzeit, wo ihr Paket ist. Frachtpapiere erstellen sich quasi von selbst. Und die Disposition macht in der halben Zeit doppelt so gute Pläne.", "hint": "Wo soll Ihre Spedition stehen?" },
    "strategische_ziele": { "example": "KI-Tourenplanung einführen. Sendungsverfolgung automatisieren. Frachtpapiere digital machen. Und die Telematik-Daten endlich für Wartungsplanung nutzen.", "hint": "Was packen Sie an?" },
    "ki_guardrails": { "example": "Fahrersicherheit geht vor alles — keine Routenänderungen, die der Fahrer nicht bestätigt hat. Lenk- und Ruhezeiten sind Gesetz, da gibt es keinen Spielraum. Kundendaten bleiben bei uns. Und unsere Disponenten behalten das letzte Wort.", "hint": "Welche Regeln sind nicht verhandelbar?" },
    "pilot_bereich": { "hint": "Speditionen starten am besten mit der Tourenplanung — direkt messbar an Kilometern und Dieselkosten." },
    "massnahmen_komplexitaet": { "hint": "Niedrig = Telematik-Daten auswerten. Mittel = KI-Tourenplanung. Hoch = Dynamic Pricing und Prognosen." },
    "investitionsbudget": { "hint": "Kleine Speditionen investieren 500-2.000€/Monat. Tourenplanungs-Software ab 5.000€." },
    "s5_vision": { "example": "Weniger Leerkilometer, schnellere Disposition, zufriedenere Kunden. Die Technik soll uns helfen, nicht ersetzen.", "hint": "Was ist das Ziel?" }
  },
  "kmu": {
    "hauptleistung": { "example": "Logistikdienstleister mit 70 Leuten: Kontraktlogistik, Lagerhaltung und Distribution. 3 Standorte, 25.000 m² Lagerfläche. WMS und TMS im Einsatz. Kunden aus Automotive, Pharma und E-Commerce.", "hint": "Beschreiben Sie Ihr Unternehmen." },
    "ki_projekte": { "example": "Der WMS-Anbieter hat KI-gestützte Lagerplatzoptimierung — die testen wir gerade. Im Fuhrpark läuft Telematik mit Anomalie-Erkennung. Für einen E-Commerce-Kunden probieren wir KI-gestützte Nachfrageprognosen. Und bei der Personalplanung testen wir, ob KI die Schichten besser hinkriegt.", "hint": "Was läuft?" },
    "zeitersparnis_prioritaet": { "example": "Die Kommissionierer laufen im Lager zu viele Meter — Wegeoptimierung wäre riesig. Personalplanung bei den saisonalen Schwankungen ist ein Krampf. Transportplanung mit Multi-Stop über 3 Standorte ist täglich eine Puzzle-Aufgabe. Schadensmeldungen. Und die Pharma-Kunden wollen GDP-konforme Dokumentation.", "hint": "Wo sind die größten Baustellen?" },
    "geschaeftsmodell_evolution": { "example": "Bessere Kommissionierung als Premium-Service verkaufen. Den Kunden vorhersagen, was sie nächste Woche brauchen. Qualitätskontrolle im Wareneingang automatisieren. Und ein Dashboard, das die Kunden selber nutzen können.", "hint": "Welche neuen Services werden möglich?" },
    "vision_3_jahre": { "example": "20% schnellere Kommissionierung durch KI-Wegeoptimierung. Personalplanung, die saisonale Spitzen vorhersieht. Echtzeit-Dashboard für die Top-10-Kunden. Und Wareneingang automatisch geprüft.", "hint": "Wo soll Ihr Unternehmen stehen?" },
    "strategische_ziele": { "example": "WMS-KI für alle Standorte ausrollen. Personalplanung mit KI einführen. Kunden-Dashboard für die wichtigsten Kunden. Und Nachfrageprognosen als echten Service anbieten.", "hint": "Was steht auf der Liste?" },
    "ki_guardrails": { "example": "Pharma-Logistik: GDP-Konformität ist Pflicht, jede KI-Entscheidung muss dokumentiert sein. Arbeitssicherheit im Lager: kein KI-gesteuerter Stapler ohne Sicherheitsfreigabe. Kundendaten strikt getrennt. Und der Betriebsrat muss bei der Personalplanung-KI mitmachen.", "hint": "Welche Anforderungen gelten?" },
    "pilot_bereich": { "hint": "Logistik-KMU starten oft bei der Lageroptimierung (WMS-KI) oder Tourenplanung — direkt messbare KPIs." },
    "massnahmen_komplexitaet": { "hint": "Niedrig = WMS-Features aktivieren. Mittel = Personalplanung und Tourenoptimierung. Hoch = Predictive Demand und Kunden-Plattform." },
    "investitionsbudget": { "hint": "Logistik-KMU investieren 30.000-200.000€/Jahr. Lagerautomatisierung mit KI kann deutlich mehr kosten." },
    "s5_vision": { "example": "Bessere Auslastung, genauere Prognosen und ein Service, den unsere Kunden sonst nur von den ganz Großen kennen.", "hint": "Was ist die Vision?" }
  }
},

"gastronomie": {
  "solo": {
    "hauptleistung": { "example": "Ich habe ein kleines Café in der Innenstadt — 40 Plätze, Frühstück, Mittagstisch und Kuchen. Dazu Take-away und ab und zu Catering für kleine Events. Social Media mache ich abends selber.", "hint": "Was bieten Sie an?" },
    "ki_projekte": { "example": "Instagram-Texte formuliere ich manchmal mit ChatGPT. Die Kasse kann ein paar Auswertungen, aber die schau ich mir ehrlich gesagt selten an. Reservierungen laufen über eine Plattform. Das war's eigentlich.", "hint": "Nutzen Sie irgendwo digitale Helfer?" },
    "zeitersparnis_prioritaet": { "example": "Jeden Morgen Einkaufsliste machen und bestellen — 1-2 Stunden die ich lieber in der Küche wäre. Social Media pflegen, wenn ich eigentlich schon tot bin. Speisekarte umschreiben bei jedem Saisonwechsel. Buchhaltung. Und Google-Bewertungen beantworten frisst auch Zeit.", "hint": "Was nervt neben dem Kochen am meisten?" },
    "geschaeftsmodell_evolution": { "example": "Wenn ich wüsste, was sich am besten verkauft, könnte ich die Speisekarte optimieren — weniger Verschwendung, bessere Margen. Social Media auf Autopilot wäre ein Traum. Und personalisierte Angebote für Stammgäste — 'Ihr Lieblingskuchen ist heute wieder da!'", "hint": "Was wäre cool, wenn es einfach ginge?" },
    "vision_3_jahre": { "example": "Einkauf läuft smart — weniger Reste, bessere Planung. Social Media ist vorgeplant und ich muss nur noch draufschauen. Reservierungen mit Auslastungsoptimierung. Und vor allem: mehr Zeit zum Kochen und für die Gäste.", "hint": "Wie soll Ihr Café in ein paar Jahren laufen?" },
    "strategische_ziele": { "example": "Social-Media-Posts vorplanen statt abends improvisieren. Einkaufsliste automatisch aus den Verkaufsdaten der letzten Wochen erstellen. Google-Bewertungen schneller beantworten.", "hint": "Was würden Sie als erstes ändern?" },
    "ki_guardrails": { "example": "Was auf den Teller kommt, entscheide ich — da redet keine Maschine mit. Preise ändert keiner außer mir. Allergie-Infos nie automatisch — da muss ich persönlich draufschauen. Und Kundendaten gehen nirgendwohin.", "hint": "Was bleibt Chefsache?" },
    "pilot_bereich": { "hint": "In der Gastro startet man am besten mit Social Media oder der Einkaufsplanung — beides sofort spürbar." },
    "massnahmen_komplexitaet": { "hint": "Niedrig = Social-Media-KI und Bewertungen. Mittel = Einkaufsoptimierung. Hoch = Auslastungsmanagement." },
    "investitionsbudget": { "hint": "Die meisten Gastronomen starten mit 30-100€/Monat — das reicht für den Anfang." },
    "s5_vision": { "example": "Weniger Papierkram, weniger Verschwendung, mehr Zeit in der Küche und für meine Gäste. Dafür brauche ich keinen Roboter — nur ein bisschen smarte Unterstützung.", "hint": "Was wäre der größte Gewinn?" }
  },
  "team": {
    "hauptleistung": { "example": "Boutique-Hotel mit Restaurant, 30 Zimmer, 8 Leute. Mischung aus Geschäftsreisenden unter der Woche und Touristen am Wochenende. Eigene Website plus Booking.com und HRS.", "hint": "Beschreiben Sie Ihren Betrieb." },
    "ki_projekte": { "example": "Booking.com schlägt uns manchmal Preise vor — da folgen wir ab und zu. Auf der Website haben wir einen einfachen Chat-Bot, der die häufigsten Fragen beantwortet. Social Media macht eine Kollegin mit Canva-KI. Das war's eigentlich.", "hint": "Was gibt es schon — auch wenn es noch nicht richtig KI ist?" },
    "zeitersparnis_prioritaet": { "example": "Reservierungen über 3 verschiedene Kanäle managen — ein einziger Abstimmungs-Alptraum. Gäste-Anfragen beantworten: 'Habt ihr am Samstag noch frei?', 'Kann mein Hund mit?', 'Was kostet das Zimmer mit Seeblick?'. Preise je nach Auslastung anpassen machen wir noch manuell. Und die Bewertungen auf 5 Plattformen beantworten.", "hint": "Was kostet Ihr Team am meisten Zeit?" },
    "geschaeftsmodell_evolution": { "example": "Preise, die sich automatisch an die Nachfrage anpassen — statt dass wir das per Hand machen. Gäste, die vor der Anreise schon personalisierte Tipps bekommen. Und vorhersagen können, wann wir voll sind, damit wir genug Leute einteilen.", "hint": "Was wäre ein Gamechanger?" },
    "vision_3_jahre": { "example": "Preise optimieren sich quasi von selbst. Standard-Gästefragen beantwortet der Bot. Jeder Gast bekommt vor der Anreise persönliche Restaurant- und Ausflugstipps. Und die Personalplanung passt zur tatsächlichen Auslastung, nicht zum Bauchgefühl.", "hint": "Wo soll Ihr Betrieb stehen?" },
    "strategische_ziele": { "example": "Revenue Management mit einem KI-Tool einführen — Preise sollen sich an der Nachfrage orientieren. Den Chatbot auf der Website verbessern. Bewertungen schneller beantworten. Und Gäste vor der Anreise persönlich ansprechen.", "hint": "Was sind die Prioritäten?" },
    "ki_guardrails": { "example": "Persönlicher Service bleibt unser Markenzeichen — Technik im Hintergrund, Gastfreundschaft vorne. Gästedaten gehören uns, nicht den Plattformen. Preise: KI empfiehlt, wir entscheiden. Und automatische Absagen an Gäste gibt es nicht.", "hint": "Was muss menschlich bleiben?" },
    "pilot_bereich": { "hint": "Hotels starten am besten mit Revenue Management oder dem Gäste-Chatbot — beides messbar an Umsatz und Zufriedenheit." },
    "massnahmen_komplexitaet": { "hint": "Niedrig = Chatbot und Bewertungen. Mittel = Revenue Management. Hoch = Personalisierung und Prognosen." },
    "investitionsbudget": { "hint": "Hotel-Teams investieren 300-1.000€/Monat. Revenue-Management-Systeme ab 5.000€." },
    "s5_vision": { "example": "Bessere Auslastung, zufriedenere Gäste und weniger Stress für unser Team — Technik soll uns helfen, nicht dominieren.", "hint": "Was ist die Vision?" }
  },
  "kmu": {
    "hauptleistung": { "example": "Hotelgruppe mit 3 Häusern, zusammen 200 Zimmer und 60 Leute. 2 Restaurants, Tagungsbereich und Spa. Geschäftsreisende, Tagungen und Freizeit-Gäste. Eigenes Buchungssystem und Channel Manager.", "hint": "Beschreiben Sie Ihre Gruppe." },
    "ki_projekte": { "example": "Revenue Management System mit KI-Preisvorschlägen ist im Einsatz. Website-Chatbot für Buchungsanfragen. Social-Media-Team nutzt KI für Content. Wir testen KI-Personalplanung. Und Housekeeping probiert, ob KI die Zimmerzuteilung verbessern kann.", "hint": "Was läuft?" },
    "zeitersparnis_prioritaet": { "example": "Die Koordination über 3 Häuser ist ein Vollzeitjob. Veranstaltungsanfragen: jedes Angebot ist individuell und aufwändig. Schichtplanung für 60 Leute — mit Urlaub, Krankheit und Saisonspitzen. F&B-Einkauf und -Kalkulation. Und die Qualitätsstandards über alle Häuser gleich zu halten.", "hint": "Wo sind die größten Baustellen?" },
    "geschaeftsmodell_evolution": { "example": "Eine zentrale KI-Steuerung für alle 3 Häuser — Preise, Personal, Marketing aus einem Guss. Gäste, die in einem Haus waren, bekommen im nächsten personalisierte Angebote. Vorhersagen für Buchungstrends und Events. Und das F&B-Konzept datenbasiert weiterentwickeln.", "hint": "Was wird mit KI möglich?" },
    "vision_3_jahre": { "example": "Alle 3 Häuser zentral KI-gesteuert: Preise, Personal und Marketing. Gästeprofile synchronisiert — wer in Hamburg war, wird in München wiedererkannt. Personalkosten 10% optimiert. Und 70% der Standard-Gästefragen beantwortet der Bot.", "hint": "Wo soll Ihre Gruppe stehen?" },
    "strategische_ziele": { "example": "Revenue Management für alle 3 Häuser zentralisieren. KI-Personalplanung einführen. Gästekommunikation über alle Kanäle bündeln. F&B-Kalkulation datenbasiert machen.", "hint": "Was steht auf der Roadmap?" },
    "ki_guardrails": { "example": "Gastfreundschaft ist und bleibt menschlich — KI läuft im Hintergrund. Gästedaten DSGVO-konform und nie an Dritte. Revenue Manager entscheidet, nicht der Algorithmus. Betriebsrat muss bei der Personalplanung mitsprechen. Und Allergen-Informationen immer manuell geprüft.", "hint": "Welche Regeln braucht Ihre Gruppe?" },
    "pilot_bereich": { "hint": "Hotelgruppen profitieren am meisten von zentralem Revenue Management — ein System für alle Häuser mit sofortigem Umsatzeffekt." },
    "massnahmen_komplexitaet": { "hint": "Niedrig = zentrale Tools. Mittel = Multi-Property-Integration. Hoch = Gästereise-Personalisierung." },
    "investitionsbudget": { "hint": "Hotel-KMU investieren 20.000-100.000€/Jahr. Multi-Property-Systeme ab 50.000€." },
    "s5_vision": { "example": "KI als zentrales Steuerungsinstrument für unsere Hotelgruppe — optimierte Preise, effiziente Personalplanung und ein Gästeerlebnis, das sich durchgängig persönlich anfühlt.", "hint": "Was ist die Gesamtvision?" }
  }
},

"default": {
  "default": {
    "hauptleistung": { "example": "Beschreiben Sie einfach, was Sie machen: Was verkaufen oder bieten Sie an? Wer kauft bei Ihnen oder bucht Sie? Und was unterscheidet Sie von anderen in Ihrer Branche?", "hint": "Stichworte reichen völlig — wir machen daraus eine strukturierte Analyse." },
    "ki_projekte": { "example": "Ich nutze ChatGPT ab und zu für Texte und Recherche. Richtig geplante KI-Projekte gibt es bei mir noch nicht, aber ich würde gerne mehr automatisieren.", "hint": "Auch wenn Sie nur manchmal ChatGPT nutzen — das zählt schon." },
    "zeitersparnis_prioritaet": { "example": "E-Mails beantworten, Angebote schreiben, Buchhaltung, Dokumentation — die ganzen Aufgaben, die mich von meiner eigentlichen Arbeit abhalten.", "hint": "Denken Sie an die Dinge, die Sie nerven und die sich ständig wiederholen." },
    "geschaeftsmodell_evolution": { "example": "Neue digitale Angebote, die vorher zu aufwändig waren. Automatische Empfehlungen für Kunden. Oder eine bessere Datennutzung — wir haben bestimmt Infos, die wir noch nicht richtig nutzen.", "hint": "Was wäre möglich, wenn Technik kein Hindernis wäre?" },
    "vision_3_jahre": { "example": "Die Routine läuft von alleine, ich habe mehr Zeit für die Arbeit, die mir Spaß macht und die meine Kunden wirklich weiterbringt. Effizientere Abläufe, weniger Zettelwirtschaft.", "hint": "Wie soll sich Ihr Arbeitsalltag verändern?" },
    "strategische_ziele": { "example": "Die 2-3 nervigsten Routineaufgaben automatisieren. Kundenkommunikation beschleunigen. Und Entscheidungen auf Basis von echten Daten treffen statt nach Bauchgefühl.", "hint": "Was würden Sie als erstes ändern, wenn Sie einen unsichtbaren Helfer hätten?" },
    "ki_guardrails": { "example": "Wichtige Entscheidungen treffe immer ich persönlich. Kundendaten bleiben bei mir und gehen nicht an Dritte. Und was KI generiert, lese ich durch, bevor es rausgeht.", "hint": "Was darf eine Maschine bei Ihnen nicht alleine entscheiden?" },
    "pilot_bereich": { "hint": "Überlegen Sie, wo sich Aufgaben ständig wiederholen und viel Zeit kosten — das ist meistens der beste Startpunkt." },
    "massnahmen_komplexitaet": { "hint": "Niedrig = fertige Tools nutzen, die schon da sind. Mittel = neue Tools einrichten und Abläufe anpassen. Hoch = eine eigene Lösung bauen lassen." },
    "investitionsbudget": { "hint": "Fangen Sie klein an — 30-100€/Monat für erste Tools. Größere Projekte planen Sie, wenn Sie wissen, was funktioniert." },
    "s5_vision": { "example": "Weniger Routinearbeit, mehr Zeit für das, was ich am besten kann — meine Kernkompetenz und meine Kunden.", "hint": "Was wäre für Sie persönlich der größte Gewinn?" }
  }
}

};
