# EM-Betting - Ein Wettserver für die EM 2024 

Erstellt mit Sveltekit. Die Daten zu den Spielen und Teams werden von der [OpenLigaDB](https://www.openligadb.de/) API bezogen und die Userdaten werden auf [Firebase](https://firebase.google.com) gespeichert. Benutzer können sich registrieren und auf die Spiele der EM 2024 wetten und mit richtigen Wetten in der Rangliste aufsteigen.

## Installation
  Eine `.env` Datei mit den Konfigurationsdaten muss im Root-Verzeichnis erstellt werden. Ein Beispiel dafür ist in der `.env.example` Datei zu finden.  
  Für `SERVER_FIREBASE_CONFIG` muss ein Firebase Admin SDK Service Account Key eingefügt werden. Dieser kann in den Firebase Einstellungen unter Projekteinstellungen -> Service Accounts -> Firebase Admin SDK generiert werden.

  Nachdem die `.env` Datei erstellt wurde, kann das Projekt mit folgenden Befehlen installiert und im Produktionsmodus gestartet werden:

  ```bash
  npm install
  npm run build
  node build
  ```

  Füt die Entwicklung kann das Projekt mit folgenden Befehlen gestartet werden:

  ```bash
  npm install
  npm run dev
  ```

## Mögliche Erweiterungen
Das Projekt ist sehr flexibel und allgemein gebaut, sodass es nicht nur für die EM 2024 verwendet werden kann. Es kann für jede Art von Wettbewerb verwendet werden, bei dem es um Fußballspiele geht.

Dies ist durch die API von OpenLigaDB realisierbar, die die Daten zu vielen verschiedenen Ligen und Wettbewerben bereitstellt. Die Daten können einfach durch die Anpassung von `LEAGE_SHORTCUT` und `SEASON` in der `src/lib/server/OpenLiga.ts`-Datei geändert werden. Die dazu passenden Parameter können auf der [OpenLigaDB](https://www.openligadb.de/) Webseite nach Auswahl eines Wettbewerbs gefunden werden.