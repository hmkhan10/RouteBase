# RouteBase Production Environment Variables

## Railway (Backend)
| Variable | Description | Example/Source |
|----------|-------------|----------------|
| `DEBUG` | Set to `False` for production | `False` |
| `SECRET_KEY` | Django secret key | Long random string |
| `DATABASE_URL` | PostgreSQL connection string | Provided by Railway |
| `ALLOWED_HOSTS` | Allowed domains | `routebase-backend.up.railway.app,route-base.vercel.app` |
| `CORS_ALLOWED_ORIGINS` | Allowed frontend origins | `https://route-base.vercel.app` |
| `FIELD_ENCRYPTION_KEY` | Key for encrypted fields | Generated via `cryptography` |
| `RESEND_API_KEY` | API key for Resend emails | From Resend dashboard |
| `PAYMOB_API_KEY` | Paymob secret key | From Paymob dashboard |
| `PAYMOB_INTEGRATION_ID` | Paymob integration ID | From Paymob dashboard |
| `PLATFORM_COMMISSION` | Platform fee percentage | `0.03` |

## Vercel (Frontend)
| Variable | Description | Example/Source |
|----------|-------------|----------------|
| `NEXT_PUBLIC_API_URL` | URL of the backend API | `https://routebase-backend.up.railway.app` |
| `NEXT_PUBLIC_PLATFORM_NAME` | Name of the platform | `RouteBase` |
