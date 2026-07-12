# Database & Schema Guidance

Primary entities (high-level):
- `users` — id, name, email (unique), hashedPassword, roles, status, createdAt
- `vehicles` — id, registrationNumber (unique), model, type, maxLoadKg, odometer, acquisitionCost, status, region
- `drivers` — id, name, licenseNumber, licenseCategory, licenseExpiryDate, contactNumber, safetyScore, status
- `trips` — id, source, destination, plannedDistanceKm, actualDistanceKm, cargoWeightKg, vehicleId, driverId, status, createdBy, timestamps
- `maintenance` — id, vehicleId, type, description, status, startDate, completedDate, estimatedCost, actualCost
- `fuel_logs` — id, vehicleId, date, liters, cost, tripId (nullable)
- `expenses` — id, vehicleId (nullable), date, amount, category, notes

Schema recommendations:
- Enforce unique constraint on `vehicles.registrationNumber` and `users.email`.
- Use DB transactions for multi-entity updates (dispatching a trip updates trip, vehicle, driver atomically).
- Add indices on `status` fields and `vehicleId`/`driverId` foreign keys for fast availability queries.
- Store numeric money values in integer cents (or use `numeric` in Postgres) to avoid floating point issues.

Migration & ORM:
- Use Prisma for schema modeling and migrations; develop locally with SQLite and migrate to Postgres for production.
