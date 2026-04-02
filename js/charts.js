// ─── Charts Module ─────────────────────────────────────────────────────────────
const Charts = (() => {
  let balanceChart = null;
  let categoryChart = null;
  let monthlyBarChart = null;

  function destroyAll() {
    [balanceChart, categoryChart, monthlyBarChart].forEach(c => { if(c) c.destroy(); });
    balanceChart = categoryChart = monthlyBarChart = null;
  }

  function isDark() {
    return document.documentElement.getAttribute("data-theme") === "dark";
  }

  function gridColor()   { return isDark() ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"; }
  function textColor()   { return isDark() ? "#94a3b8" : "#64748b"; }
  function tooltipBg()   { return isDark() ? "#1e293b" : "#ffffff"; }
  function tooltipBorder(){ return isDark() ? "#334155" : "#e2e8f0"; }

  const chartDefaults = () => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: textColor(), font: { family:"Inter", size:12 }, boxWidth:12, padding:16 } },
      tooltip: {
        backgroundColor: tooltipBg(),
        borderColor: tooltipBorder(),
        borderWidth: 1,
        titleColor: isDark() ? "#f1f5f9" : "#1e293b",
        bodyColor: textColor(),
        padding: 12,
        callbacks: {
          label: (ctx) => " " + FinanceData.formatCurrency(ctx.parsed.y ?? ctx.parsed)
        }
      }
    },
    animation: { duration: 700, easing: "easeInOutQuart" }
  });

  function renderBalanceChart() {
    const ctx = document.getElementById("balanceChart");
    if (!ctx) return;
    if (balanceChart) balanceChart.destroy();

    const monthly = FinanceData.getMonthlyData();
    let running = 0;
    const labels = monthly.map(m => FinanceData.getMonthLabel(m.month));
    const balances = monthly.map(m => { running += m.net; return running; });
    const incomes  = monthly.map(m => m.income);
    const expenses = monthly.map(m => m.expense);

    balanceChart = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Balance",
            data: balances,
            borderColor: "#6366f1",
            backgroundColor: "rgba(99,102,241,0.15)",
            borderWidth: 2.5,
            pointBackgroundColor: "#6366f1",
            pointRadius: 4,
            pointHoverRadius: 7,
            tension: 0.4,
            fill: true,
            order: 0,
          },
          {
            label: "Income",
            data: incomes,
            borderColor: "#10b981",
            backgroundColor: "rgba(16,185,129,0.1)",
            borderWidth: 2,
            pointRadius: 3,
            pointHoverRadius: 6,
            tension: 0.4,
            fill: false,
            borderDash: [5,4],
            order: 1,
          },
          {
            label: "Expenses",
            data: expenses,
            borderColor: "#f43f5e",
            backgroundColor: "rgba(244,63,94,0.1)",
            borderWidth: 2,
            pointRadius: 3,
            pointHoverRadius: 6,
            tension: 0.4,
            fill: false,
            borderDash: [5,4],
            order: 2,
          }
        ]
      },
      options: {
        ...chartDefaults(),
        plugins: {
          ...chartDefaults().plugins,
          tooltip: {
            ...chartDefaults().plugins.tooltip,
            callbacks: { label: (ctx) => ` ${ctx.dataset.label}: ${FinanceData.formatCurrency(ctx.parsed.y)}` }
          }
        },
        scales: {
          x: { grid:{ color: gridColor() }, ticks:{ color: textColor(), font:{family:"Inter",size:11} } },
          y: { grid:{ color: gridColor() }, ticks:{ color: textColor(), font:{family:"Inter",size:11},
                 callback: v => "₹" + (v/1000).toFixed(0) + "k" } }
        }
      }
    });
  }

  function renderCategoryChart() {
    const ctx = document.getElementById("categoryChart");
    if (!ctx) return;
    if (categoryChart) categoryChart.destroy();

    const cats = FinanceData.getCategoryBreakdown();
    const labels = cats.map(c => c.name);
    const data   = cats.map(c => c.amount);
    const colors = cats.map(c => FinanceData.CATEGORY_COLORS[c.name] || "#94a3b8");

    categoryChart = new Chart(ctx, {
      type: "doughnut",
      data: { labels, datasets: [{ data, backgroundColor: colors, borderWidth: 0, hoverOffset: 10 }] },
      options: {
        ...chartDefaults(),
        cutout: "68%",
        plugins: {
          ...chartDefaults().plugins,
          tooltip: {
            ...chartDefaults().plugins.tooltip,
            callbacks: {
              label: (ctx) => ` ${ctx.label}: ${FinanceData.formatCurrency(ctx.parsed)} (${((ctx.parsed / data.reduce((a,b)=>a+b,0))*100).toFixed(1)}%)`
            }
          }
        }
      }
    });
  }

  function renderMonthlyBarChart() {
    const ctx = document.getElementById("monthlyBarChart");
    if (!ctx) return;
    if (monthlyBarChart) monthlyBarChart.destroy();

    const monthly = FinanceData.getMonthlyData();
    const labels   = monthly.map(m => FinanceData.getMonthLabel(m.month));
    const incomes  = monthly.map(m => m.income);
    const expenses = monthly.map(m => m.expense);

    monthlyBarChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [
          { label:"Income",  data: incomes,  backgroundColor:"rgba(16,185,129,0.8)",  borderRadius:6, borderSkipped:false },
          { label:"Expenses",data: expenses, backgroundColor:"rgba(244,63,94,0.75)", borderRadius:6, borderSkipped:false }
        ]
      },
      options: {
        ...chartDefaults(),
        plugins: {
          ...chartDefaults().plugins,
          tooltip: {
            ...chartDefaults().plugins.tooltip,
            callbacks: { label: (ctx) => ` ${ctx.dataset.label}: ${FinanceData.formatCurrency(ctx.parsed.y)}` }
          }
        },
        scales: {
          x: { grid:{display:false}, ticks:{ color: textColor(), font:{family:"Inter",size:11} } },
          y: { grid:{ color: gridColor() }, ticks:{ color: textColor(), font:{family:"Inter",size:11},
                 callback: v => "₹" + (v/1000).toFixed(0) + "k" } }
        }
      }
    });
  }

  function renderAll() {
    renderBalanceChart();
    renderCategoryChart();
    renderMonthlyBarChart();
  }

  return { renderAll, renderBalanceChart, renderCategoryChart, renderMonthlyBarChart, destroyAll };
})();

window.Charts = Charts;
