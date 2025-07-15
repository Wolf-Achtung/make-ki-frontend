<?php
require_once("config.php"); // hier stehen $dsn, $user, $pass

try {
    // Mit deiner Postgres-Datenbank verbinden
    $pdo = new PDO($dsn, $user, $pass, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
    $pdo->exec("CREATE EXTENSION IF NOT EXISTS pgcrypto;");

    // Email aus dem versteckten Feld ziehen
    $email = $_POST['email'] ?? 'unbekannt';
    unset($_POST['email']);

    // Den Rest als JSON kodieren
    $feedbackJson = json_encode($_POST);

    // In die Tabelle feedback_logs eintragen
    $stmt = $pdo->prepare("INSERT INTO feedback_logs (email, feedback_data) VALUES (:email, :feedback)");
    $stmt->execute(['email' => $email, 'feedback' => $feedbackJson]);

    // Nach Danke-Seite weiterleiten
    header("Location: danke.html");
    exit;
} catch (Exception $e) {
    echo "<h2>Es ist ein Fehler aufgetreten</h2>";
    echo "<p>".$e->getMessage()."</p>";
}
?>
