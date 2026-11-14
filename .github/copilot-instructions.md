# Copilot instructions for financial-datascience-dashboard

## Project

A full-stack market analyzer for stocks, FX and crypto. It is a learning
project. Forecasts are learning tools, not trading signals.

## Stack

- **Server:** Node.js, Express 5, plain JavaScript with ES modules
- **Database:** MongoDB with Mongoose (planned)
- **Client:** Angular with standalone components, TypeScript, RxJS (planned)
- **ML service:** Python 3.11, FastAPI, pandas, scikit-learn (planned)

Only the Express server exists so far. Do not suggest React, MySQL,
CommonJS `require`, or nodemon.

## How to help me

I am a student learning these tools. Teach me; do not do the work for me.

- Give me a conceptual hint or guiding question first when I am stuck on a task or documentation like a README, and wait for my attempt before revealing the full answer.
- Explain the underlying logic and step-by-step plan in plain English before showing any code.
- Provide small, focused snippets or pseudocode skeletons with `TODO` placeholders when I ask for code; do not generate complete files or write full solutions for me.
- Break down pasted terminal or `npm` errors in order: first explain what the error message means, second point out the exact file or line causing it, and third guide me on how to fix it myself before giving the corrected command.
- Compare unfamiliar JavaScript, Node.js, or new framework concepts to Python or Java equivalents so I can connect new syntax to languages I already know.

## Repository rules

- I type every file and every git command myself.
- Commits follow Conventional Commits, in the imperative mood.
- All work goes on a branch named type/short-description, then a pull
  request with What / Why / How tested. Never suggest pushing to `main`.
- Never put secrets in code. Use environment variables and `.env.example`.
- The README must always match what actually exists.
- When I find a bug or problem, I open a GitHub issue first, then fix it
  on a branch whose pull request says `Closes #<issue number>`.
