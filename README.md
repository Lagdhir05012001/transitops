# TransitOps Frontend

This workspace now contains a responsive React + Vite frontend prototype for TransitOps, including a fleet dashboard, dispatch board, maintenance view, and driver compliance cards.

## Quick start

- Install dependencies with npm install
- Start the app with npm run dev
- Open the local URL shown by Vite, typically http://localhost:3000

# 🚛 TransitOps – Smart Transport Operations Platform

> **Enterprise-grade Fleet & Transport Management System**  
> Build an end-to-end transport operations platform that digitizes fleet management, driver operations, trip dispatching, maintenance, fuel tracking, expenses, and business analytics.

---

# 📌 Overview

TransitOps is a centralized platform designed for logistics and transportation companies to manage the complete lifecycle of their transport operations.

Instead of relying on spreadsheets and manual records, TransitOps automates fleet management, vehicle dispatching, maintenance scheduling, fuel tracking, operational expenses, and analytics.

The platform enforces business rules automatically, reducing operational errors while improving visibility and efficiency.

---

# 🎯 Problem Statement

Many logistics companies still depend on:

- Excel sheets
- Manual logbooks
- Phone calls
- Paper maintenance records

This results in:

- Vehicle scheduling conflicts
- Underutilized fleet
- Expired driver licenses
- Duplicate vehicle assignments
- Missed maintenance
- Poor operational visibility
- Incorrect expense tracking

TransitOps solves these challenges through a modern digital platform.

---

# 👥 Target Users

## Fleet Manager

Responsible for:

- Fleet assets
- Vehicle lifecycle
- Maintenance
- Fleet utilization
- Vehicle availability

---

## Dispatcher

Responsible for:

- Creating trips
- Assigning drivers
- Assigning vehicles
- Monitoring active trips

---

## Safety Officer

Responsible for:

- Driver compliance
- License validity
- Safety scores
- Driver suspension

---

## Financial Analyst

Responsible for:

- Fuel expenses
- Maintenance costs
- Vehicle ROI
- Operational costs
- Reports & Analytics

---

# 🔐 Authentication

Features

- Secure Login
- Email & Password Authentication
- JWT Authentication
- Role Based Access Control (RBAC)
- Protected Routes

Roles

- Admin
- Fleet Manager
- Dispatcher
- Safety Officer
- Financial Analyst

---

# 📊 Dashboard

The dashboard provides real-time operational insights.

## KPIs

- Active Vehicles
- Available Vehicles
- Vehicles in Maintenance
- Retired Vehicles
- Active Trips
- Pending Trips
- Drivers On Duty
- Fleet Utilization %
- Fuel Consumption
- Operational Cost

### Filters

- Region
- Vehicle Type
- Status
- Date Range

---

# 🚚 Vehicle Management

Maintain a centralized registry of all vehicles.

## Vehicle Information

- Registration Number (Unique)
- Vehicle Name
- Vehicle Model
- Vehicle Type
- Maximum Load Capacity
- Odometer Reading
- Acquisition Cost
- Vehicle Status

## Vehicle Status

- Available
- On Trip
- In Shop
- Retired

---

# 👨‍✈️ Driver Management

Maintain driver profiles and compliance.

## Driver Information

- Full Name
- License Number
- License Category
- License Expiry Date
- Contact Number
- Safety Score
- Driver Status

## Driver Status

- Available
- On Trip
- Off Duty
- Suspended

---

# 🚛 Trip Management

Dispatch vehicles with intelligent validations.

## Trip Details

- Source
- Destination
- Assigned Vehicle
- Assigned Driver
- Cargo Weight
- Planned Distance
- Status

## Trip Lifecycle

```
Draft
   ↓
Dispatched
   ↓
Completed
```

OR

```
Draft
   ↓
Cancelled
```

---

# 🔧 Maintenance Management

Track preventive and corrective maintenance.

## Maintenance Record

- Vehicle
- Maintenance Type
- Description
- Cost
- Date
- Status

Examples

- Oil Change
- Tire Replacement
- Engine Service
- Brake Repair

---

# ⛽ Fuel Management

Maintain fuel logs.

Each fuel entry stores:

- Vehicle
- Fuel Quantity
- Fuel Cost
- Fuel Date
- Odometer

---

# 💰 Expense Management

Track transportation expenses.

Expense Types

- Fuel
- Toll
- Repairs
- Insurance
- Maintenance
- Miscellaneous

Automatic calculation:

```
Operational Cost

=

Fuel

+

Maintenance

+

Expenses
```

---

# 📈 Reports & Analytics

Generate insights using operational data.

## Reports

### Fleet Utilization

```
Active Vehicles
--------------------- × 100
Total Vehicles
```

---

### Fuel Efficiency

```
Distance Travelled
-------------------------
Fuel Consumed
```

---

### Vehicle ROI

```
Revenue

-

(Fuel + Maintenance)

-------------------------------

Acquisition Cost
```

---

### Operational Cost

Automatically calculated.

Supports:

- CSV Export
- PDF Export (Optional)

---

# ⚙️ Business Rules

## Vehicle Rules

- Registration Number must be unique.
- Retired vehicles cannot be dispatched.
- Vehicles in maintenance cannot be dispatched.
- Vehicle already on trip cannot be reassigned.

---

## Driver Rules

- Expired license → Cannot dispatch.
- Suspended driver → Cannot dispatch.
- Driver already on trip → Cannot dispatch.

---

## Cargo Rules

```
Cargo Weight

≤

Vehicle Maximum Capacity
```

Otherwise

Dispatch is rejected.

---

## Automatic Status Updates

Dispatch Trip

Vehicle

```
Available

↓

On Trip
```

Driver

```
Available

↓

On Trip
```

Complete Trip

Vehicle

```
On Trip

↓

Available
```

Driver

```
On Trip

↓

Available
```

Maintenance Started

Vehicle

```
Available

↓

In Shop
```

Maintenance Completed

Vehicle

```
In Shop

↓

Available
```

---

# 🗄 Database Entities

Core Tables

- Users
- Roles
- Vehicles
- Drivers
- Trips
- Maintenance Logs
- Fuel Logs
- Expenses

---

# 🏗 Suggested Tech Stack

## Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- ShadCN UI
- React Router
- TanStack Query
- React Hook Form
- Zod

---

## Backend

- Node.js
- Express.js
- TypeScript
- Prisma ORM

---

## Database

- PostgreSQL

---

## Authentication

- JWT
- bcrypt

---

## Charts

- Recharts

---

## Deployment

Frontend

- Vercel

Backend

- Railway / Render

Database

- Neon PostgreSQL

---

# 📂 Suggested Folder Structure

```
TransitOps/

├── client/
│
├── server/
│
├── prisma/
│
├── docs/
│
├── README.md
│
└── docker-compose.yml
```

---

# ⭐ Bonus Features

- Dark Mode
- Email reminders for license expiry
- Vehicle document upload
- Search & Filters
- Export to CSV
- Export to PDF
- Dashboard Charts
- Notifications
- Audit Logs
- Responsive Design

---

# 🚀 Future Enhancements

- GPS Vehicle Tracking
- Live Map
- Route Optimization
- Driver Mobile App
- QR Vehicle Inspection
- Fuel Card Integration
- Predictive Maintenance
- AI-powered Fleet Analytics
- IoT Vehicle Monitoring
- Multi-Tenant SaaS Support

---

# 📋 Deliverables

- ✅ Authentication with RBAC
- ✅ Dashboard
- ✅ Vehicle CRUD
- ✅ Driver CRUD
- ✅ Trip Management
- ✅ Maintenance Workflow
- ✅ Fuel & Expense Tracking
- ✅ Business Rule Validation
- ✅ Reports & Analytics
- ✅ Responsive UI

---

# 🏁 Conclusion

TransitOps modernizes fleet and transport operations by replacing manual workflows with a centralized, automated platform. It improves operational efficiency, reduces human error, ensures compliance, and provides actionable insights through analytics and intelligent business rules.

---