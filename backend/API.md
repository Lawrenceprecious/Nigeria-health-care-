# HealthConnect Nigeria API

All URLs below are relative to the backend origin, such as `http://127.0.0.1:5000`. JSON requests require `Content-Type: application/json`. Protected endpoints require `Authorization: Bearer <jwt>`.

## Authentication

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| POST | `/api/auth/register` | No | Create a user and return a JWT |
| POST | `/api/auth/login` | No | Verify credentials and return a JWT |
| GET | `/api/auth/me` | JWT | Return the current user |
| POST | `/api/auth/logout` | JWT | Increment token version and invalidate the current JWT |
| POST | `/api/auth/forgot-password` | No | Send a temporary reset link without revealing account existence |
| POST | `/api/auth/reset-password` | No | Consume a valid reset token and update the password |

Registration body: `{ "name": "Ada Health", "email": "ada@example.com", "phone": "08000000000", "password": "securepass1", "confirmPassword": "securepass1" }`.

Login body: `{ "email": "ada@example.com", "password": "securepass1" }`. Successful responses include `{ "user": { "id": "...", "name": "...", "email": "...", "phone": "", "role": "user" }, "token": "..." }`.

Forgot-password body: `{ "email": "ada@example.com" }`. The response is always `{ "message": "If an account exists for that email, a password reset link will be sent shortly." }` whether or not an account exists.

Reset-password body: `{ "token": "raw-token-from-email-link", "password": "newsecure2", "confirmPassword": "newsecure2" }`. A successful reset returns `{ "message": "Password reset successfully. You can now log in." }`. Reset tokens are random, stored only as SHA-256 hashes, valid for 15 minutes, and cleared after use.

## Public healthcare endpoints

| Method | Endpoint | Query/body |
|---|---|---|
| GET | `/api/facilities` | `search`, `type`, `state`, `lga`, `city`, `page`, `limit`, optional `lat`, `lng`, `radiusKm` |
| GET | `/api/facilities/:id` | Facility id |
| GET | `/api/doctors` | Optional `specialty` |
| GET | `/api/articles` | Optional `category`, `search` |
| GET | `/api/articles/:id` | Article id |
| GET | `/api/donation-centers` | Optional `state`, `lga`, `city`, `bloodType` |
| GET | `/api/emergency` | None |

Facility types are exactly `hospital`, `clinic`, `pharmacy`, `laboratory`, and `blood bank`. Facility search responses contain `{ "data": [...], "pagination": { "page": 1, "limit": 12, "total": 0, "pages": 0 } }`.

## Protected user endpoints

`POST /api/appointments` accepts `{ "doctor": "...", "facility": "...", "requestedFor": "2026-09-01T10:00:00.000Z", "reason": "Routine consultation" }`. `GET /api/appointments/me` returns the signed-in user’s appointment requests.

## Admin endpoints

All `/api/admin/*` routes require a valid JWT whose user role is `admin`. Facilities, doctors, articles, and donation centers support `GET`, `POST`, `PATCH /:id`, and `DELETE /:id`. Appointments support `GET /api/admin/appointments` and `PATCH /api/admin/appointments/:id` with a status of `pending`, `confirmed`, `cancelled`, or `completed`. Users are available through `GET /api/admin/users`.

## Errors

Errors use JSON such as `{ "message": "Authentication required" }` with standard HTTP status codes: `400` validation errors, `401` invalid or expired authentication, `403` insufficient role, `404` missing resource, and `409` duplicate records.
