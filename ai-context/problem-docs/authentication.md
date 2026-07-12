# Authentication & Authorization

## Requirements
- Secure login via email and password.
- Role-Based Access Control (RBAC) with roles: Fleet Manager, Driver, Safety Officer, Financial Analyst.
- Only authenticated users may access the application.
- Token-based sessions for API authentication (JWT).

## Implementation Notes
- Protect backend endpoints with JWT middleware.
- Enforce RBAC checks at the controller/service layer.

## Tech Stack
Copied from the canonical `ai-context/tech-stack.md`.

---

[Canonical Tech Stack](../tech-stack.md)
