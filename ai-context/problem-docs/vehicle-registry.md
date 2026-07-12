# Vehicle Registry

## Data Model
- Registration Number (unique)
- Vehicle Name / Model
- Type
- Maximum Load Capacity
- Odometer
- Acquisition Cost
- Status (Available, On Trip, In Shop, Retired)

## Rules
- Registration number must be unique.
- Vehicles marked "Retired" or "In Shop" must not appear in dispatch selections.

## Tech Stack
Backend CRUD and persistence follow `ai-context/tech-stack.md`.

---

[Canonical Tech Stack](../tech-stack.md)
