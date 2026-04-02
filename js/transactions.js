// ─── Transactions Module ─────────────────────────────────────────────────────
const Transactions = (() => {
  const PAGE_SIZE = 10;
  let currentPage = 1;

  function getFiltered() {
    const { filters, sort } = FinanceData.getState();
    let txs = FinanceData.getTransactions();

    if (filters.type !== "all") txs = txs.filter(t => t.type === filters.type);
    if (filters.category !== "all") txs = txs.filter(t => t.category === filters.category);
    if (filters.dateFrom) txs = txs.filter(t => t.date >= filters.dateFrom);
    if (filters.dateTo)   txs = txs.filter(t => t.date <= filters.dateTo);
    if (filters.search.trim()) {
      const q = filters.search.toLowerCase();
      txs = txs.filter(t =>
        t.description.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        t.amount.toString().includes(q)
      );
    }

    txs = [...txs].sort((a, b) => {
      let va = a[sort.field], vb = b[sort.field];
      if (sort.field === "amount" || sort.field === "date") {
        va = sort.field === "amount" ? va : new Date(va);
        vb = sort.field === "amount" ? vb : new Date(vb);
      } else {
        va = String(va).toLowerCase();
        vb = String(vb).toLowerCase();
      }
      if (va < vb) return sort.dir === "asc" ? -1 : 1;
      if (va > vb) return sort.dir === "asc" ? 1 : -1;
      return 0;
    });

    return txs;
  }

  function renderRow(tx, role) {
    const icon = FinanceData.CATEGORY_ICONS[tx.category] || "📌";
    const color = FinanceData.CATEGORY_COLORS[tx.category] || "#94a3b8";
    const sign = tx.type === "income" ? "+" : "-";
    const amtClass = tx.type === "income" ? "amount-income" : "amount-expense";
    const adminActions = role === "admin"
      ? `<div class="tx-actions">
           <button class="btn-icon btn-edit" data-id="${tx.id}" title="Edit">✏️</button>
           <button class="btn-icon btn-delete" data-id="${tx.id}" title="Delete">🗑️</button>
         </div>`
      : "";

    return `
      <tr class="tx-row" data-id="${tx.id}">
        <td>
          <div class="tx-category-cell">
            <span class="cat-icon" style="background:${color}22; color:${color}">${icon}</span>
            <div>
              <div class="tx-desc">${tx.description}</div>
              <div class="tx-cat-label">${tx.category}</div>
            </div>
          </div>
        </td>
        <td><span class="tx-date">${FinanceData.formatDate(tx.date)}</span></td>
        <td><span class="tx-type-badge ${tx.type}">${tx.type}</span></td>
        <td class="${amtClass} tx-amount">${sign} ${FinanceData.formatCurrency(tx.amount)}</td>
        ${role === "admin" ? `<td>${adminActions}</td>` : ""}
      </tr>`;
  }

  function render(role) {
    const tbody  = document.getElementById("txTableBody");
    const empty  = document.getElementById("txEmpty");
    const header = document.getElementById("txActionsHeader");
    const countEl = document.getElementById("txCount");
    if (!tbody) return;

    if (header) header.style.display = role === "admin" ? "" : "none";

    const all  = getFiltered();
    const total = all.length;
    const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    if (currentPage > pages) currentPage = pages;

    const txs  = all.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    if (countEl) countEl.textContent = `${total} transaction${total !== 1 ? "s" : ""}`;

    if (total === 0) {
      tbody.innerHTML = "";
      if (empty) empty.style.display = "flex";
      renderPagination(0, 0, 0);
      return;
    }
    if (empty) empty.style.display = "none";
    tbody.innerHTML = txs.map(t => renderRow(t, role)).join("");

    // Attach admin event listeners
    if (role === "admin") {
      tbody.querySelectorAll(".btn-edit").forEach(btn => {
        btn.addEventListener("click", () => openEditModal(parseInt(btn.dataset.id)));
      });
      tbody.querySelectorAll(".btn-delete").forEach(btn => {
        btn.addEventListener("click", () => confirmDelete(parseInt(btn.dataset.id)));
      });
    }

    renderPagination(currentPage, pages, total);
  }

  function renderPagination(page, pages, total) {
    const container = document.getElementById("txPagination");
    if (!container) return;
    if (pages <= 1) { container.innerHTML = ""; return; }
    const start = (page - 1) * PAGE_SIZE + 1;
    const end   = Math.min(page * PAGE_SIZE, total);
    container.innerHTML = `
      <div class="pagination">
        <button class="page-btn" id="pagePrev" ${page <= 1 ? "disabled" : ""}>&#8592; Prev</button>
        <span class="page-info">${start}–${end} of ${total}</span>
        <button class="page-btn" id="pageNext" ${page >= pages ? "disabled" : ""}>Next &#8594;</button>
      </div>`;
    container.querySelector("#pagePrev")?.addEventListener("click", () => { currentPage--; render(FinanceData.getState().role); });
    container.querySelector("#pageNext")?.addEventListener("click", () => { currentPage++; render(FinanceData.getState().role); });
  }

  function updateSort(field) {
    const { sort } = FinanceData.getState();
    const newDir = sort.field === field && sort.dir === "desc" ? "asc" : "desc";
    FinanceData.setState({ sort: { field, dir: newDir } });
    currentPage = 1;
    document.querySelectorAll(".sort-btn").forEach(b => {
      b.classList.toggle("active", b.dataset.sort === field);
      if (b.dataset.sort === field) b.dataset.dir = newDir;
    });
  }

  function openEditModal(id) {
    const tx = FinanceData.getTransactions().find(t => t.id === id);
    if (!tx) return;
    const modal = document.getElementById("txModal");
    document.getElementById("modalTitle").textContent = "Edit Transaction";
    document.getElementById("txId").value = tx.id;
    document.getElementById("txDate").value = tx.date;
    document.getElementById("txDescription").value = tx.description;
    document.getElementById("txCategory").value = tx.category;
    document.getElementById("txType").value = tx.type;
    document.getElementById("txAmount").value = tx.amount;
    modal.classList.add("open");
  }

  function openAddModal() {
    const modal = document.getElementById("txModal");
    document.getElementById("modalTitle").textContent = "Add Transaction";
    document.getElementById("txForm").reset();
    document.getElementById("txId").value = "";
    document.getElementById("txDate").value = new Date().toISOString().slice(0,10);
    modal.classList.add("open");
  }

  function closeModal() {
    document.getElementById("txModal").classList.remove("open");
  }

  function saveModal() {
    const id    = document.getElementById("txId").value;
    const date  = document.getElementById("txDate").value;
    const desc  = document.getElementById("txDescription").value.trim();
    const cat   = document.getElementById("txCategory").value;
    const type  = document.getElementById("txType").value;
    const amt   = parseFloat(document.getElementById("txAmount").value);

    if (!date || !desc || !cat || !type || isNaN(amt) || amt <= 0) {
      showToast("Please fill all fields correctly.", "error"); return;
    }

    const data = { date, description: desc, category: cat, type, amount: amt };
    if (id) {
      FinanceData.updateTransaction(parseInt(id), data);
      showToast("Transaction updated!");
    } else {
      FinanceData.addTransaction(data);
      showToast("Transaction added!");
    }
    closeModal();
    App.refreshAll();
  }

  function confirmDelete(id) {
    if (window.confirm("Delete this transaction?")) {
      FinanceData.deleteTransaction(id);
      showToast("Transaction deleted.", "warning");
      App.refreshAll();
    }
  }

  function showToast(msg, type="success") {
    const t = document.getElementById("toast");
    if (!t) return;
    t.textContent = msg;
    t.className = "toast show " + type;
    clearTimeout(t._timer);
    t._timer = setTimeout(() => t.classList.remove("show"), 3000);
  }

  function initFilters() {
    const searchInput = document.getElementById("txSearch");
    const typeFilter  = document.getElementById("txTypeFilter");
    const catFilter   = document.getElementById("txCatFilter");
    const dateFrom    = document.getElementById("txDateFrom");
    const dateTo      = document.getElementById("txDateTo");
    const clearDates  = document.getElementById("txClearDates");

    // Populate category filter
    if (catFilter) {
      catFilter.innerHTML = `<option value="all">All Categories</option>`;
      FinanceData.CATEGORIES.forEach(c => {
        catFilter.innerHTML += `<option value="${c}">${c}</option>`;
      });
    }

    const rerender = () => { currentPage = 1; render(FinanceData.getState().role); };

    if (searchInput) {
      searchInput.addEventListener("input", debounce(() => {
        FinanceData.setState({ filters: { ...FinanceData.getState().filters, search: searchInput.value } });
        rerender();
      }, 250));
    }

    if (typeFilter) {
      typeFilter.addEventListener("change", () => {
        FinanceData.setState({ filters: { ...FinanceData.getState().filters, type: typeFilter.value } });
        rerender();
      });
    }

    if (catFilter) {
      catFilter.addEventListener("change", () => {
        FinanceData.setState({ filters: { ...FinanceData.getState().filters, category: catFilter.value } });
        rerender();
      });
    }

    if (dateFrom) {
      dateFrom.addEventListener("change", () => {
        FinanceData.setState({ filters: { ...FinanceData.getState().filters, dateFrom: dateFrom.value } });
        rerender();
      });
    }

    if (dateTo) {
      dateTo.addEventListener("change", () => {
        FinanceData.setState({ filters: { ...FinanceData.getState().filters, dateTo: dateTo.value } });
        rerender();
      });
    }

    if (clearDates) {
      clearDates.addEventListener("click", () => {
        if (dateFrom) dateFrom.value = "";
        if (dateTo)   dateTo.value   = "";
        FinanceData.setState({ filters: { ...FinanceData.getState().filters, dateFrom: "", dateTo: "" } });
        rerender();
      });
    }

    document.querySelectorAll(".sort-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        updateSort(btn.dataset.sort);
        render(FinanceData.getState().role);
      });
    });

    // Modal events
    const addBtn = document.getElementById("addTxBtn");
    if (addBtn) addBtn.addEventListener("click", openAddModal);

    const closeBtn = document.getElementById("modalClose");
    if (closeBtn) closeBtn.addEventListener("click", closeModal);

    const cancelBtn = document.getElementById("modalCancel");
    if (cancelBtn) cancelBtn.addEventListener("click", closeModal);

    const saveBtn = document.getElementById("modalSave");
    if (saveBtn) saveBtn.addEventListener("click", saveModal);

    // Click outside modal to close
    const modal = document.getElementById("txModal");
    if (modal) {
      modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });
    }

    // Export buttons
    const exportCsv  = document.getElementById("exportCsv");
    const exportJson = document.getElementById("exportJson");
    if (exportCsv)  exportCsv.addEventListener("click",  () => exportData("csv"));
    if (exportJson) exportJson.addEventListener("click", () => exportData("json"));
  }

  function exportData(format) {
    const txs = getFiltered();
    if (format === "csv") {
      const header = "ID,Date,Description,Category,Type,Amount\n";
      const rows = txs.map(t => `${t.id},${t.date},"${t.description}",${t.category},${t.type},${t.amount}`).join("\n");
      downloadFile("transactions.csv", header + rows, "text/csv");
    } else {
      downloadFile("transactions.json", JSON.stringify(txs, null, 2), "application/json");
    }
    showToast(`Exported as ${format.toUpperCase()}`);
  }

  function downloadFile(name, content, type) {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([content], { type }));
    a.download = name;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function debounce(fn, ms) {
    let timer;
    return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), ms); };
  }

  return { render, initFilters, openAddModal, openEditModal, showToast };
})();

window.Transactions = Transactions;
