# HealthConnect Nigeria Backend

This is a separate REST API built with Node.js, Express, MongoDB, Mongoose, bcryptjs, JWT, CORS, Helmet, rate limiting, and Nodemailer SMTP. It is designed to support the existing standalone HealthConnect Nigeria frontend without replacing its visual design.

## Folder structure

`config/` contains the MongoDB connection. `models/` contains Mongoose schemas for users, facilities, doctors, appointments, health articles, and blood donation centers. `middleware/` contains JWT and admin guards. `controllers/` contains authentication business logic. `routes/` contains REST endpoints. `services/` contains SMTP email delivery. `utils/` contains security and reset-token helpers. `scripts/` contains the protected first-admin script and clearly labelled fictional development seed script. `tests/` contains authentication tests.

## Install and configure

Install Node.js 18 or newer and MongoDB 6 or newer. Copy `env.template` to a local file named `.env`—do not commit it—and set a MongoDB connection string, a random `JWT_SECRET` of at least 32 characters, the deployed frontend reset URL, and SMTP credentials. `CLIENT_ORIGIN` must be the exact origin serving the frontend, such as `https://yourname.github.io` or `http://127.0.0.1:5500`.

Install dependencies with `npm install`, then start the API with `npm run dev`. The health check is `GET http://127.0.0.1:5000/api/health`.

## SMTP password reset setup

Use any SMTP provider that supplies a host, port, username, password, and sender address. Set `SMTP_SECURE=true` for implicit TLS, commonly port 465; use `SMTP_SECURE=false` for STARTTLS, commonly port 587. Set `MAIL_FROM` to a verified sender address. Set `FRONTEND_RESET_URL` to the deployed absolute URL ending in `/reset-password.html`, for example `https://yourname.github.io/Nigeria-health-care-/reset-password.html`. The backend stores only a SHA-256 hash of the reset token, sends the raw token only in the email link, expires it after 15 minutes, and clears it after a successful reset.

The forgot-password endpoint always returns the same message whether or not the email exists. This reduces account enumeration. The password itself is never emailed or stored in plain text.

## First admin account

Do not hard-code administrator credentials. Set `ADMIN_SETUP_KEY` in `.env`, then run the one-time command with `PROVISION_ADMIN_KEY` equal to that same value and with `ADMIN_NAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` supplied only for that command. Example on macOS/Linux:

```bash
PROVISION_ADMIN_KEY="your-private-setup-key" ADMIN_NAME="Your Name" ADMIN_EMAIL="you@example.com" ADMIN_PASSWORD="a-long-password-with-a-number" npm run create-admin
```

After the account is created, remove or rotate the setup key. An ordinary user receives `403 Administrator access required` when calling `/api/admin/*`.

## Development data

The seed command is deliberately blocked unless `ALLOW_DEMO_SEED=true` is set. It inserts only clearly labelled fictional development records and must not be presented as verified real-world healthcare data:

```bash
ALLOW_DEMO_SEED=true npm run seed
```

## Frontend connection

Edit `config.js` in the standalone frontend and set `window.HEALTHCONNECT_API_BASE` to the deployed backend origin, such as `https://api.example.com`. The frontend sends JWTs in the `Authorization: Bearer <token>` header. The backend still independently verifies every protected request; frontend redirects are only a user-experience layer.

The complete endpoint list and example requests are in `API.md`.
