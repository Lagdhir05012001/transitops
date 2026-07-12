# API Specification (Business Functions)

This document describes the business-level API functions, their purpose, required inputs, expected outputs, authorization rules, validations, and side-effects. Avoids implementation detail such as exact route names; instead focuses on behavior and contracts that API endpoints must satisfy.

## Common patterns
- Authentication: Token-based (JWT) required for all protected operations.
- Authorization: Role-Based Access Control (Fleet Manager, Driver, Safety Officer, Financial Analyst). Each function lists required roles.
- Response format: JSON envelopes with `success`, `data`, and `errors` fields.
- Pagination & filtering: Use `page`, `limit`, `sort`, and filter parameters for list queries.

## 1. Authentication & User Session
Function: Authenticate user and issue session token
- Purpose: Verify credentials and return an access token and basic user profile with role(s).
- Inputs: `email`, `password`.
- Outputs: `accessToken`, `expiresIn`, `user: {id, name, email, roles}`.
- Auth/Permissions: Public.
- Validations: Correct email format; password non-empty. Lock account after configurable failed attempts.
- Side effects: None except token issuance and login audit event.

Function: Refresh token / revoke session
- Purpose: Renew token or revoke on logout.
- Inputs: refresh token or access token for revocation.
- Outputs: new token or success acknowledgement.
- Auth/Permissions: Authenticated users.

## 2. Users & Roles
Function: Get current user profile
- Purpose: Return user details and roles.
- Inputs: Access token.
- Outputs: `user` object with roles and permissions.
- Auth/Permissions: Authenticated.

Function: Manage user accounts (create/update/deactivate)
- Purpose: Admin-level user management.
- Inputs: `name`, `email`, `roles`, `status`.
- Outputs: Created/updated user record.
- Auth/Permissions: Fleet Manager or Admin role.
- Validations: Unique email.

## 3. Vehicle Management
Function: Create / update vehicle record
- Purpose: Register and maintain vehicle master data.
- Inputs: `registrationNumber` (unique), `model`, `type`, `maxLoadKg`, `odometer`, `acquisitionCost`, `status`.
- Outputs: Vehicle object.
- Auth/Permissions: Fleet Manager.
- Validations: `registrationNumber` uniqueness; `maxLoadKg` > 0; `status` in {Available, On Trip, In Shop, Retired}.
- Side effects: Index vehicle for dispatch queries.

Function: List / filter vehicles
- Purpose: Retrieve vehicles filtered by `status`, `type`, `region`, availability.
- Inputs: filters (`status`, `type`), pagination, sorting.
- Outputs: Paginated list of vehicles.
- Auth/Permissions: Authenticated users (restricted fields depending on role).

Function: Change vehicle status (retire, mark in shop, etc.)
- Purpose: Update lifecycle state; used by maintenance workflows and admin actions.
- Inputs: `vehicleId`, `newStatus`, optional `reason`.
- Outputs: Updated vehicle object.
- Auth/Permissions: Fleet Manager or Maintenance role.
- Business rules: Setting `In Shop` or `Retired` removes vehicle from dispatch pool.

## 4. Driver Management
Function: Create / update driver profile
- Purpose: Maintain driver records including license info and safety score.
- Inputs: `name`, `licenseNumber`, `licenseCategory`, `licenseExpiryDate`, `contactNumber`, `status`.
- Outputs: Driver object.
- Auth/Permissions: Fleet Manager, Safety Officer.
- Validations: `licenseExpiryDate` must be a valid date; `status` in {Available, On Trip, Off Duty, Suspended}.
- Side effects: Schedule license expiry reminder jobs when `licenseExpiryDate` set.

Function: List / filter drivers
- Purpose: Retrieve drivers with filters like `status`, `licenseValid`.
- Inputs: filters, pagination.
- Outputs: Paginated list.
- Auth/Permissions: Authenticated.

## 5. Trip Management
Function: Create trip (draft)
- Purpose: Create a trip record in Draft state.
- Inputs: `source`, `destination`, `plannedDistanceKm`, `cargoWeightKg`, optional `plannedStart`, selected `vehicleId` (nullable), selected `driverId` (nullable), `createdBy`.
- Outputs: Trip object (status = Draft).
- Auth/Permissions: Driver (create own) and Fleet Manager.
- Validations: If `vehicleId` present, must exist and not be `In Shop`/`Retired`; if `driverId` present, license must be valid and not Suspended; `cargoWeightKg` <= vehicle `maxLoadKg` when vehicle selected.

Function: Dispatch trip (Draft -> Dispatched)
- Purpose: Reserve resources and mark trip as active for execution.
- Inputs: `tripId`, `vehicleId`, `driverId`, `dispatchTime`.
- Outputs: Updated trip object (status = Dispatched) and updated vehicle/driver statuses.
- Auth/Permissions: Fleet Manager or authorized dispatch role.
- Business rules & side effects:
	- Must validate vehicle and driver availability (not already `On Trip`).
	- Drivers with expired licenses or `Suspended` cannot be assigned.
	- Dispatch operation MUST atomically set trip status and both vehicle and driver to `On Trip`.
	- If capacity validation fails (cargoWeight > maxLoad), reject with validation error.

Function: Complete trip (Dispatched -> Completed)
- Purpose: Finalize trip, record odometer and fuel consumed, and free resources.
- Inputs: `tripId`, `finalOdometer`, `fuelConsumedLiters`, optional `actualDistanceKm`, `notes`.
- Outputs: Completed trip summary and updated vehicle/driver statuses back to `Available`.
- Auth/Permissions: Driver who is assigned or Fleet Manager.
- Side effects: Create fuel log entry if provided; update vehicle odometer; update reports and cost calculations.

Function: Cancel trip
- Purpose: Cancel a Draft or Dispatched trip, freeing resources.
- Inputs: `tripId`, `reason`.
- Outputs: Updated trip status (Cancelled); resource statuses restored.
- Auth/Permissions: Fleet Manager or trip owner (depending on policy).

## 6. Maintenance Workflow
Function: Create maintenance record
- Purpose: Log a maintenance activity and take the vehicle out of dispatch pool.
- Inputs: `vehicleId`, `maintenanceType`, `description`, `estimatedCost`, `startDate`, `expectedCompletionDate`.
- Outputs: Maintenance record; vehicle status updated to `In Shop`.
- Auth/Permissions: Fleet Manager, Maintenance role.
- Business rules: Creating active maintenance must atomically set vehicle status to `In Shop` and exclude it from dispatch selection.

Function: Close maintenance
- Purpose: Mark maintenance as completed and restore vehicle if appropriate.
- Inputs: `maintenanceId`, `actualCost`, `completedDate`, `notes`.
- Outputs: Closed maintenance record; vehicle status updated to `Available` unless `Retired`.

## 7. Fuel & Expense Management
Function: Create fuel log
- Purpose: Record fuel purchase and associate with vehicle/trip.
- Inputs: `vehicleId`, `date`, `liters`, `cost`, optional `tripId`, `vendor`.
- Outputs: Fuel log entry.
- Auth/Permissions: Driver (own trip) and Fleet Manager.
- Side effects: Affect Fuel Efficiency and Operational Cost calculations.

Function: Create expense (maintenance, tolls, etc.)
- Purpose: Record other operational expenses.
- Inputs: `vehicleId` (optional), `date`, `amount`, `category`, `notes`.
- Outputs: Expense entry.

Function: Compute operational cost and vehicle ROI
- Purpose: Aggregation functions used by reports. Not necessarily exposed as direct endpoints; can be requested as report functions.
- Inputs: `vehicleId`, date range.
- Outputs: `totalFuelCost`, `totalMaintenanceCost`, `operationalCost`, `fuelEfficiency` (distance / fuel), `vehicleROI` = (revenue - (maintenance + fuel)) / acquisitionCost.

## 8. Reports & Analytics
Function: Dashboard KPIs
- Purpose: Return aggregated KPIs: Active Vehicles, Available Vehicles, Vehicles In Maintenance, Active Trips, Pending Trips, Drivers On Duty, Fleet Utilization (%), Fuel Efficiency.
- Inputs: Optional filters (vehicleType, region, date range).
- Outputs: KPI object and small-timeseries for charts.
- Auth/Permissions: Authenticated; Financial Analyst and Fleet Manager get extended metrics.

Function: Export CSV for report
- Purpose: Provide CSV export of requested dataset (trips, fuel logs, expenses).
- Inputs: dataset type, filters, columns.
- Outputs: CSV file link or streamed response.
- Auth/Permissions: Authenticated; role-based access to sensitive data.

## 9. File Uploads & Document Management
Function: Upload vehicle/driver documents
- Purpose: Store attachments (registration, license scans, invoices).
- Inputs: multipart file, metadata (`entityType`, `entityId`, `documentType`).
- Outputs: Stored file record with URL.
- Auth/Permissions: Fleet Manager, Driver (own documents).
- Validations: Accept only allowed file types and size limits.

## 10. Notifications & Background Jobs
Function: Schedule license expiry reminders
- Purpose: Send email reminders for expiring licenses.
- Inputs: `driverId`, `licenseExpiryDate` (system scheduled), reminder offsets.
- Outputs: Scheduled job entries; email delivery logs.
- Auth/Permissions: System / background worker.

Function: Asynchronous report recalculation
- Purpose: Recompute heavy aggregates (ROI, long-range utilization) in background and cache results.

## 11. Error Handling & Idempotency
- Validation errors return `400` with details of failed fields.
- Authorization failures return `403`.
- Not found returns `404`.
- Dispatch, maintenance creation, and trip completion should be idempotent where possible and use optimistic locking or DB transactions to avoid race conditions when changing vehicle/driver states.

## 12. Audit & Logging
- Important state transitions (dispatch, complete, cancel, maintenance create/close, retire) must be auditable: who performed action, timestamp, previous and new states, and reason.

## 13. Rate Limits & Security
- Apply sensible rate limits on user-facing endpoints and enforce input sanitation.

---

Keep this document synchronized with `ai-context/tech-stack.md` so implementation choices (e.g., DB transactional semantics) are reflected in the API behavior expectations.


