document.addEventListener("DOMContentLoaded", function () {
    fetch("/fields.json")
        .then(response => response.json())
        .then(fields => buildForm(fields));

    function buildForm(fields) {
        const form = document.getElementById("dynamic-form");
        fields.forEach(field => {
            const div = document.createElement("div");
            div.className = "form-group";

            const label = document.createElement("label");
            label.textContent = field.label;
            div.appendChild(label);

            if (field.type === "text") {
                const input = document.createElement("input");
                input.type = "text";
                input.placeholder = field.placeholder || "";
                input.name = field.key;
                div.appendChild(input);
            } else if (field.type === "select") {
                const select = document.createElement("select");
                select.name = field.key;
                field.options.forEach(opt => {
                    const option = document.createElement("option");
                    option.value = opt;
                    option.textContent = opt;
                    select.appendChild(option);
                });
                div.appendChild(select);
            } else if (field.type === "checkbox") {
                field.options.forEach(opt => {
                    const checkboxLabel = document.createElement("label");
                    checkboxLabel.style.display = "block";
                    const checkbox = document.createElement("input");
                    checkbox.type = "checkbox";
                    checkbox.name = field.key;
                    checkbox.value = opt;
                    checkboxLabel.appendChild(checkbox);
                    checkboxLabel.append(` ${opt}`);
                    div.appendChild(checkboxLabel);
                });
            }
            form.insertBefore(div, form.lastElementChild);
        });

        form.addEventListener("submit", function (e) {
            e.preventDefault();
            showLoadingOverlay();

            const formData = new FormData(form);
            const data = {};

            for (let [key, value] of formData.entries()) {
                if (data[key]) {
                    if (!Array.isArray(data[key])) data[key] = [data[key]];
                    data[key].push(value);
                } else {
                    data[key] = value;
                }
            }

            fetch("/briefing", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(data)
            })
            .then(response => response.blob())
            .then(blob => {
                hideLoadingOverlay();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "KI-Readiness-Report.pdf";
                document.body.appendChild(a);
                a.click();
                a.remove();
            })
            .catch(() => {
                hideLoadingOverlay();
                alert("Beim Erstellen des Berichts ist ein Fehler aufgetreten.");
            });
        });
    }

    function showLoadingOverlay() {
        const overlay = document.createElement("div");
        overlay.id = "loading-overlay";
        overlay.style.position = "fixed";
        overlay.style.top = "0";
        overlay.style.left = "0";
        overlay.style.width = "100%";
        overlay.style.height = "100%";
        overlay.style.background = "rgba(255,255,255,0.9)";
        overlay.style.display = "flex";
        overlay.style.flexDirection = "column";
        overlay.style.alignItems = "center";
        overlay.style.justifyContent = "center";
        overlay.style.zIndex = "9999";

        const spinner = document.createElement("div");
        spinner.style.width = "60px";
        spinner.style.height = "60px";
        spinner.style.border = "6px solid #4a90e2";
        spinner.style.borderTop = "6px solid transparent";
        spinner.style.borderRadius = "50%";
        spinner.style.animation = "spin 1s linear infinite";
        overlay.appendChild(spinner);

        const text = document.createElement("div");
        text.style.marginTop = "20px";
        text.style.fontSize = "1.2em";
        text.style.color = "#333";
        text.textContent = 'Der individuelle KI-Report wird erstellt. Bitte bis zu 10 Minuten  Geduld...';
        overlay.appendChild(text);

        document.body.appendChild(overlay);

        // CSS Animation hinzufügen
        const style = document.createElement("style");
        style.textContent = `
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
    }

    function hideLoadingOverlay() {
        const overlay = document.getElementById("loading-overlay");
        if (overlay) overlay.remove();
    }
});
