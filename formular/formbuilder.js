document.addEventListener("DOMContentLoaded", async () => {
    console.log("🚀 Starte Formular-Builder...");

    const container = document.getElementById("form-container");
    const debug = document.getElementById("debug");

    if (!container) {
        console.error("❌ Kein Element mit ID 'form-container' gefunden.");
        return;
    }

    try {
        const response = await fetch("fields.json");
        const data = await response.json();
        console.log("✅ fields.json geladen:", data);

        data.fields.forEach(field => {
            const fieldWrapper = document.createElement("div");
            fieldWrapper.className = "form-field";

            const label = document.createElement("label");
            label.innerText = field.label;
            label.htmlFor = field.key;
            fieldWrapper.appendChild(label);

            if (field.type === "dropdown") {
                const select = document.createElement("select");
                select.name = field.key;
                select.id = field.key;

                const defaultOption = document.createElement("option");
                defaultOption.value = "";
                defaultOption.innerText = "Bitte auswählen";
                select.appendChild(defaultOption);

                field.options.forEach(opt => {
                    const option = document.createElement("option");
                    option.value = opt;
                    option.innerText = opt;
                    select.appendChild(option);
                });

                fieldWrapper.appendChild(select);

            } else if (field.type === "text") {
                const input = document.createElement("input");
                input.type = "text";
                input.name = field.key;
                input.id = field.key;
                if (field.placeholder) input.placeholder = field.placeholder;
                fieldWrapper.appendChild(input);
            }

            container.appendChild(fieldWrapper);
            console.log(`📝 Feld hinzugefügt: ${field.label} (${field.key})`);
        });

        // Submit-Button am Ende
        const submitBtn = document.createElement("button");
        submitBtn.type = "button";
        submitBtn.innerText = "Analyse starten";
        submitBtn.className = "submit-button";
        submitBtn.addEventListener("click", async () => {
            console.log("🚀 Sende Daten an Server...");

            const payload = {};
            data.fields.forEach(field => {
                const el = document.getElementById(field.key);
                payload[field.key] = el ? el.value : null;
            });

            console.log("📦 JSON-Request:", payload);
            debug.innerText = "📤 JSON-Request:\n" + JSON.stringify(payload, null, 2);

            try {
                const res = await fetch("https://make-ki-backend-neu-production.up.railway.app/briefing", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });
                const result = await res.json();
                console.log("✅ Server-Antwort:", result);

                debug.innerText += "\n\n✅ Server Response:\n" + JSON.stringify(result, null, 2);

                if (result.pdf_url) {
                    window.location.href = `thankyou.html?file=${encodeURIComponent(result.pdf_url)}`;
                } else {
                    alert("Es gab ein Problem bei der Erstellung des Reports.");
                }
            } catch (err) {
                console.error("❌ Fehler beim Senden:", err);
                debug.innerText += "\n\n❌ Fehler beim Senden: " + err;
                alert("Serverfehler - bitte später erneut versuchen.");
            }
        });

        container.appendChild(submitBtn);
        console.log("🎉 Formular erfolgreich aufgebaut und bereit.");

    } catch (err) {
        console.error("❌ Fehler beim Laden oder Parsen der fields.json:", err);
        if (debug) debug.innerText = "❌ Fehler beim Laden des Formulars.";
    }
});
