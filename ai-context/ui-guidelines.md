# UI Guidelines

Design system fundamentals:
- Use Tailwind CSS utility classes and `shadcn/ui` primitives for consistent components.
- Provide light and dark color modes; persist choice in user preferences.
- Use a small set of design tokens (colors, spacing, radius, fonts) and expose them in a single theme file.

Accessibility:
- All interactive controls must have accessible labels.
- Keyboard navigation and focus states required for forms, tables, and dialogs.
- Contrast must meet WCAG AA for primary text.

Layout & Responsiveness:
- Desktop-first dashboard with responsive stacks for mobile.
- Tables for lists with responsive columns and stacked cards on small screens.

Forms & Validation:
- Use `react-hook-form` with schema validation (`zod`).
- Show inline validation messages and summarize form errors on submit.

Charts & Tables:
- Keep charts simple: KPI sparkline + summary values.
- Allow CSV export for table data.
