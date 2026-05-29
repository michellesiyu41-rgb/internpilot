const STORAGE_KEY = "internpilot.applications.v1";
const STATUSES = ["Wishlist", "Applied", "Interview", "Offer", "Rejected"];

const sampleApplications = [
  {
    id: crypto.randomUUID(),
    company: "Monzo",
    role: "Product Analyst Intern",
    status: "Interview",
    priority: "High",
    deadline: offsetDate(3),
    location: "London",
    nextAction: "Prepare metrics case study",
    notes: "Second round with product analytics team."
  },
  {
    id: crypto.randomUUID(),
    company: "Figma",
    role: "Design Engineer Intern",
    status: "Applied",
    priority: "High",
    deadline: offsetDate(6),
    location: "Remote",
    nextAction: "Ask alumni for referral follow-up",
    notes: "Portfolio link included in application."
  },
  {
    id: crypto.randomUUID(),
    company: "Wise",
    role: "Software Engineering Intern",
    status: "Wishlist",
    priority: "Medium",
    deadline: offsetDate(11),
    location: "London",
    nextAction: "Tailor CV to payments experience",
    notes: "Need to highlight backend project."
  },
  {
    id: crypto.randomUUID(),
    company: "Spotify",
    role: "Data Science Intern",
    status: "Rejected",
    priority: "Low",
    deadline: offsetDate(-8),
    location: "Stockholm",
    nextAction: "Archive notes for next cycle",
    notes: "Rejected after online assessment."
  },
  {
    id: crypto.randomUUID(),
    company: "Canva",
    role: "Growth Marketing Intern",
    status: "Offer",
    priority: "High",
    deadline: offsetDate(14),
    location: "Sydney / Remote",
    nextAction: "Compare compensation and visa timing",
    notes: "Offer deadline in two weeks."
  }
];

let applications = readApplications();
let filters = {
  search: "",
  status: "all",
  priority: "all"
};

const elements = {
  navItems: document.querySelectorAll(".nav-item"),
  views: document.querySelectorAll(".view"),
  totalCount: document.querySelector("#totalCount"),
  activeCount: document.querySelector("#activeCount"),
  interviewCount: document.querySelector("#interviewCount"),
  deadlineCount: document.querySelector("#deadlineCount"),
  weekGoal: document.querySelector("#weekGoal"),
  weekGoalMeta: document.querySelector("#weekGoalMeta"),
  searchInput: document.querySelector("#searchInput"),
  statusFilter: document.querySelector("#statusFilter"),
  priorityFilter: document.querySelector("#priorityFilter"),
  clearFilters: document.querySelector("#clearFilters"),
  focusList: document.querySelector("#focusList"),
  pipelineScore: document.querySelector("#pipelineScore"),
  pipelineBar: document.querySelector("#pipelineBar"),
  pipelineAdvice: document.querySelector("#pipelineAdvice"),
  kanbanBoard: document.querySelector("#kanbanBoard"),
  applicationTable: document.querySelector("#applicationTable"),
  dialog: document.querySelector("#applicationDialog"),
  dialogTitle: document.querySelector("#dialogTitle"),
  form: document.querySelector("#applicationForm"),
  deleteButton: document.querySelector("#deleteButton"),
  openAddDialog: document.querySelector("#openAddDialog"),
  closeDialog: document.querySelector("#closeDialog"),
  cancelButton: document.querySelector("#cancelButton"),
  exportButton: document.querySelector("#exportButton"),
  seedButton: document.querySelector("#seedButton"),
  fields: {
    id: document.querySelector("#applicationId"),
    company: document.querySelector("#companyInput"),
    role: document.querySelector("#roleInput"),
    status: document.querySelector("#statusInput"),
    priority: document.querySelector("#priorityInput"),
    deadline: document.querySelector("#deadlineInput"),
    location: document.querySelector("#locationInput"),
    nextAction: document.querySelector("#nextActionInput"),
    notes: document.querySelector("#notesInput")
  }
};

elements.navItems.forEach((item) => {
  item.addEventListener("click", () => setView(item.dataset.view));
});

elements.searchInput.addEventListener("input", (event) => {
  filters.search = event.target.value.trim().toLowerCase();
  render();
});

elements.statusFilter.addEventListener("change", (event) => {
  filters.status = event.target.value;
  render();
});

elements.priorityFilter.addEventListener("change", (event) => {
  filters.priority = event.target.value;
  render();
});

elements.clearFilters.addEventListener("click", () => {
  filters = { search: "", status: "all", priority: "all" };
  elements.searchInput.value = "";
  elements.statusFilter.value = "all";
  elements.priorityFilter.value = "all";
  render();
});

elements.openAddDialog.addEventListener("click", () => openDialog());
elements.closeDialog.addEventListener("click", () => elements.dialog.close());
elements.cancelButton.addEventListener("click", () => elements.dialog.close());
elements.exportButton.addEventListener("click", exportCsv);
elements.seedButton.addEventListener("click", () => {
  applications = sampleApplications.map((application) => ({
    ...application,
    id: crypto.randomUUID()
  }));
  persist();
  render();
});

elements.form.addEventListener("submit", (event) => {
  event.preventDefault();
  saveApplication();
});

elements.deleteButton.addEventListener("click", () => {
  const id = elements.fields.id.value;
  applications = applications.filter((application) => application.id !== id);
  persist();
  elements.dialog.close();
  render();
});

render();

function setView(viewName) {
  elements.navItems.forEach((item) => {
    item.classList.toggle("active", item.dataset.view === viewName);
  });

  elements.views.forEach((view) => {
    view.classList.toggle("active", view.id === `${viewName}View`);
  });
}

function readApplications() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleApplications));
    return sampleApplications;
  }

  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : sampleApplications;
  } catch {
    return sampleApplications;
  }
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(applications));
}

function filteredApplications() {
  return applications.filter((application) => {
    const matchesSearch = [application.company, application.role, application.location]
      .join(" ")
      .toLowerCase()
      .includes(filters.search);
    const matchesStatus = filters.status === "all" || application.status === filters.status;
    const matchesPriority = filters.priority === "all" || application.priority === filters.priority;

    return matchesSearch && matchesStatus && matchesPriority;
  });
}

function render() {
  const visibleApplications = filteredApplications();
  renderMetrics();
  renderFocusList(visibleApplications);
  renderPipelineHealth();
  renderKanban(visibleApplications);
  renderTable(visibleApplications);
}

function renderMetrics() {
  const active = applications.filter((application) => !["Offer", "Rejected"].includes(application.status));
  const interviews = applications.filter((application) => application.status === "Interview");
  const upcoming = applications.filter((application) => isWithinDays(application.deadline, 7));
  const followUps = active.filter((application) => application.nextAction).length;

  elements.totalCount.textContent = applications.length;
  elements.activeCount.textContent = active.length;
  elements.interviewCount.textContent = interviews.length;
  elements.deadlineCount.textContent = upcoming.length;
  elements.weekGoal.textContent = `${followUps} follow-up${followUps === 1 ? "" : "s"}`;
  elements.weekGoalMeta.textContent = upcoming.length
    ? `${upcoming.length} deadline${upcoming.length === 1 ? "" : "s"} due in 7 days`
    : "No urgent actions yet";
}

function renderFocusList(items) {
  const sorted = [...items]
    .filter((application) => application.status !== "Rejected")
    .sort((a, b) => daysUntil(a.deadline) - daysUntil(b.deadline))
    .slice(0, 5);

  if (!sorted.length) {
    elements.focusList.innerHTML = `<div class="empty-state">No matching applications. Add a role or clear filters to refill your focus queue.</div>`;
    return;
  }

  elements.focusList.innerHTML = sorted
    .map((application) => `
      <article class="focus-item">
        <div>
          <h4>${escapeHtml(application.company)} · ${escapeHtml(application.role)}</h4>
          <p>${escapeHtml(application.nextAction || "Choose the next best action")} · ${formatDeadline(application.deadline)}</p>
        </div>
        <button class="secondary-button" type="button" data-edit="${application.id}">Edit</button>
      </article>
    `)
    .join("");

  bindEditButtons(elements.focusList);
}

function renderPipelineHealth() {
  if (!applications.length) {
    elements.pipelineScore.textContent = "0%";
    elements.pipelineBar.style.width = "0%";
    elements.pipelineAdvice.textContent = "Add applications to start measuring your internship pipeline.";
    return;
  }

  const active = applications.filter((application) => !["Rejected"].includes(application.status)).length;
  const interviewOrOffer = applications.filter((application) => ["Interview", "Offer"].includes(application.status)).length;
  const completion = Math.round(((active + interviewOrOffer * 1.5) / Math.max(applications.length * 2, 1)) * 100);
  const score = Math.min(completion, 100);

  elements.pipelineScore.textContent = `${score}%`;
  elements.pipelineBar.style.width = `${score}%`;
  elements.pipelineAdvice.textContent = score >= 65
    ? "Strong coverage. Keep follow-ups sharp and compare opportunities while the pipeline is warm."
    : "Add more active applications or move wishlist roles into submitted applications this week.";
}

function renderKanban(items) {
  elements.kanbanBoard.innerHTML = STATUSES.map((status) => {
    const statusItems = items.filter((application) => application.status === status);
    return `
      <section class="stage-column" aria-label="${status}">
        <div class="stage-header">
          <span>${status}</span>
          <span>${statusItems.length}</span>
        </div>
        <div class="stage-list">
          ${statusItems.length ? statusItems.map(renderApplicationCard).join("") : `<div class="empty-state">Empty</div>`}
        </div>
      </section>
    `;
  }).join("");

  bindEditButtons(elements.kanbanBoard);
}

function renderApplicationCard(application) {
  return `
    <article class="application-card">
      <h4>${escapeHtml(application.company)}</h4>
      <p>${escapeHtml(application.role)}</p>
      <div class="card-meta">
        <span class="pill ${application.priority.toLowerCase()}">${application.priority}</span>
        <span class="pill">${formatDeadline(application.deadline)}</span>
      </div>
      <button class="link-button" type="button" data-edit="${application.id}">Edit</button>
    </article>
  `;
}

function renderTable(items) {
  if (!items.length) {
    elements.applicationTable.innerHTML = `
      <tr>
        <td colspan="6"><div class="empty-state">No applications match the current filters.</div></td>
      </tr>
    `;
    return;
  }

  elements.applicationTable.innerHTML = items
    .map((application) => `
      <tr>
        <td>${escapeHtml(application.company)}</td>
        <td>${escapeHtml(application.role)}</td>
        <td><span class="pill">${application.status}</span></td>
        <td>${formatDeadline(application.deadline)}</td>
        <td><span class="pill ${application.priority.toLowerCase()}">${application.priority}</span></td>
        <td><button class="link-button" type="button" data-edit="${application.id}">Edit</button></td>
      </tr>
    `)
    .join("");

  bindEditButtons(elements.applicationTable);
}

function bindEditButtons(container) {
  container.querySelectorAll("[data-edit]").forEach((button) => {
    button.addEventListener("click", () => openDialog(button.dataset.edit));
  });
}

function openDialog(id = "") {
  const application = applications.find((item) => item.id === id);
  elements.dialogTitle.textContent = application ? "Edit application" : "Add application";
  elements.deleteButton.hidden = !application;

  elements.fields.id.value = application?.id || "";
  elements.fields.company.value = application?.company || "";
  elements.fields.role.value = application?.role || "";
  elements.fields.status.value = application?.status || "Wishlist";
  elements.fields.priority.value = application?.priority || "Medium";
  elements.fields.deadline.value = application?.deadline || "";
  elements.fields.location.value = application?.location || "";
  elements.fields.nextAction.value = application?.nextAction || "";
  elements.fields.notes.value = application?.notes || "";

  elements.dialog.showModal();
}

function saveApplication() {
  const id = elements.fields.id.value || crypto.randomUUID();
  const nextApplication = {
    id,
    company: elements.fields.company.value.trim(),
    role: elements.fields.role.value.trim(),
    status: elements.fields.status.value,
    priority: elements.fields.priority.value,
    deadline: elements.fields.deadline.value,
    location: elements.fields.location.value.trim(),
    nextAction: elements.fields.nextAction.value.trim(),
    notes: elements.fields.notes.value.trim()
  };

  applications = applications.some((application) => application.id === id)
    ? applications.map((application) => application.id === id ? nextApplication : application)
    : [nextApplication, ...applications];

  persist();
  elements.dialog.close();
  render();
}

function exportCsv() {
  const headers = ["Company", "Role", "Status", "Priority", "Deadline", "Location", "Next Action", "Notes"];
  const rows = applications.map((application) => [
    application.company,
    application.role,
    application.status,
    application.priority,
    application.deadline,
    application.location,
    application.nextAction,
    application.notes
  ]);

  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell || "").replaceAll('"', '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "internpilot-applications.csv";
  link.click();
  URL.revokeObjectURL(url);
}

function offsetDate(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function daysUntil(value) {
  if (!value) {
    return Number.POSITIVE_INFINITY;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(`${value}T00:00:00`);
  return Math.ceil((target - today) / 86400000);
}

function isWithinDays(value, limit) {
  const days = daysUntil(value);
  return days >= 0 && days <= limit;
}

function formatDeadline(value) {
  const days = daysUntil(value);
  if (!value) {
    return "No deadline";
  }
  if (days < 0) {
    return `${Math.abs(days)}d overdue`;
  }
  if (days === 0) {
    return "Due today";
  }
  return `${days}d left`;
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
