async function buildAndSubmitForm(fields) {
    const formContainer = document.getElementById("form-container");
    const debug = document.getElementById("debug");
    const ergebnis = document.getElementById("ergebnis");

    const form = document.createElement("form");
    form.onsubmit = async (e) => {
        e.preventDefault();
        debug.innerText = "⏳ Sende Daten an Server...";
        ergebnis.innerHTML = "";

        const data = {};
        fields.forEach(field => {
            const el = form.querySelector(`[name="${field.key}"]`);
            if (el) data[field.key] = el.value;
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

            if (json.html) {
                ergebnis.innerHTML = json.html;
                debug.innerText = "✅ Analyse erfolgreich geladen.";
            } else {
                debug.innerText = "⚠️ Server hat kein HTML zurückgegeben.";
            }
        } catch (err) {
            console.error("❌ Fehler:", err);
            debug.innerText = "❌ Fehler: " + err;
        }
    };

    fields.forEach(field => {
        const wrapper = document.createElement("div");
        wrapper.style.marginBottom = "12px";

        const label = document.createElement("label");
        label.innerText = field.label;
        label.style.display = "block";
        label.style.marginBottom = "4px";

        let input;
        if (field.type === "textarea") {
            input = document.createElement("textarea");
            input.placeholder = field.placeholder || "";
        } else if (field.type === "select" && Array.isArray(field.options)) {
            input = document.createElement("select");
            field.options.forEach(opt => {
                const option = document.createElement("option");
                option.value = opt;
                option.text = opt;
                input.add(option);
            });
        } else {
            input = document.createElement("input");
            input.type = field.type || "text";
            input.placeholder = field.placeholder || "";
        }
        input.name = field.key;
        input.style.width = "100%";
        input.style.padding = "6px";
        input.style.boxSizing = "border-box";

        wrapper.appendChild(label);
        wrapper.appendChild(input);
        form.appendChild(wrapper);
    });

    const submit = document.createElement("button");
    submit.type = "submit";
    submit.innerText = "Analyse starten";
    submit.style.marginTop = "16px";
    submit.style.padding = "8px 16px";
    form.appendChild(submit);

    formContainer.appendChild(form);
}

fetch("fields.json")
    .then(res => res.json())
    .then(json => buildAndSubmitForm(json.fields || json))
    .catch(err => {
        console.error("❌ Fehler beim Laden von fields.json:", err);
        document.getElementById("debug").innerText = "Fehler beim Laden des Formulars.";
    });
