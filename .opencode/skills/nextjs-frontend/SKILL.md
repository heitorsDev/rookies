---
name: nextjs-frontend
description: Next.js 14+ App Router frontend with TypeScript, Tailwind CSS, shadcn/ui, TanStack Query, React Hook Form, and Zod
license: MIT
compatibility: opencode
---

## What I do
- Build Next.js App Router pages and layouts (Server Components by default, Client Components for interactivity)
- Implement dynamic forms with React Hook Form + Zod runtime schema validation
- Manage server state with TanStack Query (useMutation + query invalidation)
- Build UI with Tailwind CSS and shadcn/ui primitives
- Fetch API data with `fetch` and `cache: 'no-store'` from Server Components

## Conventions
- Server Components for data-fetching pages; Client Components only for forms, filters, dropdowns
- DynamicForm is always a Client Component (uses react-hook-form)
- Construct Zod schema at runtime from fetched field definitions
- Use `NEXT_PUBLIC_API_URL` env variable for the backend base URL
- Display errors using a toast notification system (sonner)

## When to load me
Load this skill when adding or modifying frontend pages, forms, data fetching, or UI components.
