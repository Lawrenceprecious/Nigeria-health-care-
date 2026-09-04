# HealthConnect Nigeria — Standalone Frontend

This folder is the preserved HealthConnect Nigeria website as normal editable HTML, CSS, and JavaScript. It does not require React, TypeScript, Tailwind, or a frontend build step.

## Files

`index.html` is the protected healthcare homepage. `facilities.html`, `emergency.html`, `appointments.html`, `education.html`, `blood-donation.html`, and `assistant.html` are the protected feature pages. `login.html`, `register.html`, `forgot-password.html`, and `reset-password.html` are the authentication screens. `styles.css` contains the Nigerian green/white visual system. `script.js` contains the existing website interactions. `auth.js` contains backend login, registration, logout, page guards, forgot-password, and reset-password interactions. `config.js` contains the backend origin. `admin/index.html` and `admin/admin.js` contain the protected admin dashboard.

## Run locally

Install the VS Code Live Server extension, open this folder, and choose **Open with Live Server** on `login.html`. The default frontend origin is `http://127.0.0.1:5500`.

Before running, open `config.js` and set `window.HEALTHCONNECT_API_BASE` to the backend origin. Locally it is `http://127.0.0.1:5000`; after deployment it should be the public HTTPS backend URL.

## Authentication flow

Visitors begin at `login.html`. Successful login or registration stores the returned JWT in browser storage and redirects to `index.html`. Protected pages call `GET /api/auth/me`; missing or expired sessions redirect to `login.html`. Logout calls the backend and clears the local session. Frontend guards improve the user experience only—the backend independently verifies JWTs.

The login screen links to `forgot-password.html`. The forgot form calls `POST /api/auth/forgot-password`. The reset email must link to this deployed page: `reset-password.html?token=...`. The reset form calls `POST /api/auth/reset-password` and redirects to login after success.

## Connect to the separate backend

Follow the backend `README.md` and `API.md` in the sibling backend folder. Configure CORS on the backend with the exact frontend origin. Do not place MongoDB credentials, SMTP credentials, JWT secrets, or any other secrets in this frontend folder.

## Deployment

Deploy this folder to GitHub Pages, Netlify, or another static host. Set the backend `FRONTEND_RESET_URL` to the exact deployed reset-page URL, and update `config.js` to the deployed backend origin. Use HTTPS for both frontend and backend in production.
