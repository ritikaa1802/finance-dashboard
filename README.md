# FinanceIQ Dashboard

This is a polished frontend-only finance dashboard built with plain HTML/CSS/JavaScript and Chart.js.

## Features
- Dashboard overview with summary cards: Total Balance, Income, Expenses, Savings Rate.
- Time-based visualization: balance trend line chart and monthly income/expense bar chart.
- Categorical visualization: spending breakdown donut chart.
- Transactions page with search, type/category filters, date range filtering, sorting, pagination.
- Role-based UI:
  - Viewer: read-only
  - Admin: add/edit/delete transactions and edit budgets
- Insights page with highest spending category, month-over-month comparison, savings rate, best month, and breakdown.
- Budget tracker page with monthly budget status and editing in admin mode.
- State management with localStorage persistence (`financeApp`, `financeTransactions`, `financeBudgets`).
- Dark/light theme toggle and responsive layout.
- Export functionality: CSV and JSON.
- Empty-state handling and toast notifications.

## Setup
1. Open `index.html` in a browser.
2. No backend required.

## Notes
- Existing data persists via localStorage.
- Reset button clears data and reloads defaults.
- Keyboard shortcuts: D, T, I, B, A (admin), ?, Esc.

## Files
- `index.html` - UI shell and structure.
- `css/styles.css` - responsive styling and themes.
- `js/data.js` - state and transaction/budget computations.
- `js/charts.js` - Chart.js rendering.
- `js/transactions.js` - transaction list UI and logic.
- `js/budgets.js` - budgets UI and logic.
- `js/app.js` - routing, role handling, rendering orchestration.
