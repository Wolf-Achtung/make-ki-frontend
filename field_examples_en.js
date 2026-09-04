// FIELD_EXAMPLES (EN) — Dynamic context examples by industry + size
// English counterpart to field_examples_de.js, mirroring its structure and tone.
// Phase 1 (media focus): covers "medien" (3 sizes) + "default" fallback.
// Other industries fall back to "default" via the standard lookup chain.
// Fields: 7 textarea (hauptleistung, ki_projekte, zeitersparnis_prioritaet, geschaeftsmodell_evolution, vision_3_jahre, strategische_ziele, ki_guardrails)
//         3 select hints (pilot_bereich, massnahmen_komplexitaet, investitionsbudget)
//         1 strategy (s5_vision)
// Lookup: branche+size → branche+"default" → "default"+size → "default"+"default"

var FIELD_EXAMPLES = {

"medien": {
  "solo": {
    "hauptleistung": { "example": "I am a freelance editor and filmmaker: I edit documentaries and corporate films, shoot smaller projects myself, and handle the complete edit for production companies — from rough cut to delivery, including subtitles and the different versions for broadcast, web, and social media.", "hint": "What do you produce, for whom, and how do you work?" },
    "ki_projekte": { "example": "I have interviews transcribed automatically and use the transcripts for logging — that way I can find statements in the footage without scrubbing through everything. Speech recognition creates the subtitles; I only correct them afterwards. For treatments, ChatGPT helps me build a first structure, and I am currently trying out image generators for pitch moodboards.", "hint": "Which work steps do you already handle with AI support?" },
    "zeitersparnis_prioritaet": { "example": "Reviewing and logging eats the most time: with 30 hours of interview footage I spend days just listening through before the rough cut even starts. Then the versioning — full-length cut, 90-second version, vertical for social, each with subtitles. And every client revision round means new exports, new uploads.", "hint": "What eats your productive time — the time that should actually go into the creative work?" },
    "geschaeftsmodell_evolution": { "example": "If transcription, subtitles, and versioning ran almost by themselves, I could offer multilingual versions as a standard service. And a social media package with short clips for every long-form film — so far I often turn that down because the effort blows the day rate.", "hint": "Which new offerings would be possible if certain work steps ran automatically?" },
    "vision_3_jahre": { "example": "The rough-cut preparation — reviewing, logging, transcribing — is done by the machine; I do the dramaturgical fine cut. I want to develop more of my own documentary projects instead of only doing commissioned editing. And subtitles plus language versions are part of the standard package without costing me my evenings.", "hint": "How should your work change?" },
    "strategische_ziele": { "example": "First: a fixed workflow for transcription and logging so every rough cut starts faster. Second: automate subtitles and versioning. Third: a clean archive with metadata so I can find material from old projects when a client wants a new version after two years.", "hint": "What would you tackle first?" },
    "ki_guardrails": { "example": "The final cut and every dramaturgical decision stay with me. I do not upload raw footage with identifiable people to open AI tools — the consent forms of the people filmed do not cover that. AI voices only as placeholders in drafts; in the final version only with the client's explicit approval and labelled as required by the AI Act for synthetic content.", "hint": "What must stay in your creative hands?" },
    "pilot_bereich": { "hint": "In editing, AI helps first with transcription, logging, and subtitles — you will notice the difference immediately." },
    "massnahmen_komplexitaet": { "hint": "Low = use the AI features in your editing software and transcription service. Medium = a fixed workflow for logging, subtitles, and versioning. High = your own automated pipelines, e.g. for archive and metadata." },
    "investitionsbudget": { "hint": "Most freelancers start with 50-150 euros per month for transcription, subtitles, and editing tools." },
    "s5_vision": { "example": "The machine takes over reviewing, transcribing, and versioning — I tell the story. More time in the edit for dramaturgy, less for grunt work.", "hint": "What is your goal?" }
  },
  "team": {
    "hauptleistung": { "example": "We are a production company with 8 people: corporate films, documentaries, and commercials — from story development through the shoot to post-production. For regular clients we also run ongoing formats with monthly deliveries including social media cuts.", "hint": "What do you produce, how is your team set up, and who are your clients?" },
    "ki_projekte": { "example": "Interviews and soundbites are transcribed automatically, which makes logging noticeably faster. In story development we use ChatGPT for treatment drafts and research summaries. For pitches, the creatives build moodboards and simple pre-viz with image generators. Speech recognition handles subtitles; corrections are done by hand.", "hint": "What do the different people on your team already use — even if it's just experiments?" },
    "zeitersparnis_prioritaet": { "example": "Per project, 2-3 days go into reviewing and logging alone before the rough cut begins. Versioning is exploding: every film needs a full-length cut, cutdowns, vertical formats, and subtitles in two languages. Rights clearance and consent forms — who is in the shot, which music, which licence — cost hours per production. And we write proposals and treatments in the evenings.", "hint": "Which work steps cost the most time?" },
    "geschaeftsmodell_evolution": { "example": "Social media packages from every shoot as a fixed add-on product — once cutdowns and subtitles run semi-automatically, that finally pays off. Multilingual versions for international clients. And we could use our footage archive with clean metadata for follow-up projects instead of scheduling reshoots.", "hint": "What becomes realistic as a new offering thanks to AI?" },
    "vision_3_jahre": { "example": "Post-production takes half the time: logging, rough-cut preparation, subtitles, and versioning run largely automatically. Our archive is searchable — 'all drone shots harbour, evening light' returns hits instead of search marathons. And we develop more of our own formats because treatments and pitch material come together faster.", "hint": "How should your production work in 2-3 years?" },
    "strategische_ziele": { "example": "A unified workflow for transcription, logging, and subtitles across all projects — not every editor doing their own thing. Open up the archive with metadata. Semi-automate the versioning for social media. And a checklist for consent forms and rights clearance that runs alongside every shoot.", "hint": "What are the most important priorities?" },
    "ki_guardrails": { "example": "Cuts and client material do not go into open AI tools — footage shows people who never consented to that. AI images only in moodboards and pre-viz; in the finished film only with client approval and labelling per the AI Act. Voices or faces are never synthetically recreated without the person's written consent. An editor is always responsible for the fine cut.", "hint": "Which quality and ethics rules does your team need?" },
    "pilot_bereich": { "hint": "Production companies usually start with transcription, logging, and subtitles — that relieves every project immediately." },
    "massnahmen_komplexitaet": { "hint": "Low = use AI features in editing and transcription tools. Medium = fixed team workflows for logging, subtitles, and versioning. High = a searchable archive with automatic metadata." },
    "investitionsbudget": { "hint": "Small studios usually invest 300-1,000 euros per month in licences. An archive project starts at 5,000 euros." },
    "s5_vision": { "example": "Fewer night shifts in post, more time for shooting and dramaturgy. The routine — logging, subtitling, versioning — runs in the background.", "hint": "What is the vision?" }
  },
  "kmu": {
    "hauptleistung": { "example": "We are a studio with 45 people: commissioned TV productions, post-production for external clients — editing, grading, VFX, sound design — and a growing games/interactive unit. Plus a footage archive from 15 years of production that editorial teams regularly request.", "hint": "Describe your media company." },
    "ki_projekte": { "example": "Post uses automatic transcription and scene-based logging for rough cuts. VFX is testing AI-assisted rotoscoping and upscaling of archive footage. Subtitles and language versions run semi-automatically with human final checks. Story development is trying AI for treatment drafts and pre-viz. And we are currently auto-tagging the archive with metadata — deliberately excluding faces as long as the legal situation is unclear.", "hint": "What is running in the individual departments — even if it's still experiments?" },
    "zeitersparnis_prioritaet": { "example": "Logging and rough-cut preparation tie up the edit assistants for days on every production. Versioning has become its own trade: broadcaster, streaming, social, international versions — each with its own subtitle and audio tracks. In the archive, nobody finds anything without the colleagues with long memories. And rights clearance — music, footage, consent forms — regularly delays deliveries.", "hint": "Where does it hurt the most?" },
    "geschaeftsmodell_evolution": { "example": "The archive turns from a cost factor into a revenue stream: cleanly tagged, we can licence footage instead of just storing it. Versioning and subtitling as a standalone service for other productions. And in the games unit, AI-assisted asset creation significantly shortens the prototype phase.", "hint": "What does AI change about your business?" },
    "vision_3_jahre": { "example": "The edit assistants review with AI pre-sorting instead of scrubbing linearly. The complete archive is searchable via metadata and contributes to revenue. Versioning runs as an automated pipeline with final sign-off. The rights and consent status is documented per clip instead of in binders. And AI Act labelling of synthetic content is a fixed part of sign-off, not an afterthought.", "hint": "Where should your media company be?" },
    "strategische_ziele": { "example": "First: transcription, logging, and subtitles as a standard pipeline across all productions. Second: finish the archive metadata project, including documented rights and consent per clip. Third: automate the versioning pipeline. Fourth: clear house rules on which AI tools may be used with which material — and training for them.", "hint": "What is on the agenda?" },
    "ki_guardrails": { "example": "Raw footage and unreleased cuts stay on our own systems — none of it goes into open AI services. Synthetic voices or faces only with the written consent of the person concerned, properly documented. AI-generated or substantially altered content is labelled per the AI Act — in the credits and in the metadata. Face recognition in the archive only after legal review. Editorial and artistic final sign-off is always done by a human.", "hint": "Which editorial and ethical lines do you draw?" },
    "pilot_bereich": { "hint": "Larger studios get the most out of standardising logging and subtitles or opening up the archive with metadata." },
    "massnahmen_komplexitaet": { "hint": "Low = AI features of your existing editing and VFX tools. Medium = automated pipelines for transcription, subtitles, and versioning. High = archive indexing with metadata and rights management." },
    "investitionsbudget": { "hint": "Studios of this size invest 30,000-150,000 euros per year. An archive project quickly exceeds that." },
    "s5_vision": { "example": "The grunt work — reviewing, subtitling, versioning — runs automatically; the people do dramaturgy, cinematography, and client work. And the archive earns money instead of costing space.", "hint": "What is the overall vision?" }
  }
},

"medien/games": {
  "default": {
    "hauptleistung": { "example": "We develop mobile and PC games with a small team: concept, art, code and live operations after launch. What sets us apart: we release games in several languages at once." },
    "ki_projekte": { "example": "Concept art and first asset variants are drafted with an image model; the art team does the finishing. For dialogue and item texts we use ChatGPT as a draft; localisation is still done by hand." },
    "zeitersparnis_prioritaet": { "example": "Localisation and QA eat the most time: every text patch has to go into eight languages, and playtests catch bugs late." },
    "pilot_bereich": { "hint": "In games, AI helps first with localisation, asset variants and test automation — every patch saves time right away." },
    "s5_vision": { "example": "Localisation and regression tests run automatically; the team focuses on game feel and community. New languages take days, not weeks." },
  }
},
"medien/verlag_publishing": {
  "default": {
    "hauptleistung": { "example": "We are a specialist publisher with journals and non-fiction, print and digital. What sets us apart: close contact with our authors and an editorial team that makes expert topics readable." },
    "ki_projekte": { "example": "Manuscripts go through a language model for a first check — spelling, structure, obvious gaps. The editors decide what stays. Catalogue metadata is still written by hand." },
    "zeitersparnis_prioritaet": { "example": "The first correction loop and the catalogue metadata cost the most: every manuscript goes back and forth two or three times, and every title needs a blurb, keywords and summaries for three channels." },
    "pilot_bereich": { "hint": "In publishing, AI helps first with pre-editing and catalogue metadata — that is where the editorial team notices the difference immediately." },
    "s5_vision": { "example": "Pre-editing and metadata run ahead automatically; the editors concentrate on content and tone. Every title is fully described in all channels on publication day." },
  }
},
"medien/musik_audio": {
  "default": {
    "hauptleistung": { "example": "We run a recording studio: dubbing, audiobooks, podcast production and mixing for film and advertising. What sets us apart: a fixed pool of voice actors and an edit that sounds as if nothing was cut." },
    "ki_projekte": { "example": "Raw recordings are transcribed automatically so we find takes faster. We tested voice synthesis for layouts — for the final version only with the speaker's explicit consent." },
    "zeitersparnis_prioritaet": { "example": "Reviewing takes and podcast clean-up eat the most time: for one hour of raw audio we spend two hours tidying before the actual mix begins." },
    "pilot_bereich": { "hint": "In the studio, AI helps first with transcription, take search and noise removal — the mix stays handmade." },
    "s5_vision": { "example": "Transcription, take search and pre-cleaning run automatically; the mix and the work with the speakers stay with us. Voice synthesis only where all rights are cleared." },
  }
},
"medien/agentur_design": {
  "default": {
    "hauptleistung": { "example": "We are an agency for advertising, PR and web design with a small creative team. What sets us apart: concept, copy, design and campaign from one source." },
    "ki_projekte": { "example": "First copy drafts and moodboards are created with AI; the team sharpens and decides. We use image generation for pitches, never for final client visuals without cleared rights." },
    "zeitersparnis_prioritaet": { "example": "Pitches and approval loops cost the most: every tender produces three concept directions, and every client round brings new variants." },
    "pilot_bereich": { "hint": "In an agency, AI helps first with pitch drafts, copy variants and approval documentation — you will notice it at the next pitch." },
    "s5_vision": { "example": "Pitch modules, copy variants and approval records run ahead with AI; the team has more time for the idea and the client." },
  }
},
"medien/content_creation": {
  "default": {
    "hauptleistung": { "example": "We produce content for social media and our own channels: short videos, podcasts, newsletters. What sets us apart: one recognisable style across all formats and a rhythm the community knows." },
    "ki_projekte": { "example": "From one long video we cut several short formats with AI; subtitles and descriptions are generated automatically. We decide what goes out." },
    "zeitersparnis_prioritaet": { "example": "Splitting into formats and writing descriptions eat the most time: one shoot becomes ten posts, and each needs a title, copy, subtitles and labelling." },
    "pilot_bereich": { "hint": "In content creation, AI helps first with subtitles, format variants and descriptions — labelling synthetic content is part of it from day one." },
    "s5_vision": { "example": "Subtitles, variants and descriptions run automatically; the style and the selection stay with us. Every post is correctly labelled before it goes out." },
  }
},
"default": {
  "default": {
    "hauptleistung": { "example": "Simply describe what you do: What do you sell or offer? Who buys from you or books you? And what sets you apart from others in your industry?", "hint": "Keywords are perfectly fine — we turn them into a structured analysis." },
    "ki_projekte": { "example": "I use ChatGPT now and then for texts and research. I don't have properly planned AI projects yet, but I would like to automate more.", "hint": "Even if you only use ChatGPT occasionally — that already counts." },
    "zeitersparnis_prioritaet": { "example": "Answering emails, writing proposals, bookkeeping, documentation — all the tasks that keep me from my actual work.", "hint": "Think of the things that annoy you and keep repeating themselves." },
    "geschaeftsmodell_evolution": { "example": "New digital offerings that used to be too much effort. Automatic recommendations for customers. Or better use of data — we surely have information we are not really using yet.", "hint": "What would be possible if technology were not an obstacle?" },
    "vision_3_jahre": { "example": "The routine runs by itself, I have more time for the work I enjoy and that genuinely helps my customers. More efficient processes, less paperwork.", "hint": "How should your day-to-day work change?" },
    "strategische_ziele": { "example": "Automate the 2-3 most annoying routine tasks. Speed up customer communication. And make decisions based on real data instead of gut feeling.", "hint": "What would you change first if you had an invisible helper?" },
    "ki_guardrails": { "example": "Important decisions are always made by me personally. Customer data stays with me and is not passed to third parties. And whatever AI generates, I read it before it goes out.", "hint": "What should a machine never decide on its own in your business?" },
    "pilot_bereich": { "hint": "Think about where tasks keep repeating and cost a lot of time — that is usually the best starting point." },
    "massnahmen_komplexitaet": { "hint": "Low = use ready-made tools that are already there. Medium = set up new tools and adapt workflows. High = have a custom solution built." },
    "investitionsbudget": { "hint": "Start small — 30-100 euros per month for first tools. Plan bigger projects once you know what works." },
    "s5_vision": { "example": "Less routine work, more time for what I do best — my core competence and my customers.", "hint": "What would be the biggest win for you personally?" }
  }
}

};
