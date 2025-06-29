
# 📸 FrameFlow - Dropbox Diashow & Medienverwaltung

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green)](https://nodejs.org/)
[![Vue.js](https://img.shields.io/badge/Vue-3.x-brightgreen)](https://vuejs.org/)
[![Socket.io](https://img.shields.io/badge/Socket.io-Realtime-blue)](https://socket.io/)
[![Dropbox API](https://img.shields.io/badge/Dropbox-API-blue)](https://www.dropbox.com/developers)

---

## ✨ Features

✅ Live-Diashow mit Bildern aus Dropbox  
✅ Medien-Galerie im Frontend zum Durchstöbern  
✅ Responsive & modernes Design mit TailwindCSS  
✅ Automatische Token-Erneuerung via Dropbox Refresh-Token  
✅ WebSocket-basierte Echtzeit-Kommunikation  
✅ Getrenntes Backend & Frontend Setup  
✅ Unterstützt lokale Entwicklung & Produktivbetrieb

---

## 🗂 Projektstruktur

```
FrameFlow/
├─ apps/
│  ├─ web/               → Vue3 Frontend (Vite-basiert)
│  └─ server/            → Node.js Express Backend inkl. Socket.io
├─ handlers/             → Backend-Handler für Dropbox, Auth & Sockets
├─ .env                  → Konfiguration (nicht commiten!)
├─ package.json
└─ README.md
```

---

## 🚀 Setup & Installation

### 1. 📦 Backend

```bash
cd apps/api
npm install
```

`apps/api/.env` Beispiel:

```ini
PORT=3040
SOCKET_PORT=3041

JWT_SECRET="<your-jwt-secret>"
JWT_EXPIRES_IN=3600000 # 1 hour

ADMIN_EMAIL="<your-admin-email>"
ADMIN_PASSWORD="<your-admin-password>"

GUEST_EMAIL="<your-guest-email>"
GUEST_PASSWORD="<your-guest-password>"

# Dropbox configuration
DROPBOX_ACCESS_TOKEN=""
DROPBOX_APP_KEY=""
DROPBOX_APP_SECRET=""
DROPBOX_REFRESH_TOKEN=""
DROPBOX_CODE=""

```

Server starten:

```bash
npm run dev
```

---

### 2. 🌐 Frontend

```bash
cd apps/web
npm install
npm run dev
```

Öffne [http://localhost:5173](http://localhost:5173) im Browser.

---

## 🖥 Beispiel-Endpunkte Backend

| Route                          | Beschreibung                     |
|---------------------------------|-----------------------------------|
| `GET /api/dropbox/images`      | Alle verfügbaren Bilder abrufen   |
| `POST /api/dropbox/upload`     | Bild in Dropbox hochladen         |
| WebSocket `diashow` Event      | Live-Diashow-Bild empfangen       |
| WebSocket `mediaFiles` Event   | Liste aller aktuellen Medien      |

---

## 🔐 Sicherheit

Bitte speichere deine sensiblen Tokens wie Refresh-Token **niemals im Repo**. Verwende `.env` Dateien oder sichere Secrets-Verwaltung.

---

## 🛠 Technologie-Stack

- **Vue3**
- **TailwindCSS**
- **Express.js**
- **Socket.io**
- **Dropbox API v2**
- **Node.js 18+**

---

## 👨‍💻 Entwicklerhinweise

- Der Dropbox Access-Token wird automatisch erneuert, wenn abgelaufen
- Für die erstmalige Autorisierung muss ein Authorization-Code generiert werden ([siehe Dropbox OAuth](https://www.dropbox.com/developers/documentation/http/documentation#oauth2-authorize))
- Die Diashow aktualisiert alle 60 Sekunden die Medienliste automatisch

---

## 📄 Lizenz

Dieses Projekt steht unter der [MIT Lizenz](LICENSE).

---

## 💡 Weiterführende Links

- [Dropbox API Dokumentation](https://www.dropbox.com/developers/documentation/http/documentation)
- [Socket.io Dokumentation](https://socket.io/docs/v4/)
- [Vue.js 3 Dokumentation](https://vuejs.org/)  
