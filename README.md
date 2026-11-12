# Financial Data Science Dashboard

A full-stack market analyzer for stocks, FX and crypto, with probabilistic
FX forecasts that are evaluated honestly against a random-walk baseline.

## Status

This project is being rebuilt from scratch and is at **Phase 0 (setup)**.
There is no application code yet. The repository currently contains only
the project skeleton and configuration files.

## Planned stack

Nothing in this list is built yet.

- **Client:** Angular, TypeScript, RxJS, lightweight-charts, D3
- **Server:** Node.js, Express, MongoDB with Mongoose, WebSockets
- **ML service:** Python, FastAPI, pandas, statsmodels, scikit-learn
- **Tooling:** Docker Compose, GitHub Actions

## Repository layout

| Path | Purpose |
|---|---|
| `client/` | Angular frontend (planned, empty) |
| `server/` | Express REST API and WebSocket server (planned, empty) |
| `ml/` | FastAPI service for models and backtests (planned, empty) |
| `.env.example` | Names of the environment variables the server will need |

## Getting started

```bash
git clone https://github.com/MaosterM/financial-datascience-dashboard.git
cd financial-datascience-dashboard
cp .env.example .env
```

`.env` holds real values and is ignored by git. Never commit it.
There is nothing to run yet. Run instructions will be added in Phase 1.

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
