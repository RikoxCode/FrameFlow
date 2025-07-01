# 📸 FrameFlow - Dropbox Slideshow & Media Management

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green)](https://nodejs.org/)
[![Vue.js](https://img.shields.io/badge/Vue-3.x-brightgreen)](https://vuejs.org/)
[![Socket.io](https://img.shields.io/badge/Socket.io-Realtime-blue)](https://socket.io/)
[![Dropbox API](https://img.shields.io/badge/Dropbox-API-blue)](https://www.dropbox.com/developers)

---

## ✨ Features

✅ Live slideshow with images from Dropbox  
✅ Media gallery in frontend for browsing  
✅ Responsive & modern design with TailwindCSS  
✅ Automatic token renewal via Dropbox Refresh Token  
✅ WebSocket-based real-time communication  
✅ Separated backend & frontend setup  
✅ Supports local development & production deployment (Docker Images)

---

## 🗂 Project Structure

```
FrameFlow/
├─ apps/
│  ├─ web/               → Vue3 Frontend (Vite-based)
│  └─ server/            → Node.js Express Backend incl. Socket.io
├─ handlers/             → Backend handlers for Dropbox, Auth & Sockets
├─ .env                  → Configuration (don't commit!)
├─ package.json
└─ README.md
```

---

## 🚀 Setup & Installation

### Docker Images

#### 1. Docker-Compose
```docker-compose.yml
services:
  api:
    image: rikoxcode/frameflow-api:latest
    env_file:
      - .env
    networks:
      - traefik-net
    labels:
      - traefik.enable=true
      - traefik.http.routers.rikoxapi.rule=Host(`<your-api-host>`)
      - traefik.http.routers.rikoxapi.entrypoints=websecure,web
      - traefik.http.services.rikoxapi.loadbalancer.server.port=3000
      - traefik.docker.network=traefik-net
    restart: unless-stopped

  web:
    image: rikoxcode/frameflow-app:latest
    networks:
      - traefik-net
    labels:
      - traefik.enable=true
      - traefik.http.routers.rikox.rule=Host(`<your-app-host>`)
      - traefik.http.routers.rikox.entrypoints=websecure,web
      - traefik.http.services.rikox.loadbalancer.server.port=3050
      - traefik.docker.network=traefik-net
    restart: unless-stopped

networks:
  traefik-net:
    external: true
```

#### 2. .env
```.env 
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

### Development
#### 1. 📦 Backend

```bash
cd apps/api
npm install
```

`apps/api/.env` Example:

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

Start server:

```bash
npm run dev
```

---

#### 2. 🌐 Frontend

```bash
cd apps/web
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🖥 Example Backend Endpoints

| Route                          | Description                      |
|---------------------------------|-----------------------------------|
| `GET /api/dropbox/images`      | Retrieve all available images     |
| `POST /api/dropbox/upload`     | Upload image to Dropbox           |
| WebSocket `diashow` Event      | Receive live slideshow image      |
| WebSocket `mediaFiles` Event   | List of all current media files   |

---

## 🔐 Security

Please never store your sensitive tokens like Refresh Token **in the repository**. Use `.env` files or secure secrets management.

---

## 🛠 Technology Stack

- **Vue3**
- **TailwindCSS**
- **Express.js**
- **Socket.io**
- **Dropbox API v2**
- **Node.js 18+**

---

## 👨‍💻 Developer Notes

- The Dropbox Access Token is automatically renewed when expired
- For initial authorization, an Authorization Code must be generated ([see Dropbox OAuth](https://www.dropbox.com/developers/documentation/http/documentation#oauth2-authorize))
- The slideshow automatically updates the media list every 60 seconds

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

## 💡 Further Links

- [Dropbox API Documentation](https://www.dropbox.com/developers/documentation/http/documentation)
- [Socket.io Documentation](https://socket.io/docs/v4/)
- [Vue.js 3 Documentation](https://vuejs.org/)
