---
name: mongodb-odm
description: MongoDB data modeling with MongoEngine ODM — documents, embedded documents, references, and atomic operations
license: MIT
compatibility: opencode
---

## What I do
- Define MongoEngine Document and EmbeddedDocument classes
- Set up MongoDB connection via mongoengine.connect() on app startup
- Implement atomic sequence counters with modify(upsert=True, inc__value=1)
- Model 1:N relationships via EmbeddedDocumentListField and ReferenceField
- Write queries with filtering, sorting, and pagination

## Conventions
- Connect once in `database.py` via a lifespan context manager in `main.py`
- Use `modify()` with `upsert=True` for atomic counter increments
- Store all timestamps as UTC via `datetime.utcnow()`
- Embedded documents for history, attachments, loan_info

## When to load me
Load this skill when designing or modifying database schemas, writing queries, or implementing atomic operations.
