# API + Swagger

## Swagger UI
- UI: `/api/docs`
- OpenAPI JSON: `/api/docs/openapi.json`

## Public endpoints
- `GET /api/health`
- `GET /api/products`
- `GET /api/products/{slug}`
- `POST /api/contact`

## Auth endpoints
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/logout`

## Admin endpoints (requires admin)
- `GET /api/admin/verify`
- `GET/POST /api/admin/products`
- `PATCH/DELETE /api/admin/products/{id}`
- `GET /api/admin/users`
- `PATCH /api/admin/users/{id}` (set role)
- `GET /api/admin/contacts`
- `DELETE /api/admin/contacts/{id}`


