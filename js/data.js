// ─── State ────────────────────────────────────────────────────────────────────
const DEFAULT_STATE = {
  role: "viewer",
  theme: "dark",
  filters: { type: "all", category: "all", search: "", dateFrom: "", dateTo: "" },
  sort: { field: "date", dir: "desc" },
  activePage: "dashboard",
};

let state = loadState();

function loadState() {
  try {
    const saved = localStorage.getItem("financeApp");
    return saved ? { ...DEFAULT_STATE, ...JSON.parse(saved) } : { ...DEFAULT_STATE };
  } catch {
    return { ...DEFAULT_STATE };
  }
}

function saveState() {
  try {
    localStorage.setItem("financeApp", JSON.stringify({
      role: state.role,
      theme: state.theme,
      transactions: state.transactions,
    }));
  } catch {}
}

function getState() { return state; }

function setState(updates) {
  state = { ...state, ...updates };
  saveState();
}

// ─── Mock Transactions ────────────────────────────────────────────────────────
const DEFAULT_TRANSACTIONS = [
  // January
  { id: 1,  date: "2025-01-03", description: "Salary",              category: "Income",        type: "income",  amount: 85000 },
  { id: 2,  date: "2025-01-05", description: "Apartment Rent",      category: "Housing",       type: "expense", amount: 22000 },
  { id: 3,  date: "2025-01-07", description: "Groceries",           category: "Food",          type: "expense", amount: 4200  },
  { id: 4,  date: "2025-01-10", description: "Netflix",             category: "Entertainment", type: "expense", amount: 649   },
  { id: 5,  date: "2025-01-12", description: "Uber Ride",           category: "Transport",     type: "expense", amount: 380   },
  { id: 6,  date: "2025-01-14", description: "Freelance Project",   category: "Income",        type: "income",  amount: 15000 },
  { id: 7,  date: "2025-01-18", description: "Electricity Bill",    category: "Utilities",     type: "expense", amount: 1800  },
  { id: 8,  date: "2025-01-20", description: "Restaurant Dinner",   category: "Food",          type: "expense", amount: 2100  },
  { id: 9,  date: "2025-01-22", description: "Gym Membership",      category: "Health",        type: "expense", amount: 1500  },
  { id: 10, date: "2025-01-25", description: "Amazon Purchase",     category: "Shopping",      type: "expense", amount: 3200  },
  { id: 11, date: "2025-01-28", description: "Internet Bill",       category: "Utilities",     type: "expense", amount: 999   },
  // February
  { id: 12, date: "2025-02-03", description: "Salary",              category: "Income",        type: "income",  amount: 85000 },
  { id: 13, date: "2025-02-05", description: "Apartment Rent",      category: "Housing",       type: "expense", amount: 22000 },
  { id: 14, date: "2025-02-08", description: "Groceries",           category: "Food",          type: "expense", amount: 3800  },
  { id: 15, date: "2025-02-11", description: "Concert Tickets",     category: "Entertainment", type: "expense", amount: 3500  },
  { id: 16, date: "2025-02-13", description: "Metro Pass",          category: "Transport",     type: "expense", amount: 450   },
  { id: 17, date: "2025-02-15", description: "Consulting Income",   category: "Income",        type: "income",  amount: 20000 },
  { id: 18, date: "2025-02-18", description: "Water Bill",          category: "Utilities",     type: "expense", amount: 600   },
  { id: 19, date: "2025-02-20", description: "Doctor Visit",        category: "Health",        type: "expense", amount: 2500  },
  { id: 20, date: "2025-02-22", description: "Coffee Shop",         category: "Food",          type: "expense", amount: 890   },
  { id: 21, date: "2025-02-25", description: "Online Course",       category: "Education",     type: "expense", amount: 4999  },
  { id: 22, date: "2025-02-27", description: "Clothing",            category: "Shopping",      type: "expense", amount: 5600  },
  // March
  { id: 23, date: "2025-03-03", description: "Salary",              category: "Income",        type: "income",  amount: 85000 },
  { id: 24, date: "2025-03-05", description: "Apartment Rent",      category: "Housing",       type: "expense", amount: 22000 },
  { id: 25, date: "2025-03-07", description: "Groceries",           category: "Food",          type: "expense", amount: 4500  },
  { id: 26, date: "2025-03-10", description: "Spotify",             category: "Entertainment", type: "expense", amount: 199   },
  { id: 27, date: "2025-03-12", description: "Flight Tickets",      category: "Transport",     type: "expense", amount: 8500  },
  { id: 28, date: "2025-03-14", description: "Side Project Sale",   category: "Income",        type: "income",  amount: 12000 },
  { id: 29, date: "2025-03-17", description: "Gas Bill",            category: "Utilities",     type: "expense", amount: 1200  },
  { id: 30, date: "2025-03-20", description: "Pharmacy",            category: "Health",        type: "expense", amount: 750   },
  { id: 31, date: "2025-03-22", description: "Books",               category: "Education",     type: "expense", amount: 1800  },
  { id: 32, date: "2025-03-24", description: "Electronics",         category: "Shopping",      type: "expense", amount: 12000 },
  { id: 33, date: "2025-03-27", description: "Restaurant",          category: "Food",          type: "expense", amount: 1800  },
  // April
  { id: 34, date: "2025-04-03", description: "Salary",              category: "Income",        type: "income",  amount: 90000 },
  { id: 35, date: "2025-04-05", description: "Apartment Rent",      category: "Housing",       type: "expense", amount: 22000 },
  { id: 36, date: "2025-04-08", description: "Groceries",           category: "Food",          type: "expense", amount: 3900  },
  { id: 37, date: "2025-04-11", description: "Movie Tickets",       category: "Entertainment", type: "expense", amount: 900   },
  { id: 38, date: "2025-04-13", description: "Cab Rides",           category: "Transport",     type: "expense", amount: 1200  },
  { id: 39, date: "2025-04-15", description: "Bonus",               category: "Income",        type: "income",  amount: 25000 },
  { id: 40, date: "2025-04-18", description: "Electricity Bill",    category: "Utilities",     type: "expense", amount: 2100  },
  { id: 41, date: "2025-04-21", description: "Gym Membership",      category: "Health",        type: "expense", amount: 1500  },
  { id: 42, date: "2025-04-24", description: "Flipkart Order",      category: "Shopping",      type: "expense", amount: 7800  },
  { id: 43, date: "2025-04-27", description: "Street Food",         category: "Food",          type: "expense", amount: 600   },
  // May
  { id: 44, date: "2025-05-03", description: "Salary",              category: "Income",        type: "income",  amount: 90000 },
  { id: 45, date: "2025-05-05", description: "Apartment Rent",      category: "Housing",       type: "expense", amount: 22000 },
  { id: 46, date: "2025-05-08", description: "Groceries",           category: "Food",          type: "expense", amount: 4100  },
  { id: 47, date: "2025-05-10", description: "Prime Video",         category: "Entertainment", type: "expense", amount: 1499  },
  { id: 48, date: "2025-05-13", description: "Train Tickets",       category: "Transport",     type: "expense", amount: 3200  },
  { id: 49, date: "2025-05-15", description: "Investment Returns",  category: "Income",        type: "income",  amount: 8000  },
  { id: 50, date: "2025-05-18", description: "Internet Bill",       category: "Utilities",     type: "expense", amount: 999   },
  { id: 51, date: "2025-05-21", description: "Dental Checkup",      category: "Health",        type: "expense", amount: 3000  },
  { id: 52, date: "2025-05-24", description: "Clothes Shopping",    category: "Shopping",      type: "expense", amount: 6200  },
  { id: 53, date: "2025-05-27", description: "Zomato Orders",       category: "Food",          type: "expense", amount: 2200  },
  // June
  { id: 54, date: "2025-06-03", description: "Salary",              category: "Income",        type: "income",  amount: 90000 },
  { id: 55, date: "2025-06-05", description: "Apartment Rent",      category: "Housing",       type: "expense", amount: 22000 },
  { id: 56, date: "2025-06-07", description: "Groceries",           category: "Food",          type: "expense", amount: 4300  },
  { id: 57, date: "2025-06-10", description: "Gaming Subscription", category: "Entertainment", type: "expense", amount: 2999  },
  { id: 58, date: "2025-06-13", description: "Auto Rickshaw",       category: "Transport",     type: "expense", amount: 240   },
  { id: 59, date: "2025-06-15", description: "Freelance Design",    category: "Income",        type: "income",  amount: 18000 },
  { id: 60, date: "2025-06-18", description: "Water Bill",          category: "Utilities",     type: "expense", amount: 700   },
  { id: 61, date: "2025-06-20", description: "Health Supplements",  category: "Health",        type: "expense", amount: 2200  },
  { id: 62, date: "2025-06-22", description: "Online Course",       category: "Education",     type: "expense", amount: 7999  },
  { id: 63, date: "2025-06-25", description: "Electronics",         category: "Shopping",      type: "expense", amount: 9500  },
  { id: 64, date: "2025-06-28", description: "Restaurant",          category: "Food",          type: "expense", amount: 3100  },
];

function initTransactions() {
  const saved = localStorage.getItem("financeTransactions");
  if (saved) {
    try { state.transactions = JSON.parse(saved); return; } catch {}
  }
  state.transactions = [...DEFAULT_TRANSACTIONS];
  localStorage.setItem("financeTransactions", JSON.stringify(state.transactions));
}

function getTransactions() { return state.transactions || []; }

function addTransaction(tx) {
  const id = Date.now();
  state.transactions = [{ ...tx, id }, ...state.transactions];
  localStorage.setItem("financeTransactions", JSON.stringify(state.transactions));
}

function updateTransaction(id, data) {
  state.transactions = state.transactions.map(t => t.id === id ? { ...t, ...data } : t);
  localStorage.setItem("financeTransactions", JSON.stringify(state.transactions));
}

function deleteTransaction(id) {
  state.transactions = state.transactions.filter(t => t.id !== id);
  localStorage.setItem("financeTransactions", JSON.stringify(state.transactions));
}

// ─── Computed helpers ─────────────────────────────────────────────────────────
function getSummary() {
  const txs = getTransactions();
  const income  = txs.filter(t => t.type==="income").reduce((s,t)=>s+t.amount, 0);
  const expense = txs.filter(t => t.type==="expense").reduce((s,t)=>s+t.amount, 0);
  return { income, expense, balance: income - expense };
}

function getMonthlyData() {
  const txs = getTransactions();
  const months = {};
  txs.forEach(t => {
    const key = t.date.slice(0, 7);
    if (!months[key]) months[key] = { income: 0, expense: 0 };
    months[key][t.type] += t.amount;
  });
  return Object.entries(months)
    .sort(([a],[b]) => a.localeCompare(b))
    .map(([month, data]) => ({ month, ...data, net: data.income - data.expense }));
}

function getCategoryBreakdown() {
  const txs = getTransactions().filter(t => t.type === "expense");
  const cats = {};
  txs.forEach(t => {
    cats[t.category] = (cats[t.category] || 0) + t.amount;
  });
  return Object.entries(cats).map(([name, amount]) => ({ name, amount }))
    .sort((a,b) => b.amount - a.amount);
}

function getInsights() {
  const monthly = getMonthlyData();
  const cats = getCategoryBreakdown();
  const topCat = cats[0] || null;
  const lastTwo = monthly.slice(-2);
  const momChange = lastTwo.length===2
    ? ((lastTwo[1].expense - lastTwo[0].expense) / lastTwo[0].expense * 100).toFixed(1)
    : 0;
  const savingsRate = monthly.length
    ? (monthly.reduce((s,m)=> s + (m.income>0 ? m.net/m.income : 0), 0) / monthly.length * 100).toFixed(1)
    : 0;
  const bestMonth = monthly.reduce((best,m)=> m.net > (best?.net||0) ? m : best, null);
  return { topCat, momChange, savingsRate, bestMonth, monthly, cats };
}

function formatCurrency(n) {
  return "₹" + Math.abs(n).toLocaleString("en-IN");
}

function formatDate(str) {
  const d = new Date(str);
  return d.toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" });
}

function getMonthLabel(str) {
  const [y, m] = str.split("-");
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return months[parseInt(m)-1] + " " + y.slice(2);
}

const CATEGORIES = ["Income","Housing","Food","Transport","Entertainment","Utilities","Health","Shopping","Education","Other"];
const CATEGORY_ICONS = {
  "Income":"💰","Housing":"🏠","Food":"🍔","Transport":"🚗","Entertainment":"🎬",
  "Utilities":"⚡","Health":"💊","Shopping":"🛍️","Education":"📚","Other":"📌"
};
const CATEGORY_COLORS = {
  "Income":     "#6ee7b7",
  "Housing":    "#818cf8",
  "Food":       "#fb923c",
  "Transport":  "#38bdf8",
  "Entertainment":"#f472b6",
  "Utilities":  "#fbbf24",
  "Health":     "#34d399",
  "Shopping":   "#a78bfa",
  "Education":  "#60a5fa",
  "Other":      "#94a3b8",
};

window.FinanceData = {
  getState, setState, initTransactions,
  getTransactions, addTransaction, updateTransaction, deleteTransaction,
  getSummary, getMonthlyData, getCategoryBreakdown, getInsights,
  formatCurrency, formatDate, getMonthLabel,
  CATEGORIES, CATEGORY_ICONS, CATEGORY_COLORS,
};
