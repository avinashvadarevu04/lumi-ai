# Lumi AI Backend Service

Express.js REST API providing backend services for the Lumi AI enterprise landing page and application.

## Endpoints

- `GET /api/health` - Health check and system uptime.
- `POST /api/contact` - Submits a consultation request from the client contact modal.
- `GET /api/contact` - Lists recently submitted consultation leads.

## Development

```bash
# Install dependencies
npm install

# Start in development mode with auto-reload (Node.js --watch)
npm run dev

# Start in production mode
npm start
```

## Environment Variables

Copy `.env.example` to `.env` to configure:
- `PORT`: Port for the API server (default: `5001`, avoiding macOS AirPlay collision on 5000)
- `FRONTEND_URL`: Client URL for CORS policy (default: `http://localhost:5173`)
