# Mandatory Business Rules

- Vehicles in `In Shop` or `Retired` status must be excluded from dispatch.
- Drivers with expired licenses or `Suspended` status cannot be assigned.
- Prevent assignment of drivers or vehicles that are already `On Trip`.
- Enforce cargo weight ≤ vehicle maximum load capacity.
- Dispatching, completing, and cancelling trips must update statuses atomically.

## Tech Stack
Validation and enforcement code should follow the backend tech choices in `ai-context/tech-stack.md`.

---

[Canonical Tech Stack](../tech-stack.md)
