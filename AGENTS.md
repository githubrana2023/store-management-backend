# Repository Agent Guide

This repository is a TypeScript backend service built with Hono, Drizzle, and PostgreSQL.

## Project conventions
- Keep the codebase aligned with NodeNext ESM and strict TypeScript settings.
- Use the existing modular structure under src/modules, src/routes, and src/drizzle/schema.
- Prefer small, incremental changes over large rewrites.
- Preserve existing API and schema naming conventions unless a change explicitly requires otherwise.

## Backend implementation guidance
- Add or update route handlers in the relevant module under src/modules.
- Wire new routes through the appropriate router in src/routes.
- Keep database schema changes in src/drizzle/schema and export them from src/drizzle/schema/index.ts.
- Avoid introducing unnecessary dependencies or abstractions.

## Verification expectations
- Before finishing a change, run the project build with npm run build.
- If a change affects runtime behavior, describe how to validate it.
- Keep environment variables and secrets out of source code.

## Preferred working style
- Inspect the relevant files before editing.
- Explain the intent of a change briefly.
- Call out assumptions or missing context when requirements are unclear.
