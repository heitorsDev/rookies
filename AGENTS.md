# Rookies — Technical Specification & Business Rules

> **Purpose**: This document defines the business rules, architecture decisions, data models, API contracts, and development guidelines for the Rookies project. It is intended to be used as the single source of truth for all development work on this project.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Business Rules](#2-business-rules)
3. [Architecture Overview](#3-architecture-overview)
4. [Tech Stack & Hosting](#4-tech-stack--hosting)
5. [Data Models](#5-data-models)
6. [Feature Modules](#6-feature-modules)
7. [Authentication System](#7-authentication-system)
8. [API Contract](#8-api-contract)
9. [Frontend Structure](#9-frontend-structure)
10. [Dynamic Form Engine](#10-dynamic-form-engine)
11. [Component Lifecycle & Status](#11-component-lifecycle--status)
12. [Suggested Enhancements](#12-suggested-enhancements)
13. [Development Guidelines](#13-development-guidelines)
14. [Environment & Deployment](#14-environment--deployment)

---

## 1. Project Overview

Rookies is an internal team tool for registering, tracking, and diagnosing electrical components used in a FIRST Robotics Competition (FRC) robot. Components are connected via CAN bus, diagnosed using vendor applications, and the results — along with mechanical/electrical observations — must be recorded, searchable, and updatable by any team member.

### Core Goals

- Replace ad-hoc diagnosis notes with a structured, centralized registry.
- Allow the team to define new **component types** (e.g., Falcon 500, SPARK MAX, NavX) internally, each with a unique **form schema** tailored to that component's diagnostic attributes.
- On form submission, generate a unique **component code** that identifies the registered unit.
- Provide an inventory view where any team member can see, filter, and update component records.

---

## 2. Business Rules

### 2.1 Access & Authorization

- Access to Rookies is **restricted to registered team members only**. All API endpoints (except `/auth/login` and `/health`) require a valid JWT access token.
- Team members are **pre-registered by an admin** (another team member with the `admin` role). There is no public self-registration flow.
- After creation, the member receives a one-time activation token from the admin. The member uses this token to set their own password via `POST /auth/activate`. All subsequent logins use username + password.
- There are two roles: `member` and `admin`. See [Section 2.1.1](#211-roles--permissions) for the permission matrix.
- Any authenticated team member can: view the inventory, register new components, update component attributes, and change component status.
- All mutations (create, update) record the acting member's identity in the history log automatically via the JWT payload — no manual "your name" input is needed.

#### 2.1.1 Roles & Permissions

| Action | `member` | `admin` |
|---|---|---|
| View inventory & components | ✅ | ✅ |
| Register new components | ✅ | ✅ |
| Update component data & status | ✅ | ✅ |
| Create / edit Component Types | ✅ | ✅ |
| Archive Component Types | ❌ | ✅ |
| Create team member accounts | ❌ | ✅ |
| Revoke / deactivate member accounts | ❌ | ✅ |
| Generate new login tokens for members | ❌ | ✅ |
| View all member accounts | ❌ | ✅ |

- The first account in Rookies is **automatically assigned the `admin` role** (bootstrapped via a CLI command or an env-variable-protected seed endpoint). All subsequent accounts default to `member` unless explicitly promoted.
- An admin cannot demote themselves if they are the only admin in Rookies.

### 2.2 Component Types (Schemas)

- A **Component Type** defines the template for a category of electrical components (e.g., "Falcon 500 Motor", "SPARK MAX Controller", "Pneumatics Hub").
- Each Component Type contains:
  - A **human-readable name** and description.
  - A **slug** (e.g., `falcon-500`) used in URLs and code generation.
  - A list of **field definitions** that describe the form fields for that type. See [Section 9](#9-dynamic-form-engine) for the full field type reference.
- Component Types are created and managed via an internal admin section of Rookies (no separate admin panel required; it is a dedicated page/route).
- **Deleting a Component Type is forbidden** if any Component records reference it. It may be archived (soft-deleted) instead.
- Component Types are **versioned** implicitly: when a schema changes, existing components retain the data they were recorded with and display a warning if their schema version differs from the current one.

### 2.3 Components (Records)

- A **Component** is a single physical unit of a given Component Type.
- Each Component has:
  - A **unique code** generated at registration time (see [2.4](#24-component-code-generation)).
  - A reference to its **Component Type**.
  - A snapshot of the **form data** submitted at registration (the diagnostic payload).
  - A **status** field (see [2.5](#25-component-status)).
  - A **notes** free-text field for mechanical/contextual observations not covered by the schema.
  - **Timestamps**: `created_at`, `updated_at`.
  - An **update history log**: a list of every attribute change with a timestamp and the **name of the member who made the change** (derived automatically from the JWT token).
- Components can be updated at any time. Any change to `status`, diagnostic fields, or notes is logged.
- Components cannot be permanently deleted; they can only be archived (status = `decommissioned`).

### 2.4 Component Code Generation

The unique code is generated server-side upon successful form submission and follows this format:

```
{TYPE_SLUG}-{YEAR}-{SEQUENCE}
```

**Examples:**
- `falcon500-2025-001`
- `sparkmax-2025-014`
- `navx-2025-003`

Rules:
- `TYPE_SLUG` is derived from the Component Type's slug, with hyphens removed and trimmed to 10 characters (`falcon500`, `sparkmax`).
- `YEAR` is the 4-digit current year at registration time.
- `SEQUENCE` is a zero-padded 3-digit integer, auto-incremented per type per year (resets to `001` each new year).
- The code is **immutable** after generation.
- The code is returned immediately in the API response body after a successful POST.

### 2.5 Component Status

A component must always have one of the following statuses:

| Status | Description |
|---|---|
| `available` | In inventory, ready to be used. |
| `in_use` | Currently installed on the robot or a test bench. |
| `loaned` | Lent to another team or person. A `loan_info` sub-field (borrower name, expected return date) must be filled when this status is set. |
| `under_maintenance` | Being repaired or re-diagnosed. |
| `decommissioned` | Retired from service. Functionally a soft delete. |

- Status transitions can happen freely (no enforced state machine), but the UI should make the currently allowed transitions obvious.
- When status is set to `loaned`, the `loan_info` fields are required.
- When status changes away from `loaned`, `loan_info` is cleared.

### 2.6 Diagnostic Data & Attachments

- The primary diagnostic input is the **form data** defined by the Component Type schema.
- Additionally, each component may store **attachments**: image files or text dumps from vendor diagnostic tools (e.g., REV Hardware Client output, CTRE Phoenix Tuner export).
- Attachments are stored as references (file path or URL) rather than embedded in the database document. For the MVP, attachments can be stored as Base64 strings with a size cap of **2 MB per file** and a maximum of **5 attachments per component**.
- **Suggested enhancement**: Integrate with Cloudinary or Backblaze B2 for proper file storage in a later iteration.

---

## 3. Architecture Overview

### Monorepo, Feature-Based Structure

```
frc-registry/
├── backend/                  # FastAPI application
│   ├── app/
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── database.py
│   │   └── features/
│   │       ├── auth/
│   │       │   ├── models.py
│   │       │   ├── schemas.py
│   │       │   ├── routes.py
│   │       │   ├── service.py
│   │       │   └── dependencies.py   # FastAPI deps: get_current_member, require_admin
│   │       ├── component_types/
│   │       │   ├── models.py
│   │       │   ├── schemas.py
│   │       │   ├── routes.py
│   │       │   └── service.py
│   │       ├── components/
│   │       │   ├── models.py
│   │       │   ├── schemas.py
│   │       │   ├── routes.py
│   │       │   └── service.py
│   │       └── inventory/
│   │           ├── schemas.py
│   │           ├── routes.py
│   │           └── service.py
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/                 # Next.js application
│   ├── src/
│   │   ├── app/              # App Router
│   │   │   ├── (auth)/
│   │   │   │   └── login/
│   │   │   └── (app)/        # All protected routes grouped here
│   │   │       ├── layout.tsx # Auth guard for the entire app
│   │   │       └── ...
│   │   └── features/
│   │       ├── auth/
│   │       │   ├── components/
│   │       │   ├── hooks/
│   │       │   │   └── useAuth.ts
│   │       │   └── api.ts
│   │       ├── members/      # Admin-only member management
│   │       │   ├── components/
│   │       │   ├── hooks/
│   │       │   └── api.ts
│   │       ├── component-types/
│   │       │   ├── components/
│   │       │   ├── hooks/
│   │       │   └── api.ts
│   │       ├── components/
│   │       │   ├── components/
│   │       │   ├── hooks/
│   │       │   └── api.ts
│   │       ├── inventory/
│   │       │   ├── components/
│   │       │   ├── hooks/
│   │       │   └── api.ts
│   │       └── form-engine/
│   │           ├── DynamicForm.tsx
│   │           └── fields/
│   ├── package.json
│   └── .env.example
│
├── docker-compose.yml        # Optional local dev only
└── README.md
```

### Layer Responsibilities

| Layer | Responsibility |
|---|---|
| **Routes** (`routes.py`) | HTTP request/response handling, validation via Pydantic schemas. |
| **Service** (`service.py`) | Business logic, code generation, status transitions, history logging. |
| **Models** (`models.py`) | MongoEngine ODM document definitions. |
| **Schemas** (`schemas.py`) | Pydantic models for request validation and response serialization. |

---

## 4. Tech Stack & Hosting

### Backend

| Tool | Purpose |
|---|---|
| **Python 3.11+** | Language |
| **FastAPI** | Web framework |
| **MongoEngine** | ODM for MongoDB |
| **Pydantic v2** | Request/response validation |
| **uvicorn** | ASGI server |

### Frontend

| Tool | Purpose |
|---|---|
| **Next.js 14+** (App Router) | React framework |
| **TypeScript** | Type safety |
| **React Hook Form** | Form state management for dynamic forms |
| **Zod** | Runtime schema validation on the client |
| **TanStack Query** | Server state, caching, mutations |
| **Tailwind CSS** | Styling |
| **shadcn/ui** | Component primitives |

### Database

- **MongoDB Atlas Free Tier (M0)**: 512 MB storage, sufficient for component records and schemas. Connection via MongoEngine using `MONGODB_URI` env variable.

### Hosting (Free Tier)

| Service | Component | Notes |
|---|---|---|
| **Render** (free tier) | FastAPI backend | Spins down after inactivity; acceptable for internal team tool. Alternatively use Railway. |
| **Vercel** (Hobby) | Next.js frontend | Always on, global CDN. |
| **MongoDB Atlas** | Database | Free M0 cluster. |

> **Note on Render cold starts**: The free tier spins down after 15 minutes of inactivity. The frontend should display a "warming up" state on first load and retry requests automatically. Consider adding a `/health` endpoint and a simple uptime ping service (e.g., UptimeRobot free tier) to keep the backend warm.

---

## 5. Data Models

### 5.1 Member Document

Represents a registered team member who can log into Rookies.

```python
class Member(Document):
    meta = {'collection': 'members'}

    name         = StringField(required=True)           # Display name, e.g. "João Silva"
    username     = StringField(required=True, unique=True)  # Login handle, e.g. "joaosilva"
    role         = StringField(required=True, choices=['member', 'admin'], default='member')
    is_active    = BooleanField(default=True)           # False = account revoked
    login_token_hash = StringField()                    # bcrypt hash of the one-time activation token
    token_issued_at  = DateTimeField()                  # when the current token was generated
    password_hash    = StringField()                    # bcrypt hash of the member's chosen password
    created_at   = DateTimeField()
    updated_at   = DateTimeField()
    created_by   = StringField()                        # username of the admin who created this account
```

> **Note on authentication flow**: The system uses a two-step authentication process. First, an admin creates the account and a one-time activation token is generated (shown exactly once, only the bcrypt hash is stored). The member then uses this token to activate their account and set their own password. All subsequent logins use username + password. See [Section 7.5](#75-auth) for the API contract.

### 5.2 FieldDefinition (Embedded)

Represents a single field in a component type's form schema.

```python
class FieldDefinition(EmbeddedDocument):
    field_id    = StringField(required=True)   # e.g., "peak_current"
    label       = StringField(required=True)   # e.g., "Peak Current (A)"
    field_type  = StringField(required=True)   # see Section 9 for allowed types
    required    = BooleanField(default=False)
    default     = DynamicField()               # optional default value
    options     = ListField(StringField())     # for 'select' and 'multiselect' types
    min_value   = FloatField()                 # for 'number' and 'range' types
    max_value   = FloatField()
    unit        = StringField()                # display unit label, e.g., "RPM"
    placeholder = StringField()
    help_text   = StringField()
    # For 'auto' fields — value is computed or pasted, not typed by user
    auto        = BooleanField(default=False)
    auto_hint   = StringField()                # instruction for what to paste/copy
```

### 5.3 ComponentType Document

```python
class ComponentType(Document):
    meta = {'collection': 'component_types'}

    name        = StringField(required=True, unique=True)   # "Falcon 500 Motor"
    slug        = StringField(required=True, unique=True)   # "falcon500"
    description = StringField()
    fields      = EmbeddedDocumentListField(FieldDefinition)
    is_archived = BooleanField(default=False)
    created_at  = DateTimeField()
    updated_at  = DateTimeField()
```

### 5.4 HistoryEntry (Embedded)

```python
class HistoryEntry(EmbeddedDocument):
    timestamp   = DateTimeField(required=True)
    changed_by  = StringField(required=True)    # member username from JWT payload
    field       = StringField(required=True)    # which field changed
    old_value   = DynamicField()
    new_value   = DynamicField()
```

### 5.4 LoanInfo (Embedded)

```python
class LoanInfo(EmbeddedDocument):
    borrower_name   = StringField()
    expected_return = DateTimeField()
    notes           = StringField()
```

### 5.5 Attachment (Embedded)

```python
class Attachment(EmbeddedDocument):
    filename    = StringField(required=True)
    mime_type   = StringField()
    data        = StringField()     # Base64 encoded (MVP); replace with URL later
    uploaded_at = DateTimeField()
```

### 5.6 Component Document

```python
class Component(Document):
    meta = {'collection': 'components'}

    code            = StringField(required=True, unique=True)
    component_type  = ReferenceField(ComponentType, required=True)
    status          = StringField(
                        required=True,
                        choices=['available','in_use','loaned',
                                 'under_maintenance','decommissioned'],
                        default='available'
                      )
    diagnostic_data = DictField()       # arbitrary key-value from the form
    notes           = StringField()
    loan_info       = EmbeddedDocumentField(LoanInfo)
    attachments     = EmbeddedDocumentListField(Attachment)
    history         = EmbeddedDocumentListField(HistoryEntry)
    created_at      = DateTimeField()
    updated_at      = DateTimeField()
```

### 5.7 SequenceCounter Document

Used for generating sequential component codes.

```python
class SequenceCounter(Document):
    meta = {'collection': 'sequence_counters'}

    key     = StringField(required=True, unique=True)   # e.g., "falcon500-2025"
    value   = IntField(default=0)
```

---

## 6. Feature Modules

### 6.1 `component_types` Feature

Manages the creation and configuration of component type schemas.

**Responsibilities:**
- CRUD for ComponentType documents.
- Validate that `slug` is URL-safe, lowercase, alphanumeric with hyphens.
- Prevent deletion of types with associated components (return 409 Conflict).
- Soft-delete (archive) via `is_archived = True`.
- Validate `FieldDefinition` entries: ensure `field_id` values within a type are unique, types are from the allowed set, and `options` are provided for `select`/`multiselect` fields.

### 6.2 `components` Feature

Manages individual component records.

**Responsibilities:**
- Create a new component from a type's form submission.
- Generate the unique component code via `SequenceCounter`.
- Validate `diagnostic_data` keys against the referenced ComponentType's field definitions.
- Log every attribute change to the `history` array.
- Handle status transitions and `loan_info` enforcement.
- Handle attachment uploads (Base64 validation, size cap).
- Retrieve a single component by code.

### 6.3 `inventory` Feature

Provides the team overview of all components.

**Responsibilities:**
- List all components with pagination (default page size: 20).
- Filter by: `component_type`, `status`, `code` (partial match), free-text search on `notes`.
- Sort by: `created_at`, `updated_at`, `status`, `code`.
- Return a summary projection (code, type name, status, created_at, notes preview) for the list view; full document for the detail view.

---

## 7. API Contract

### Base URL
```
/api/v1
```

### 7.1 Component Types

| Method | Path | Description |
|---|---|---|
| `GET` | `/component-types` | List all (non-archived) component types |
| `POST` | `/component-types` | Create a new component type |
| `GET` | `/component-types/{slug}` | Get a single type with its full field schema |
| `PUT` | `/component-types/{slug}` | Update name, description, or fields |
| `DELETE` | `/component-types/{slug}` | Archive a component type (soft delete) |

**POST `/component-types` request body:**
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
    },
    {
      "field_id": "peak_current",
      "label": "Peak Current (A)",
      "field_type": "number",
      "unit": "A"
    },
    {
      "field_id": "fault_flags",
      "label": "Active Faults",
      "field_type": "multiselect",
      "options": ["Hardware Failure", "Under Voltage", "Reset During En", "Motor Fault"]
    }
  ]
}
```

### 7.2 Components

| Method | Path | Description |
|---|---|---|
| `POST` | `/components` | Register a new component (returns code) |
| `GET` | `/components/{code}` | Get full component record |
| `PATCH` | `/components/{code}` | Update status, diagnostic data, notes, or attachments |
| `GET` | `/components/{code}/history` | Get the history log for a component |

**POST `/components` request body:**
```json
{
  "component_type_slug": "falcon500",
  "diagnostic_data": {
    "device_id": 5,
    "firmware_version": "24.1.0",
    "peak_current": 38.2,
    "fault_flags": ["Under Voltage"]
  },
  "notes": "Left drivetrain motor. Replaced encoder gear in Jan 2025.",
  "status": "available"
}
```

**POST `/components` response (201 Created):**
```json
{
  "code": "falcon500-2025-005",
  "component_type": "Falcon 500 Motor",
  "status": "available",
  "diagnostic_data": { ... },
  "created_at": "2025-03-10T14:32:00Z"
}
```

**PATCH `/components/{code}` request body (all fields optional):**
```json
{
  "status": "loaned",
  "loan_info": {
    "borrower_name": "Team 4414",
    "expected_return": "2025-04-01",
    "notes": "Borrowed for offseason testing."
  },
  "notes": "Updated notes.",
  "diagnostic_data": {
    "peak_current": 40.1
  }
}
```

### 7.3 Inventory

| Method | Path | Description |
|---|---|---|
| `GET` | `/inventory` | List components with filters and pagination |

**GET `/inventory` query parameters:**

| Parameter | Type | Description |
|---|---|---|
| `type_slug` | string | Filter by component type |
| `status` | string | Filter by status |
| `q` | string | Free-text search on code and notes |
| `page` | int | Page number (default: 1) |
| `page_size` | int | Results per page (default: 20, max: 100) |
| `sort_by` | string | `created_at`, `updated_at`, `status`, `code` |
| `sort_dir` | string | `asc` or `desc` |

### 7.4 Health

| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | Returns `{"status": "ok"}` — used by uptime monitors |

### 7.5 Auth

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/seed` | Seed key (query) | Bootstrap the first admin account |
| `POST` | `/auth/members` | Admin JWT | Create a new member and return a one-time activation token |
| `POST` | `/auth/tokens` | Admin JWT | Generate a new activation token for a member |
| `POST` | `/auth/activate` | None | Activate an account using the one-time token and set a password |
| `POST` | `/auth/login` | None | Log in with username + password, returns a JWT |
| `GET` | `/auth/members` | Admin JWT | List all members |

**POST `/auth/activate` request body:**
```json
{
  "username": "joaosilva",
  "token": "<one-time-token-from-admin>",
  "password": "my-secure-password"
}
```

**POST `/auth/activate` response:**
```json
{
  "detail": "Account activated. You can now log in with your password."
}
```

**POST `/auth/login` request body:**
```json
{
  "username": "joaosilva",
  "password": "my-secure-password"
}
```

**POST `/auth/login` response:**
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

---

## 8. Frontend Structure

### Routes (Next.js App Router)

| Route | Description |
|---|---|
| `/` | Redirect to `/inventory` |
| `/activate` | Activate account using one-time token and set password |
| `/login` | Login with username and password |
| `/inventory` | Component inventory list with filters |
| `/inventory/[code]` | Component detail page |
| `/inventory/[code]/edit` | Edit component attributes and status |
| `/register` | Select a component type and fill out its dynamic form |
| `/register/success` | Shows generated code after successful registration |
| `/types` | List all component types |
| `/types/new` | Create a new component type (schema builder) |
| `/types/[slug]` | View a component type's schema |
| `/types/[slug]/edit` | Edit a component type's schema |

### Key Frontend Features

- **Inventory page**: Card or table view, filter bar (status chips, type dropdown, search input), pagination, click to open detail.
- **Component detail page**: Displays all diagnostic data fields with their labels and units, current status with a change dropdown, notes, history timeline, and attachment viewer.
- **Dynamic form**: Rendered by the `DynamicForm` component based on the schema fetched from the selected component type. See [Section 9](#9-dynamic-form-engine).
- **Schema builder** (`/types/new`, `/types/[slug]/edit`): A drag-and-drop field editor allowing the team to add, reorder, and configure field definitions visually without writing code.

---

## 9. Dynamic Form Engine

The form engine is the core innovation of Rookies. It allows the team to define component schemas internally, and the frontend automatically renders the correct form.

### Supported Field Types

| `field_type` | UI Control | Notes |
|---|---|---|
| `text` | `<input type="text">` | General string input |
| `number` | `<input type="number">` | Supports `min_value`, `max_value`, `unit` label |
| `boolean` | Toggle / Checkbox | Yes/No values |
| `select` | Dropdown | Requires `options` array |
| `multiselect` | Multi-checkbox or tag picker | Requires `options` array |
| `range` | Slider | Requires `min_value` and `max_value` |
| `textarea` | `<textarea>` | Multi-line text |
| `file` | File upload | Stored as Base64 attachment |
| `auto` | Read-only text input with paste hint | For values copied from vendor tools; `auto_hint` is shown as helper text |
| `date` | Date picker | ISO date string stored |

### Form Rendering Logic (`DynamicForm.tsx`)

1. Fetch the component type schema from `GET /api/v1/component-types/{slug}`.
2. Iterate over `fields` array, render the appropriate field component per `field_type`.
3. Mark fields with `required: true` as required in the Zod schema.
4. Display `help_text` as a tooltip or subtitle beneath the field.
5. Display `unit` as a suffix label next to number inputs.
6. For `auto` fields, render a read-only-styled input with a clipboard paste button and `auto_hint` as instructional text (e.g., *"Paste the firmware version string from Phoenix Tuner X"*).
7. On submit, POST the `diagnostic_data` payload to `POST /api/v1/components`.

### Schema Builder UI (`/types/new`)

- List of field cards, each showing field label, type, and a settings panel.
- "Add Field" button appends a new field card with defaults.
- Drag handle for reordering.
- Each card exposes: `label`, `field_type` (dropdown), `required` toggle, `unit`, `help_text`, `options` (shown when type is `select`/`multiselect`), `auto` toggle and `auto_hint` (shown when `auto` is true).
- `field_id` is auto-derived from `label` (lowercased, spaces replaced with underscores) but can be overridden.
- Preview panel on the right renders the form live as fields are configured.

---

## 10. Component Lifecycle & Status

```
Registration
     │
     ▼
 [available] ◄────────────────────────────────────────────┐
     │                                                     │
     ├──► [in_use] ──────────────────────────────────────► │
     │                                                     │
     ├──► [loaned] ─── requires loan_info ──────────────► │
     │                                                     │
     └──► [under_maintenance] ───────────────────────────► │
                                                           │
 [decommissioned] ◄── from any status (irreversible UI warning)
```

- All transitions except to/from `decommissioned` are freely reversible.
- Moving to `decommissioned` triggers a confirmation dialog in the UI: *"This component will be retired and removed from active inventory. This cannot be undone."*
- `decommissioned` components do not appear in the default inventory list unless the filter "Show decommissioned" is enabled.

---

## 11. Suggested Enhancements

These are not in scope for the MVP but should be designed in a way that makes future adoption easy.

### 11.1 User Identification (No Auth)

Rather than full authentication, add an optional **"Your name"** text input to every create/update action. This name is stored in the `HistoryEntry.changed_by` field. This gives activity attribution without the overhead of auth infrastructure.

### 11.2 QR Code Labels

Generate a QR code image for each component's code upon registration. The QR code encodes the URL `{FRONTEND_URL}/inventory/{code}`. The team can print labels and stick them on components. Implement using the `qrcode` Python library on the backend as a `GET /components/{code}/qr` endpoint.

### 11.3 Component Linking

Allow a component to reference related components (e.g., a SPARK MAX linked to the NEO motor it controls). Add an optional `related_components` array field (list of codes) to the Component document.

### 11.4 Bulk Import via CSV

Provide a CSV template per component type and a `POST /components/bulk` endpoint that parses and registers multiple components in one request. Useful for initializing inventory at the start of a season.

### 11.5 Diagnostic History per Component

Beyond attribute change history, allow multiple **diagnostic sessions** to be logged for the same component over time (e.g., tested at week 0, week 3, and after a crash). This means `diagnostic_data` becomes an array of `DiagnosticSession { timestamp, data, notes }` rather than a flat dict. The current displayed data is always the most recent session. This is a significant schema change; plan for it by keeping `diagnostic_data` as a dict in V1 and migrating later.

### 11.6 Competition Mode

A read-only "pit mode" view optimized for mobile, showing only: component code, type, status, and notes. Accessible via a `/pit` route with no editing capability.

### 11.7 File Storage Migration

Replace Base64 attachment storage with Cloudinary (free tier: 25 GB storage, 25 GB bandwidth). The `Attachment` model `data` field becomes a `url` field pointing to the Cloudinary resource.

---

## 12. Development Guidelines

### 12.1 Backend

- Use `async` FastAPI route handlers throughout.
- MongoEngine operates synchronously; use `asyncio.to_thread()` to wrap blocking ODM calls in async routes to avoid blocking the event loop.
- All service functions must raise typed `HTTPException`s with clear `detail` messages rather than returning error dicts.
- Use `datetime.utcnow()` for all timestamps; store as UTC in MongoDB.
- Validate `slug` fields with a regex: `^[a-z0-9]+(-[a-z0-9]+)*$`.
- The `diagnostic_data` dict must be validated against the component type's field definitions at the service layer. Unknown keys should be rejected (return 422). Missing required keys should be rejected.
- Use `mongoengine.connect()` in `database.py`, called once on app startup via a `lifespan` context manager in `main.py`.
- Enable CORS for the frontend's origin via `fastapi.middleware.cors.CORSMiddleware`.

### 12.2 Code Generation Atomicity

The sequence counter increment must be atomic to prevent duplicate codes when concurrent requests are made:

```python
# Use MongoDB's findAndModify via MongoEngine's modify()
counter = SequenceCounter.objects(key=counter_key).modify(
    upsert=True,
    new=True,
    inc__value=1
)
sequence = counter.value
```

### 12.3 Frontend

- Use Next.js **App Router** with Server Components where possible (inventory list, component detail). Use Client Components only for interactive elements (forms, status dropdowns, filter bar).
- API calls from Server Components use `fetch` with `cache: 'no-store'` for dynamic data.
- Client-side mutations use TanStack Query's `useMutation` hook, invalidating the relevant query on success.
- `DynamicForm` is always a Client Component (uses `react-hook-form`).
- The Zod schema for a dynamic form is constructed at runtime from the fetched field definitions.
- Environment variable `NEXT_PUBLIC_API_URL` points to the FastAPI backend.

### 12.4 Error Handling

- Backend returns RFC 7807-style error bodies:
  ```json
  { "detail": "Component type 'falcon500' not found." }
  ```
- Frontend displays errors via a toast notification system (e.g., `sonner`).
- Network errors and 5xx responses show a retry option.

### 12.5 Testing

- Backend: `pytest` with `mongomock` for unit tests on service functions.
- Frontend: `vitest` + `@testing-library/react` for component tests.
- At minimum, test: code generation logic, field validation in dynamic forms, and status transition enforcement.

---

## 13. Environment & Deployment

### Backend `.env.example`

```
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority
FRONTEND_ORIGIN=https://your-app.vercel.app
```

### Frontend `.env.example`

```
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api/v1
```

### Deployment Checklist

- [ ] MongoDB Atlas cluster created, IP access set to `0.0.0.0/0` (or Render/Vercel static IPs whitelisted).
- [ ] Backend deployed to Render with `MONGODB_URI` and `FRONTEND_ORIGIN` set as environment variables. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.
- [ ] Frontend deployed to Vercel with `NEXT_PUBLIC_API_URL` set.
- [ ] UptimeRobot configured to ping `GET {BACKEND_URL}/api/v1/health` every 5 minutes.
- [ ] At least one ComponentType created via the `/types/new` UI before onboarding the team.

---

*Document version: 1.0 — Generated for the Rookies project.*