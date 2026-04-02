# FinanceIQ Dashboard 💰

A modern finance dashboard to track and analyze personal finances with clarity.

A clean and interactive **Finance Dashboard UI** built using **HTML, CSS, and Vanilla JavaScript**.  
This project demonstrates strong frontend fundamentals, intuitive UI design, and structured state management without relying on frameworks or backend services.

---

## 🚀 Live Demo

https://finance-iq-dashboard.netlify.app

---

## Overview

This project simulates a personal finance dashboard that allows users to:

- View financial summaries
- Explore transactions
- Understand spending patterns
- Analyze insights

The implementation is fully frontend-based using mock data and localStorage for persistence.

---

## Approach

The application is designed with a focus on:

- Clarity and usability through a simple, readable UI
- Modular structure with separation of concerns
- Scalable logic using reusable functions
- Realistic data interaction (filtering, sorting, insights)

---

## Features

### Dashboard Overview
- Total Balance, Income, Expenses, Savings Rate
- Balance trend (line chart)
- Monthly income vs expenses (bar chart)
- Spending breakdown (donut chart)

### Transactions
- List with date, amount, category, and type
- Search functionality
- Filter by type and category
- Date range filtering
- Sorting and pagination
- Add, edit, delete (Admin only)

### Role-Based UI
- Viewer: read-only access
- Admin: full access (add/edit/delete transactions and budgets)
- Implemented using frontend conditional rendering

### Insights
- Highest spending category
- Month-over-month comparison
- Best month based on savings
- Spending distribution analysis

### Budget Tracker
- Category-wise budgets
- Visual progress tracking
- Editable in admin mode

---

## ⚙️ Tech Stack

- HTML5
- CSS3 (Responsive design and theming)
- Vanilla JavaScript
- Chart.js

---

## State Management

- Managed using modular JavaScript files
- Data persisted using browser localStorage

Keys used:
- `financeApp`
- `financeTransactions`
- `financeBudgets`

---

## UI / UX Considerations

- Clean and readable layout
- Responsive across devices
- Dark and light mode support
- Toast notifications for feedback
- Graceful empty state handling

---

## Additional Features

- Theme toggle (dark/light)
- CSV and JSON export
- Keyboard shortcuts
- Reset functionality for demo data

---

## Usage

1. Open index.html in your browser
2. Switch role in sidebar:
   - `Viewer` (read-only)
   - `Admin` (edit/add/delete + budget controls)
3. Interact with:
   - dashboard cards and charts
   - transaction filters, sort, search
   - insights and budget pages
4. Use toolbar:
   - `Reset Data` to restore defaults
   - `Export CSV/JSON`
   - `?` to show shortcuts

---

## Project Structure

- index.html – Main layout  
- css/styles.css – Styling  
- js/data.js – Data logic  
- js/charts.js – Charts  
- js/transactions.js – Transactions logic  
- js/budgets.js – Budgets logic  
- js/app.js – App control and routing  

---

## Design Decisions

- Vanilla JavaScript used to demonstrate core frontend skills
- Modular structure for scalability and clarity
- Frontend role simulation to match assignment scope
- localStorage used to simulate persistence

---

## Future Enhancements

- Add test automation (unit + integration)
- Add real API switching for backend integration
- Add user authentication and persisted credentials
- Add drag-and-drop budget categories
- Add CSV upload/integration
- Add mobile drawer behavior improvements for small screens

---

## Conclusion

This project demonstrates the ability to build a complete, interactive, and responsive finance dashboard with strong frontend fundamentals and clean architecture.