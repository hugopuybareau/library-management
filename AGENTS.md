# Repository Guidelines

## Project Structure & Module Organization
- `backend/`: Flask API (`app.py`), utilities (`tools.py`), DB check script (`test_connection.py`), Python deps (`requirements.txt`).
- `sql/`: Database schema and data (`create_database.sql`, `seed_database.sql`, `queries.sql`).
- `Makefile`: Convenience targets; run `make help` to list them.
- `.env`: Local configuration for Flask and PostgreSQL.

## Build, Test, and Development Commands
- Environment: `python3 -m venv .venv && source .venv/bin/activate && pip install -r backend/requirements.txt`.
- Run API: `python3 backend/app.py` (ensure PostgreSQL and `.env` are configured).
- DB init (direct): `psql -U $DB_USER -h $DB_HOST -d $DB_NAME -f sql/create_database.sql` then `psql ... -f sql/seed_database.sql`.
- Connection test: `python3 backend/test_connection.py`.
- Make targets: `make help`, `make info`. Note: some targets may assume backend-relative paths; prefer the explicit commands above if in doubt.

## Coding Style & Naming Conventions
- Python: PEP 8, 4‑space indentation, `snake_case` for modules/functions, `PascalCase` for classes.
- Formatting/Linting: `black backend` and `flake8 backend` (installed via `requirements.txt`).
- Logging: write to `library.log` (level from `.env`). Keep logs non‑sensitive.
- SQL: use `snake_case` identifiers; keep schema objects under `library` schema as in `sql/`.

## Testing Guidelines
- Primary check: `python3 backend/test_connection.py` validates schema, views, and key functions.
- Pytest (optional): if adding tests, place in `tests/` with files named `test_*.py`; run `pytest -q`.
- Prefer fast, unit‑level tests for helpers; mark DB‑dependent tests as integration and rely on `.env`/`TEST_DB_NAME`.
- Aim for ~80% coverage on new/changed code.

## Commit & Pull Request Guidelines
- Commits: use Conventional Commits (e.g., `feat:`, `fix:`, `chore:`, `docs:`) in present tense; keep scope focused.
- PRs: include concise description, linked issues, local run steps, and relevant screenshots or `curl` examples of API responses.
- Database changes: include the corresponding `sql/` diffs and backfill/rollback notes.

## Security & Configuration Tips
- Never commit secrets; keep credentials in `.env` (use placeholders in examples).
- Validate CORS (`CORS_ORIGINS`), `SECRET_KEY`, and JWT settings before exposing endpoints.
- Backups: use `BACKUP_*` settings; store dumps outside the repo when possible.

