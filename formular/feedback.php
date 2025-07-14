<?php
// Empfänger-Adresse hier eintragen:
$to = "kontakt@ki-sicherheit.jetzt"; // <-- HIER DEINE EIGENE MAIL ADRESSE EINTRAGEN

// Formulareingaben abholen
$hilfe = $_POST['hilfe'] ?? '';
$verstaendlich = $_POST['verstaendlich'] ?? '';
$vertrauen = $_POST['vertrauen'] ?? '';
$design = $_POST['design'] ?? '';
$textstellen = $_POST['textstellen'] ?? '';
$dauer = $_POST['dauer'] ?? '';
$unsicher = $_POST['unsicher'] ?? '';
$features = $_POST['features'] ?? '';
$sonstiges = $_POST['sonstiges'] ?? '';
$kontakt = $_POST['kontakt'] ?? '';

// E-Mail zusammenbauen
$subject = "Neues Feedback zum KI-Readiness-Check";
$message = "Feedback zum KI-Readiness-Check:\n\n"
  . "Wie hilfreich: $hilfe\n"
  . "Verständlichkeit: $verstaendlich\n"
  . "Vertrauen: $vertrauen\n"
  . "Design: $design\n"
  . "Zu lange Texte: $textstellen\n"
  . "Dauer: $dauer\n"
  . "Unsicherheiten: $unsicher\n"
  . "Feature-Wünsche: $features\n"
  . "Sonstiges: $sonstiges\n"
  . "Kontakt: $kontakt\n";

$headers = "From: noreply@" . $_SERVER['SERVER_NAME'] . "\r\n";

// Mail senden
if(mail($to, $subject, $message, $headers)){
    header("Location: danke.html");
    exit;
} else {
    echo "<h2 style='font-family:sans-serif;color:#c22;'>Es gab ein Problem beim Absenden. Bitte später erneut versuchen.</h2>";
}
?>
