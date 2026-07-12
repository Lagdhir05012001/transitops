# Functional Requirements

- The vehicle registration number must be unique.
- Retired or In Shop vehicles must never appear in the dispatch selection.
- Drivers with expired licenses or Suspended status cannot be assigned to trips.
- A driver or vehicle already marked On Trip cannot be assigned to another trip.
- Cargo Weight must not exceed the vehicle's maximum load capacity.
- Dispatching a trip automatically changes both the vehicle and driver status to `On Trip`.
- Completing a trip automatically changes both the vehicle and driver status back to `Available`.
- Cancelling a dispatched trip restores the vehicle and driver to `Available`.
- Creating an active maintenance record automatically changes vehicle status to `In Shop`.
- Closing maintenance restores the vehicle to `Available` (unless retired).

## Tech Stack
Backend APIs and validation logic should adhere to `ai-context/tech-stack.md`.

---

[Canonical Tech Stack](../tech-stack.md)
