## Notification Service (SMTP)

This server sends email notifications through SMTP for the following events:

- HR account approved/disapproved by admin
- Candidate applied successfully for a job
- Candidate application status updated (applied/shortlisted/rejected)
- Job closed manually or automatically when vacancies are filled

### Required SMTP environment variables

Set these values in `server/.env`:

- `SMTP_HOST`
- `SMTP_PORT` (for example `587`)
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM` (optional, defaults to `SMTP_USER`)
- `SMTP_SECURE` (`true` for SSL/465, otherwise `false`)

If SMTP variables are not configured, API behavior is unchanged and email sending is skipped safely.

## CORS configuration for deployment

Set this in `server/.env` (or your hosting provider environment settings):

- `ALLOWED_ORIGINS` as a comma-separated list of frontend URLs

Example:

- `ALLOWED_ORIGINS=https://your-frontend.vercel.app,https://your-other-frontend.vercel.app`
