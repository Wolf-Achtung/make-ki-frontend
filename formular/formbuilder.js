async function buildAndSubmitForm(fields) {
    const formContainer = document.getElementById("form-container");
    const debug = document.getElementById("debug");

    const form = document.createElement("form");
    form.onsubmit = async (e) => {
        e.preventDefault();
        debug.innerText = "⏳ Sende Daten an Server...";

        const data = {};
        fields.forEach(field => {
            const el = form.querySelector(`[name="${field.name}"]`);
            if (el) data[field.name] = el.value;
        });

        console.log("🚀 Sende Daten:", data);

        try {
            const res = await fetch("https://make-ki-backend-neu-production.up.railway.app/briefing", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });

            const json = await res.json();
            console.log("✅ Serverantwort:", json);

            // Gib das gerenderte HTML direkt aus
            formContainer.innerHTML = json.html;
            debug.innerText = "✅ Analyse erfolgreich geladen.";

        } catch (err) {
            console.error("❌ Fehler:", err);
            debug.innerText = "❌ Fehler: " + err;
        }
    };

    fields.forEach(field => {
        const label = document.createElement("label");
        label.innerText = field.label;

        let input;
        if (field.type === "textarea") {
            input = document.createElement("textarea");
        } else if (field.type === "select") {
            input = document.createElement("select");
            field.options.forEach(opt => {
                const option = document.createElement("option");
                option.value = opt;
                option.text = opt;
                input.add(option);
            });
        } else {
            input = document.createElement("input");
            input.type = field.type;
        }
        input.name = field.name;

        form.appendChild(label);
        form.appendChild(input);
    });

    const submit = document.createElement("button");
    submit.type = "submit";
    submit.innerText = "Analyse starten";
    form.appendChild(submit);

    formContainer.appendChild(form);
}

// Lade fields.json & baue Formular
fetch("fields.json")
    .then(res => res.json())
    .then(fields => buildAndSubmitForm(fields))
    .catch(err => {
        console.error("❌ Fehler beim Laden von fields.json:", err);
        document.getElementById("debug").innerText = "Fehler beim Laden des Formulars.";
    });
