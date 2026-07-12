# Business Rules (Implementation Notes)

These rules must be enforced at the API/service level and validated in the UI.

- Unique vehicle registration: `vehicles.registrationNumber` must be unique. Enforce at DB constraint and surface a clear validation message.
- Exclude `In Shop` and `Retired` vehicles from dispatch selection: filter queries and UI lists should respect status.
- Driver assignment rules: drivers with expired licenses or `Suspended` status cannot be assigned to trips. Validate before dispatch.
- Single assignment: a driver or vehicle already `On Trip` cannot be assigned to another trip; check with database locking or optimistic concurrency.
- Capacity validation: `cargoWeightKg` must not exceed the vehicle's `maxLoadKg`.
- Atomic transitions: dispatching, completing, cancelling trips, and creating maintenance records must change related statuses atomically.
- Maintenance lifecycle: creating a maintenance record sets vehicle to `In Shop`; closing restores to `Available` unless explicitly `Retired`.

Audit: log who performed each state change and why.
