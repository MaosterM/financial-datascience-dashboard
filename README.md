# Financial Data Science Dashboard

A full-stack market analyzer for stocks, FX and crypto, with probabilistic
FX forecasts that are evaluated honestly against a random-walk baseline.

## Status

This project is being rebuilt from scratch and is at **Phase 1 (server
skeleton)**. The Express server runs and exposes one route, `GET /health`.
There is no database, client or ML service yet.

## Planned stack

So far only the Node.js and Express part of the server is built; everything else is planned.

- **Client:** Angular, TypeScript, RxJS, lightweight-charts, D3
- **Server:** Node.js, Express, MongoDB with Mongoose, WebSockets
- **ML service:** Python, FastAPI, pandas, statsmodels, scikit-learn
- **Tooling:** Docker Compose, GitHub Actions

## Repository layout

| Path | Purpose |
|---|---|
| `client/` | Angular frontend (planned, empty) |
| `server/` | Express server with a `GET /health` route |
| `ml/` | FastAPI service for models and backtests (planned, empty) |
| `.env.example` | Names of the environment variables the server will need |

## Getting started

```bash
git clone https://github.com/MaosterM/financial-datascience-dashboard.git
cd financial-datascience-dashboard
```

Install the server's dependencies and start it in watch mode:

```bash
cd server
npm install
npm run dev
```

The server listens on port 3000. Check it from a second terminal:

```bash
curl http://localhost:3000/health
```

To use another port, set `PORT` for that one command (Bash syntax):

```bash
PORT=4000 npm run dev
```

The server does not read `.env` yet. `.env.example` lists the variables it
will need once the database is added. Never commit a real `.env`.

## Disclaimer

Forecasts in this project are learning tools. They are not financial
advice and not trading signals. No real money is involved.

## Legacy prototype

The original Next.js prototype used only mock data. It is archived at the
tag `legacy-nextjs`:

```bash
git checkout legacy-nextjs
```

## License

MIT. See [LICENSE](LICENSE).
