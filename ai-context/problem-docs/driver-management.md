# Driver Management

## Data Model
- Name
- License Number
- License Category
- License Expiry Date
- Contact Number
- Safety Score
- Status (Available, On Trip, Off Duty, Suspended)

## Rules
- Drivers with expired licenses or Suspended status cannot be assigned to trips.
- Drivers marked On Trip cannot be assigned to a second trip simultaneously.

## Tech Stack
Refer to `ai-context/tech-stack.md` for backend and notification implementations.

---

[Canonical Tech Stack](../tech-stack.md)
