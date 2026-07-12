# Example Workflow

1. Register vehicle `Van-05` (Max Capacity: 500 kg). Status = Available.
2. Register driver `Alex` with a valid license.
3. Create a trip with Cargo Weight = 450 kg.
4. System validates weight ≤ capacity and allows dispatch.
5. Vehicle and Driver status become `On Trip`.
6. Complete trip by entering final odometer and fuel consumed.
7. System marks both Vehicle and Driver as `Available`.
8. Create a maintenance record (e.g., Oil Change); vehicle status becomes `In Shop`.
9. Reports update operational cost and fuel efficiency.

## Tech Stack
Refer to `ai-context/tech-stack.md` for implementation.

---

[Canonical Tech Stack](../tech-stack.md)
