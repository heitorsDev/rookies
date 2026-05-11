---
name: python-fastapi
description: FastAPI backend development with Python 3.11+, Pydantic v2, and MongoEngine
license: MIT
compatibility: opencode
---

## What I do
- Build FastAPI async route handlers with Pydantic v2 request/response schemas
- Define MongoEngine ODM documents and embedded documents
- Generate unique sequential codes using atomic MongoDB counters
- Implement layered architecture: routes → service → models
- Write type-annotated Python with Pydantic validation

## Conventions
- Use `async` route handlers throughout; wrap blocking MongoEngine calls with `asyncio.to_thread()`
- All service functions raise typed `HTTPException` with clear `detail` messages
- Route files are thin — delegate logic to `service.py`
- Slugs must match: `^[a-z0-9]+(-[a-z0-9]+)*$`
- Use `datetime.utcnow()` for timestamps; store as UTC
- History logging is automatic via JWT payload — do not accept member name from user input

## Related Documentation

| Document | Description |
|---|---|
| [`AGENTS.md`](../../AGENTS.md) | Main project specification — business rules, data models, architecture overview |
| [`backend/ROUTES.md`](../../backend/ROUTES.md) | Complete backend API route specifications |
| [mongodb-odm skill](../mongodb-odm/SKILL.md) | MongoEngine ODM patterns and conventions |
| [mongodb skill](../../.agents/skills/mongodb/SKILL.md) | General MongoDB best practices |
| [fastapi-templates skill](../../.agents/skills/fastapi-templates/SKILL.md) | FastAPI project templates |

## When to load me
Load this skill when adding or modifying backend API routes, database models, business logic, or validation schemas.
