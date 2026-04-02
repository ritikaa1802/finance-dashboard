// ─── Budgets Module ─────────────────────────────────────────────────────────
const Budgets = (() => {

  const DEFAULT_BUDGETS = [
    { category: "Housing",       limit: 25000 },
    { category: "Food",          limit: 8000  },
    { category: "Transport",     limit: 4000  },
    { category: "Entertainment", limit: 3000  },
    { category: "Utilities",     limit: 3000  },
    { category: "Health",        limit: 5000  },
    { category: "Shopping",      limit: 10000 },
    { category: "Education",     limit: 5000  },
  ];

  function getBudgets() {
    try {
      const saved = localStorage.getItem("financeBudgets");
      return saved ? JSON.parse(saved) : [...DEFAULT_BUDGETS];
    } catch {
      return [...DEFAULT_BUDGETS];
    }
  }

  function saveBudgets(budgets) {
    localStorage.setItem("financeBudgets", JSON.stringify(budgets));
  }

  function getSpentThisMonth() {
    const now = new Date();
    const key = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const txs = FinanceData.getTransactions().filter(
      t => t.type === "expense" && t.date.startsWith(key)
    );
    const spent = {};
    txs.forEach(t => {
      spent[t.category] = (spent[t.category] || 0) + t.amount;
    });
    return spent;
  }

  // Fallback: use latest month in data if current month has no data
  function getSpentLatestMonth() {
    const monthly = FinanceData.getMonthlyData();
    if (!monthly.length) return {};
    const latestKey = monthly[monthly.length - 1].month;
    const txs = FinanceData.getTransactions().filter(
      t => t.type === "expense" && t.date.startsWith(latestKey)
    );
    const spent = {};
    txs.forEach(t => {
      spent[t.category] = (spent[t.category] || 0) + t.amount;
    });
    return spent;
  }

  function render(role) {
    const container = document.getElementById("budgetsContent");
    if (!container) return;

    const budgets = getBudgets();
    const spent = Object.keys(getSpentThisMonth()).length
      ? getSpentThisMonth()
      : getSpentLatestMonth();

    const totalBudget = budgets.reduce((s, b) => s + b.limit, 0);
    const totalSpent  = budgets.reduce((s, b) => s + (spent[b.category] || 0), 0);
    const overBudget  = budgets.filter(b => (spent[b.category] || 0) > b.limit).length;
    const onTrack     = budgets.length - overBudget;

    container.innerHTML = `
      <div class="budget-overview">
        <div class="budget-stat-card">
          <div class="bstat-label">Total Budget</div>
          <div class="bstat-value blue">${FinanceData.formatCurrency(totalBudget)}</div>
          <div class="bstat-sub">Monthly limit set</div>
        </div>
        <div class="budget-stat-card">
          <div class="bstat-label">Total Spent</div>
          <div class="bstat-value ${totalSpent > totalBudget ? 'red' : 'green'}">${FinanceData.formatCurrency(totalSpent)}</div>
          <div class="bstat-sub">${((totalSpent / totalBudget) * 100).toFixed(1)}% of budget used</div>
        </div>
        <div class="budget-stat-card">
          <div class="bstat-label">Remaining</div>
          <div class="bstat-value ${totalBudget - totalSpent >= 0 ? 'green' : 'red'}">${FinanceData.formatCurrency(Math.abs(totalBudget - totalSpent))}</div>
          <div class="bstat-sub">${totalBudget - totalSpent >= 0 ? 'Left to spend' : 'Over budget'}</div>
        </div>
        <div class="budget-stat-card">
          <div class="bstat-label">Categories On Track</div>
          <div class="bstat-value ${overBudget === 0 ? 'green' : 'orange'}">${onTrack} / ${budgets.length}</div>
          <div class="bstat-sub">${overBudget} over limit</div>
        </div>
      </div>

      <div class="budget-list-header">
        <h3 class="section-subtitle" style="margin:0">Category Budgets</h3>
        ${role === "admin" ? `<button class="btn-secondary" id="editBudgetsBtn">⚙️ Edit Budgets</button>` : ""}
      </div>

      <div class="budget-list">
        ${budgets.map(b => renderBudgetRow(b, spent[b.category] || 0)).join("")}
      </div>

      <div id="budgetEditPanel" style="display:none">
        <h3 class="section-subtitle">Edit Monthly Limits</h3>
        <div class="budget-edit-grid">
          ${budgets.map(b => `
            <div class="budget-edit-item">
              <label class="form-label">${FinanceData.CATEGORY_ICONS[b.category] || "📌"} ${b.category}</label>
              <input class="form-input budget-limit-input" type="number" data-cat="${b.category}" value="${b.limit}" min="0" step="500" />
            </div>
          `).join("")}
        </div>
        <div class="budget-edit-actions">
          <button class="btn-secondary" id="cancelBudgetEdit">Cancel</button>
          <button class="btn-primary" id="saveBudgetLimits">💾 Save Limits</button>
        </div>
      </div>`;

    bindBudgetEvents(role);
  }

  function renderBudgetRow(budget, spent) {
    const pct = Math.min((spent / budget.limit) * 100, 100);
    const over = spent > budget.limit;
    const icon = FinanceData.CATEGORY_ICONS[budget.category] || "📌";
    const color = FinanceData.CATEGORY_COLORS[budget.category] || "#94a3b8";
    const remaining = budget.limit - spent;

    let barClass = "bar-safe";
    if (pct >= 100) barClass = "bar-over";
    else if (pct >= 75) barClass = "bar-warn";

    return `
      <div class="budget-row">
        <div class="budget-row-top">
          <div class="budget-cat-info">
            <span class="cat-icon sm" style="background:${color}22;color:${color}">${icon}</span>
            <div>
              <div class="budget-cat-name">${budget.category}</div>
              <div class="budget-cat-sub">${FinanceData.formatCurrency(spent)} of ${FinanceData.formatCurrency(budget.limit)}</div>
            </div>
          </div>
          <div class="budget-row-right">
            ${over
              ? `<span class="budget-status over">▲ ${FinanceData.formatCurrency(Math.abs(remaining))} over</span>`
              : `<span class="budget-status safe">✓ ${FinanceData.formatCurrency(remaining)} left</span>`
            }
            <span class="budget-pct ${over ? 'over' : pct >= 75 ? 'warn' : ''}">${pct.toFixed(0)}%</span>
          </div>
        </div>
        <div class="budget-bar-track">
          <div class="budget-bar ${barClass}" style="width:${pct}%;background:${color}"></div>
        </div>
      </div>`;
  }

  function bindBudgetEvents(role) {
    if (role !== "admin") return;

    const editBtn = document.getElementById("editBudgetsBtn");
    const editPanel = document.getElementById("budgetEditPanel");
    const cancelBtn = document.getElementById("cancelBudgetEdit");
    const saveBtn  = document.getElementById("saveBudgetLimits");

    if (editBtn) editBtn.addEventListener("click", () => {
      editPanel.style.display = "block";
      editPanel.scrollIntoView({ behavior: "smooth" });
    });

    if (cancelBtn) cancelBtn.addEventListener("click", () => {
      editPanel.style.display = "none";
    });

    if (saveBtn) saveBtn.addEventListener("click", () => {
      const budgets = getBudgets();
      document.querySelectorAll(".budget-limit-input").forEach(input => {
        const cat = input.dataset.cat;
        const val = parseFloat(input.value);
        if (!isNaN(val) && val >= 0) {
          const b = budgets.find(b => b.category === cat);
          if (b) b.limit = val;
        }
      });
      saveBudgets(budgets);
      Transactions.showToast("Budget limits saved!");
      render(role);
    });
  }

  return { render, getBudgets, getSpentThisMonth };
})();

window.Budgets = Budgets;
