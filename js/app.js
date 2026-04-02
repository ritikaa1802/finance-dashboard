// ─── App Module ─────────────────────────────────────────────────────────────────
const App = (() => {
  const pages = ["dashboard", "transactions", "insights", "budgets"];

  function init() {
    FinanceData.initTransactions();
    applyTheme(FinanceData.getState().theme);
    renderNav();
    renderSummaryCards();
    renderDashboard();
    renderInsights();
    Budgets.render(FinanceData.getState().role);
    Transactions.initFilters();
    Transactions.render(FinanceData.getState().role);
    bindGlobalEvents();
    bindKeyboardShortcuts();
    navigateTo(FinanceData.getState().activePage || "dashboard");
    animateCounters();
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    const btn = document.getElementById("themeToggle");
    if (btn) btn.textContent = theme === "dark" ? "☀️" : "🌙";
  }

  function renderNav() {
    const role = FinanceData.getState().role;
    // Role badge
    const badge = document.getElementById("roleBadge");
    if (badge) {
      badge.textContent = role === "admin" ? "Admin" : "Viewer";
      badge.className = "role-badge " + role;
    }
    // Add tx button visibility
    const addBtn = document.getElementById("addTxBtn");
    if (addBtn) addBtn.style.display = role === "admin" ? "flex" : "none";
  }

  function renderSummaryCards() {
    const { income, expense, balance } = FinanceData.getSummary();
    const months = FinanceData.getMonthlyData();
    const lastMonth = months[months.length - 1];

    setCardValue("totalBalance", balance, true);
    setCardValue("totalIncome", income);
    setCardValue("totalExpense", expense);

    // Trend indicators
    if (months.length >= 2) {
      const prev = months[months.length - 2];
      const curr = lastMonth;
      setTrend("incomeTrend",  curr.income,  prev.income);
      setTrend("expenseTrend", curr.expense, prev.expense, true);
    }

    // Savings rate
    const savRate = income > 0 ? ((balance / income) * 100).toFixed(1) : 0;
    const el = document.getElementById("savingsRate");
    if (el) el.textContent = savRate + "%";
  }

  function setCardValue(id, value, signed = false) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = FinanceData.formatCurrency(value);
    el.dataset.value = value;
  }

  function setTrend(id, curr, prev, inverse = false) {
    const el = document.getElementById(id);
    if (!el) return;
    const pct = prev !== 0 ? ((curr - prev) / prev * 100).toFixed(1) : 0;
    const up = pct > 0;
    const good = inverse ? !up : up;
    el.innerHTML = `<span class="${good?"trend-up":"trend-down"}">${up?"▲":"▼"} ${Math.abs(pct)}%</span> vs last month`;
  }

  function animateCounters() {
    document.querySelectorAll("[data-value]").forEach(el => {
      const target = parseFloat(el.dataset.value);
      if (isNaN(target)) return;
      let start = null;
      const duration = 900;
      const step = (ts) => {
        if (!start) start = ts;
        const progress = Math.min((ts - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = target * eased;
        el.textContent = FinanceData.formatCurrency(current);
        if (progress < 1) requestAnimationFrame(step);
        else el.textContent = FinanceData.formatCurrency(target);
      };
      requestAnimationFrame(step);
    });
  }

  function renderDashboard() {
    renderRecentTransactions();
    setTimeout(() => {
      Charts.renderAll();
    }, 100);
  }

  function renderRecentTransactions() {
    const container = document.getElementById("recentTxList");
    if (!container) return;
    const txs = FinanceData.getTransactions()
      .slice().sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
    container.innerHTML = txs.map(tx => {
      const icon  = FinanceData.CATEGORY_ICONS[tx.category] || "📌";
      const color = FinanceData.CATEGORY_COLORS[tx.category] || "#94a3b8";
      const sign  = tx.type === "income" ? "+" : "-";
      const cls   = tx.type === "income" ? "amount-income" : "amount-expense";
      return `
        <div class="recent-tx-row">
          <span class="cat-icon sm" style="background:${color}22;color:${color}">${icon}</span>
          <div class="recent-tx-info">
            <div class="recent-tx-desc">${tx.description}</div>
            <div class="recent-tx-date">${FinanceData.formatDate(tx.date)}</div>
          </div>
          <div class="recent-tx-amount ${cls}">${sign} ${FinanceData.formatCurrency(tx.amount)}</div>
        </div>`;
    }).join("");
  }

  function renderInsights() {
    const { topCat, momChange, savingsRate, bestMonth, monthly, cats } = FinanceData.getInsights();
    const container = document.getElementById("insightsContent");
    if (!container) return;

    const totalExpense = cats.reduce((s,c) => s + c.amount, 0);

    container.innerHTML = `
      <div class="insights-grid">
        ${insightCard("🏆", "Top Spending Category",
          topCat ? `${FinanceData.CATEGORY_ICONS[topCat.name]||"📌"} ${topCat.name}` : "N/A",
          topCat ? `${FinanceData.formatCurrency(topCat.amount)} total spent` : "",
          "purple"
        )}
        ${insightCard(momChange > 0 ? "📈" : "📉", "Month-over-Month Expenses",
          `${momChange > 0 ? "+" : ""}${momChange}%`,
          momChange > 0 ? "Spending increased vs last month" : "Spending decreased vs last month",
          momChange > 0 ? "red" : "green"
        )}
        ${insightCard("💹", "Average Savings Rate",
          `${savingsRate}%`,
          "Of monthly income saved on average",
          parseFloat(savingsRate) >= 20 ? "green" : "orange"
        )}
        ${insightCard("⭐", "Best Month",
          bestMonth ? FinanceData.getMonthLabel(bestMonth.month) : "N/A",
          bestMonth ? `Net savings: ${FinanceData.formatCurrency(bestMonth.net)}` : "",
          "blue"
        )}
      </div>

      <div class="insights-breakdown">
        <h3 class="section-subtitle">Spending Breakdown</h3>
        <div class="breakdown-list">
          ${cats.map(c => {
            const pct = totalExpense > 0 ? ((c.amount / totalExpense) * 100).toFixed(1) : 0;
            const color = FinanceData.CATEGORY_COLORS[c.name] || "#94a3b8";
            return `
              <div class="breakdown-item">
                <div class="breakdown-left">
                  <span class="cat-icon sm" style="background:${color}22;color:${color}">${FinanceData.CATEGORY_ICONS[c.name]||"📌"}</span>
                  <span class="breakdown-name">${c.name}</span>
                </div>
                <div class="breakdown-right">
                  <div class="breakdown-bar-wrap">
                    <div class="breakdown-bar" style="width:${pct}%;background:${color}"></div>
                  </div>
                  <span class="breakdown-pct">${pct}%</span>
                  <span class="breakdown-amt">${FinanceData.formatCurrency(c.amount)}</span>
                </div>
              </div>`;
          }).join("")}
        </div>
      </div>

      <div class="monthly-summary-table">
        <h3 class="section-subtitle">Monthly Summary</h3>
        <div class="table-wrap">
        <table class="summary-table">
          <thead><tr><th>Month</th><th>Income</th><th>Expenses</th><th>Net Savings</th><th>Rate</th></tr></thead>
          <tbody>
            ${monthly.map(m => {
              const rate = m.income > 0 ? ((m.net/m.income)*100).toFixed(1) : "0.0";
              const netClass = m.net >= 0 ? "amount-income" : "amount-expense";
              return `<tr>
                <td>${FinanceData.getMonthLabel(m.month)}</td>
                <td class="amount-income">${FinanceData.formatCurrency(m.income)}</td>
                <td class="amount-expense">${FinanceData.formatCurrency(m.expense)}</td>
                <td class="${netClass}">${m.net >= 0 ? "+" : ""}${FinanceData.formatCurrency(m.net)}</td>
                <td><span class="rate-badge ${parseFloat(rate)>=20?"good":"bad"}">${rate}%</span></td>
              </tr>`;
            }).join("")}
          </tbody>
        </table>
        </div>
      </div>`;
  }

  function insightCard(emoji, title, value, subtitle, accent) {
    return `
      <div class="insight-card accent-${accent}">
        <div class="insight-emoji">${emoji}</div>
        <div class="insight-title">${title}</div>
        <div class="insight-value">${value}</div>
        <div class="insight-subtitle">${subtitle}</div>
      </div>`;
  }

  function navigateTo(page) {
    if (!pages.includes(page)) page = "dashboard";
    FinanceData.setState({ activePage: page });

    pages.forEach(p => {
      const section = document.getElementById("page-" + p);
      const link = document.querySelector(`.nav-link[data-page="${p}"]`);
      if (section) section.classList.toggle("active", p === page);
      if (link) link.classList.toggle("active", p === page);
    });

    // Lazy re-render per page
    if (page === "dashboard") {
      renderRecentTransactions();
      setTimeout(() => Charts.renderAll(), 50);
      animateCounters();
    } else if (page === "insights") {
      renderInsights();
    } else if (page === "budgets") {
      Budgets.render(FinanceData.getState().role);
      setTimeout(animateBudgetBars, 50);
    }
  }

  function animateBudgetBars() {
    document.querySelectorAll(".budget-bar").forEach(bar => {
      const target = bar.style.width;
      bar.style.width = "0%";
      requestAnimationFrame(() => {
        setTimeout(() => { bar.style.width = target; }, 30);
      });
    });
  }

  function refreshAll() {
    renderSummaryCards();
    animateCounters();
    renderDashboard();
    renderInsights();
    Budgets.render(FinanceData.getState().role);
    Transactions.render(FinanceData.getState().role);
  }

  function bindGlobalEvents() {
    // Navigation
    document.querySelectorAll(".nav-link").forEach(link => {
      link.addEventListener("click", () => navigateTo(link.dataset.page));
    });

    // Theme toggle
    const themeBtn = document.getElementById("themeToggle");
    if (themeBtn) {
      themeBtn.addEventListener("click", () => {
        const newTheme = FinanceData.getState().theme === "dark" ? "light" : "dark";
        FinanceData.setState({ theme: newTheme });
        applyTheme(newTheme);
        setTimeout(() => Charts.renderAll(), 100);
      });
    }

    // Role switcher
    const roleSelect = document.getElementById("roleSelect");
    if (roleSelect) {
      roleSelect.value = FinanceData.getState().role;
      roleSelect.addEventListener("change", () => {
        FinanceData.setState({ role: roleSelect.value });
        renderNav();
        Transactions.render(roleSelect.value);
        Budgets.render(roleSelect.value);
        Transactions.showToast(`Switched to ${roleSelect.value} mode`);
      });
    }

    // Reset data button
    const resetBtn = document.getElementById("resetDataBtn");
    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        if (window.confirm("Reset all data to defaults? This cannot be undone.")) {
          localStorage.removeItem("financeTransactions");
          localStorage.removeItem("financeBudgets");
          FinanceData.initTransactions();
          refreshAll();
          Transactions.showToast("Data reset to defaults.", "warning");
        }
      });
    }

    // Mobile nav toggle
    const menuBtn = document.getElementById("menuToggle");
    const sidebar = document.getElementById("sidebar");
    if (menuBtn && sidebar) {
      menuBtn.addEventListener("click", () => sidebar.classList.toggle("open"));
      document.addEventListener("click", (e) => {
        if (!sidebar.contains(e.target) && !menuBtn.contains(e.target)) {
          sidebar.classList.remove("open");
        }
      });
    }
  }

  function bindKeyboardShortcuts() {
    document.addEventListener("keydown", (e) => {
      // Don't fire when typing in an input
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || e.target.tagName === "SELECT") return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      switch (e.key.toLowerCase()) {
        case "d": navigateTo("dashboard");    break;
        case "t": navigateTo("transactions"); break;
        case "i": navigateTo("insights");    break;
        case "b": navigateTo("budgets");     break;
        case "a":
          if (FinanceData.getState().role === "admin") Transactions.openAddModal();
          break;
        case "?": showKeyboardHelp(); break;
        case "escape": hideKeyboardHelp(); break;
      }
    });
  }

  function showKeyboardHelp() {
    const el = document.getElementById("keyboardHelp");
    if (el) el.classList.add("open");
  }

  function hideKeyboardHelp() {
    const el = document.getElementById("keyboardHelp");
    if (el) el.classList.remove("open");
    const modal = document.getElementById("txModal");
    if (modal) modal.classList.remove("open");
  }

  return { init, refreshAll, navigateTo };
})();

window.App = App;
document.addEventListener("DOMContentLoaded", App.init);
