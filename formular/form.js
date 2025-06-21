
document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('ki-form');
  form.addEventListener('submit', async function (event) {
    event.preventDefault();

    const formData = new FormData(form);
    const jsonData = {};
    formData.forEach((value, key) => {
      jsonData[key] = value;
    });

    try {
      const response = await fetch('https://make-ki-backend-production.up.railway.app/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jsonData),
      });

      const result = await response.json();

      if (response.ok && result && result.preview) {
        sessionStorage.setItem("previewText", result.preview);
        window.location.href = 'vorschau.html';
      } else {
        alert('Fehler beim Generieren der Auswertung.');
      }
    } catch (error) {
      console.error('Fehler beim Senden des Formulars:', error);
      alert('Es gab ein Problem beim Generieren der Auswertung.');
    }
  });
});
