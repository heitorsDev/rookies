# Rookies Backend — Routes Specification

> Base URL: `/api/v1`

---

## Authentication

All endpoints except `/auth/login`, `/auth/activate`, `/auth/seed`, and `/health` require a valid JWT bearer token in the `Authorization` header:

```
Authorization: Bearer <jwt>
```

### Auth Routes — `prefix: /auth`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/auth/seed` | Seed key (query) | Bootstrap the first admin account |
| `POST` | `/auth/members` | Admin | Create a new member account |
| `POST` | `/auth/tokens` | Admin | Generate a new activation token for a member |
| `POST` | `/auth/activate` | None | Activate account using one-time token and set password |
| `POST` | `/auth/login` | None | Log in with username + password |
| `GET` | `/auth/members` | Admin | List all member accounts |

#### `POST /auth/seed`

Bootstrap the first admin account. Requires a `seed_key` query parameter matching the `SEED_KEY` env variable. Only works when no members exist in the database.

**Query Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `seed_key` | string | The seed key configured in the server env |

**Request Body:**
```json
{
  "name": "Admin User",
  "username": "admin",
  "role": "admin"
}
```

**Response `201`:** `TokenResponse`
```json
{
  "token": "<one-time-activation-token>",
  "username": "admin"
}
```

---

#### `POST /auth/members`

Create a new member account. Returns a one-time activation token that must be shown to the member (only visible in this response).

**Auth:** Admin

**Request Body:**
```json
{
  "name": "João Silva",
  "username": "joaosilva",
  "role": "member"
}
```

**Response `201`:** `TokenResponse`
```json
{
  "token": "<one-time-activation-token>",
  "username": "joaosilva"
}
```

**Errors:** `409` if username already exists, `400` if role is invalid.

---

#### `POST /auth/tokens`

Generate a new activation token for an existing member. Used when a member's token is lost or expired.

**Auth:** Admin

**Query Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `username` | string | Username of the member |

**Response `200`:** `TokenResponse`
```json
{
  "token": "<new-one-time-activation-token>",
  "username": "joaosilva"
}
```

---

#### `POST /auth/activate`

Activate an account using the one-time token and set a password.

**Auth:** None

**Request Body:**
```json
{
  "username": "joaosilva",
  "token": "<one-time-token-from-admin>",
  "password": "my-secure-password"
}
```

**Response `200`:**
```json
{
  "detail": "Account activated. You can now log in with your password."
}
```

**Errors:** `401` if invalid username/token or deactivated account, `409` if already activated.

---

#### `POST /auth/login`

Log in with username and password. Returns a JWT and member details.

**Auth:** None

**Request Body:**
```json
{
  "username": "joaosilva",
  "password": "my-secure-password"
}
```

**Response `200`:**
```json
{
  "access_token": "<jwt>",
  "token_type": "bearer",
  "member": {
    "name": "João Silva",
    "username": "joaosilva",
    "role": "member",
    "is_active": true,
    "is_activated": true,
    "created_at": "2025-03-10T14:30:00Z",
    "created_by": "admin_user"
  }
}
```

**Errors:** `401` if invalid credentials, deactivated, or not yet activated.

---

#### `GET /auth/members`

List all registered member accounts.

**Auth:** Admin

**Response `200`:**
```json
[
  {
    "name": "João Silva",
    "username": "joaosilva",
    "role": "member",
    "is_active": true,
    "is_activated": true,
    "created_at": "2025-03-10T14:30:00Z",
    "created_by": "admin_user"
  }
]
```

---

### Component Types — `prefix: /component-types`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/component-types` | Any | List all (non-archived) component types |
| `POST` | `/component-types` | Any | Create a new component type |
| `GET` | `/component-types/{slug}` | Any | Get a single type with its full field schema |
| `PUT` | `/component-types/{slug}` | Any | Update name, description, or fields |
| `DELETE` | `/component-types/{slug}` | Admin | Archive a component type (soft delete) |

#### `GET /component-types`

List component types.

**Auth:** Any authenticated member

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `include_archived` | bool | `false` | Include archived component types |

**Response `200`:**
```json
[
  {
    "id": "67abc123...",
    "name": "Falcon 500 Motor",
    "slug": "falcon500",
    "description": "Brushless motor by Cross The Road Electronics.",
    "fields": [
      {
        "field_id": "device_id",
        "label": "CAN Device ID",
        "field_type": "number",
        "required": true,
        "default": null,
        "options": null,
        "min_value": 0,
        "max_value": 62,
        "unit": null,
        "placeholder": null,
        "help_text": null,
        "auto": false,
        "auto_hint": null
      }
    ],
    "is_archived": false,
    "created_at": "2025-03-10T14:30:00Z",
    "updated_at": "2025-03-10T14:30:00Z"
  }
]
```

---

#### `POST /component-types`

Create a new component type.

**Auth:** Any authenticated member

**Request Body:**
```json
{
  "name": "Falcon 500 Motor",
  "slug": "falcon500",
  "description": "Brushless motor by Cross The Road Electronics.",
  "fields": [
    {
      "field_id": "device_id",
      "label": "CAN Device ID",
      "field_type": "number",
      "required": true,
      "min_value": 0,
      "max_value": 62
    },
    {
      "field_id": "firmware_version",
      "label": "Firmware Version",
      "field_type": "text",
      "required": true,
      "auto": true,
      "auto_hint": "Paste the firmware version from Phoenix Tuner X."
    }
  ]
}
```

**Validation Rules:**
- `slug`: lowercase alphanumeric with hyphens, regex `^[a-z0-9]+(-[a-z0-9]+)*$`
- `field_id` values must be unique within a type
- `field_type` must be one of: `text`, `number`, `boolean`, `select`, `multiselect`, `range`, `textarea`, `file`, `auto`, `date`
- `options` required (non-empty) for `select` and `multiselect` types
- `min_value`/`max_value` applicable for `number` and `range` types

**Response `201`:** Returns the created `ComponentTypeOut` object.

**Errors:** `409` if slug or name already exists.

---

#### `GET /component-types/{slug}`

Get a single component type by slug.

**Auth:** Any authenticated member

**Response `200`:** Returns `ComponentTypeOut`.

**Errors:** `404` if slug not found.

---

#### `PUT /component-types/{slug}`

Update a component type. All fields are optional — only provided fields are updated.

**Auth:** Any authenticated member

**Request Body:**
```json
{
  "name": "Falcon 500 Motor v2",
  "fields": [
    { "field_id": "device_id", "label": "CAN ID", "field_type": "number", "required": true }
  ]
}
```

**Response `200`:** Returns the updated `ComponentTypeOut`.

**Errors:** `404` if slug not found, `409` if name conflicts.

---

#### `DELETE /component-types/{slug}`

Archive a component type (soft delete). Sets `is_archived = true`.

**Auth:** Admin

**Response `200`:** Returns the archived `ComponentTypeOut`.

**Errors:** `409` if components reference this type.

---

### Components — `prefix: /components`

**Status:** Router defined in `features/components/routes.py`. Service layer and routes pending implementation.

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/components` | Any | Register a new component (returns code) |
| `GET` | `/components/{code}` | Any | Get full component record |
| `PATCH` | `/components/{code}` | Any | Update status, diagnostic data, notes, or attachments |
| `GET` | `/components/{code}/history` | Any | Get the history log for a component |

#### `POST /components`

Register a new component. Generates a unique component code server-side.

**Auth:** Any authenticated member

**Validation Rules:**
- `component_type_slug` must reference an existing, non-archived component type
- `diagnostic_data` keys validated against the type's field definitions
- Unknown keys are rejected (`422`)
- Missing required keys are rejected (`422`)
- `status` defaults to `available`

**Code Generation Format:** `{TYPE_SLUG}-{YEAR}-{SEQUENCE}`
- `TYPE_SLUG`: slug with hyphens removed, trimmed to 10 chars
- `YEAR`: current 4-digit year
- `SEQUENCE`: zero-padded 3-digit integer, auto-incremented per type/year

**Request Body:**
```json
{
  "component_type_slug": "falcon500",
  "diagnostic_data": {
    "device_id": 5,
    "firmware_version": "24.1.0"
  },
  "notes": "Left drivetrain motor.",
  "status": "available"
}
```

**Response `201`:**
```json
{
  "code": "falcon500-2025-005",
  "component_type": "Falcon 500 Motor",
  "component_type_slug": "falcon500",
  "status": "available",
  "diagnostic_data": { "device_id": 5, "firmware_version": "24.1.0" },
  "notes": "Left drivetrain motor.",
  "loan_info": null,
  "attachments": [],
  "history": [],
  "created_at": "2025-03-10T14:32:00Z",
  "updated_at": "2025-03-10T14:32:00Z"
}
```

---

#### `GET /components/{code}`

Get a full component record by its unique code.

**Auth:** Any authenticated member

**Response `200`:** Returns `ComponentOut` (includes all diagnostic data, attachments, history, loan info).

**Errors:** `404` if code not found.

---

#### `PATCH /components/{code}`

Update a component. All fields are optional. Every change is automatically logged to the `history` array with the acting member's username and timestamp.

**Auth:** Any authenticated member

**Request Body:**
```json
{
  "status": "loaned",
  "loan_info": {
    "borrower_name": "Team 4414",
    "expected_return": "2025-04-01T00:00:00Z",
    "notes": "Borrowed for offseason testing."
  },
  "notes": "Updated notes.",
  "diagnostic_data": {
    "peak_current": 40.1
  }
}
```

**Validation Rules:**
- When `status` is set to `loaned`, `loan_info` is required
- When `status` changes away from `loaned`, `loan_info` is cleared
- Only provided keys in `diagnostic_data` are merged/updated
- Setting status to `decommissioned` should trigger a confirmation (handled on frontend)

**Response `200`:** Returns the updated `ComponentOut`.

**Errors:** `404` if code not found, `422` on validation failure.

---

#### `GET /components/{code}/history`

Get the full history log for a component.

**Auth:** Any authenticated member

**Response `200`:**
```json
[
  {
    "timestamp": "2025-03-10T14:35:00Z",
    "changed_by": "joaosilva",
    "field": "status",
    "old_value": "available",
    "new_value": "loaned"
  },
  {
    "timestamp": "2025-03-10T14:35:00Z",
    "changed_by": "joaosilva",
    "field": "notes",
    "old_value": "Left drivetrain motor.",
    "new_value": "Updated notes."
  }
]
```

---

### Inventory — `prefix: /inventory`

**Status:** Router defined in `features/inventory/routes.py`. Service layer and query logic pending implementation.

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/inventory` | Any | List components with filters and pagination |

#### `GET /inventory`

List all components with filtering, sorting, and pagination.

**Auth:** Any authenticated member

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `type_slug` | string | — | Filter by component type slug |
| `status` | string | — | Filter by status (`available`, `in_use`, `loaned`, `under_maintenance`, `decommissioned`) |
| `q` | string | — | Free-text search on code and notes |
| `page` | int | `1` | Page number |
| `page_size` | int | `20` | Results per page (max: `100`) |
| `sort_by` | string | `created_at` | Sort field (`created_at`, `updated_at`, `status`, `code`) |
| `sort_dir` | string | `desc` | Sort direction (`asc`, `desc`) |

**Response `200`:**
```json
{
  "items": [
    {
      "code": "falcon500-2025-005",
      "component_type": "Falcon 500 Motor",
      "type_slug": "falcon500",
      "status": "available",
      "notes": "Left drivetrain motor.",
      "created_at": "2025-03-10T14:32:00Z",
      "updated_at": "2025-03-10T14:32:00Z"
    }
  ],
  "total": 42,
  "page": 1,
  "page_size": 20
}
```

---

### Health

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/health` | None | Health check for uptime monitors |

#### `GET /health`

**Auth:** None

**Response `200`:**
```json
{
  "status": "ok"
}
```

---

## Permission Matrix

| Action | `member` | `admin` |
|--------|----------|---------|
| View inventory & components | ✅ | ✅ |
| Register new components | ✅ | ✅ |
| Update component data & status | ✅ | ✅ |
| Create / edit component types | ✅ | ✅ |
| Archive component types | ❌ | ✅ |
| Create member accounts | ❌ | ✅ |
| Generate activation tokens | ❌ | ✅ |
| List member accounts | ❌ | ✅ |

---

## Error Response Format

All errors follow a consistent format:

```json
{
  "detail": "Human-readable error message."
}
```

**Common HTTP Status Codes:**

| Code | Meaning |
|------|---------|
| `400` | Bad request (validation, business rule violation) |
| `401` | Unauthenticated (missing/invalid/expired token) |
| `403` | Forbidden (insufficient role) |
| `404` | Resource not found |
| `409` | Conflict (duplicate, state conflict) |
| `422` | Validation error (invalid field values, missing required fields) |
| `500` | Internal server error |

---

## Implementation Status

| Module | Routes | Schemas | Service | Models |
|--------|--------|---------|---------|--------|
| Auth | ✅ Complete | ✅ Complete | ✅ Complete | ✅ Complete |
| Component Types | ✅ Complete | ✅ Complete | ✅ Complete | ✅ Complete |
| Components | ⚠️ Skeleton | ✅ Complete | ❌ Empty | ✅ Complete |
| Inventory | ⚠️ Skeleton | ✅ Complete | ❌ Empty | N/A (uses Component) |
