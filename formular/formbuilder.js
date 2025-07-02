document.addEventListener("DOMContentLoaded", async () => {
    const form = document.getElementById("readinessForm");
    const debug = document.getElementById("debug");

    // Lade das JSON-Schema
    const res = await fetch("fields.json");
    const schema = await res.json();

    schema.fields.forEach(field => {
        // Label
        const label = document.createElement("label");
        label.textContent = field.label;
        form.appendChild(label);

        let input;

        if (field.type === "dropdown") {
            input = document.createElement("select");
            input.name = field.key;
            field.options.forEach(opt => {
                const option = document.createElement("option");
                option.value = opt;
                option.textContent = opt;
                input.appendChild(option);
            });

            // Falls "Sonstige", danach Freitext
            if (field.options.includes("Sonstige")) {
                const otherInput = document.createElement("input");
                otherInput.type = "text";
                otherInput.placeholder = "Bitte spezifizieren";
                otherInput.style.display = "none";
                form.appendChild(input);
                form.appendChild(otherInput);

                input.addEventListener("change", () => {
                    otherInput.style.display = (input.value === "Sonstige") ? "block" : "none";
                });
                return; // springt zurück zum nächsten Feld
            }
        } else {
            input = document.createElement("input");
            input.type = "text";
            input.name = field.key;
            if (field.placeholder) input.placeholder = field.placeholder;
        }

        form.appendChild(input);
    });

    // Submit-Handler
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const data = {};
        new FormData(form).forEach((value, key) => {
            data[key] = value;
        });

        debug.textContent = "📤 Sende an Server...\n" + JSON.stringify(data, null, 2);

        try {
            const res = await fetch("https://make-ki-backend-neu-production.up.railway.app/briefing", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(data)
            });
            const json = await res.json();
            debug.textContent += "\n\n✅ Server Antwort:\n" + JSON.stringify(json, null, 2);

            if (json.pdf_url) {
                const filename = json.pdf_url.split("/").pop();
                window.location.href = "/formular/thankyou.html?file=" + encodeURIComponent(filename);
            }
        } catch (err) {
            debug.textContent += "\n❌ Fehler: " + err;
        }
    });
});
