# Trip Management

## Lifecycle
Draft → Dispatched → Completed → Cancelled

## Create Trip
- Source & Destination
- Available Vehicle
- Available Driver
- Cargo Weight
- Planned Distance

## Rules & Validations
- Cargo weight must not exceed vehicle's maximum load capacity.
- Dispatching a trip sets vehicle and driver status to `On Trip`.
- Completing a trip sets vehicle and driver back to `Available`.
- Cancelling a dispatched trip restores statuses to `Available`.

## Tech Stack
Trip APIs and validation logic should use the canonical backend stack in `ai-context/tech-stack.md`.

---

[Canonical Tech Stack](../tech-stack.md)
