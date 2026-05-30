const STORAGE_KEY = "internpilot.applications.v3";
const PREVIOUS_STORAGE_KEYS = ["internpilot.applications.v2", "internpilot.applications.v1"];
const STATUSES = ["Wishlist", "Applied", "Interview", "Offer", "Rejected"];

const STATUS_LABELS = {
  Wishlist: "想申请",
  Applied: "已申请",
  Interview: "面试中",
  Offer: "已拿 Offer",
  Rejected: "已拒绝"
};

const PRIORITY_LABELS = {
  High: "高",
  Medium: "中",
  Low: "低"
};

const sampleApplications = [
  {
    id: crypto.randomUUID(),
    company: "Monzo",
    role: "产品分析实习生",
    status: "Interview",
    priority: "High",
    deadline: offsetDate(3),
    location: "伦敦",
    nextAction: "准备 metrics case study",
    notes: "第二轮面试，重点准备产品分析和增长指标。"
  },
  {
    id: crypto.randomUUID(),
    company: "Figma",
    role: "设计工程实习生",
    status: "Applied",
    priority: "High",
    deadline: offsetDate(6),
    location: "远程",
    nextAction: "联系校友跟进内推",
    notes: "申请里已附作品集链接。"
  },
  {
    id: crypto.randomUUID(),
    company: "Wise",
    role: "软件工程实习生",
    status: "Wishlist",
    priority: "Medium",
    deadline: offsetDate(11),
    location: "伦敦",
    nextAction: "根据支付项目经历修改简历",
    notes: "需要突出后端项目和 API 经验。"
  },
  {
    id: crypto.randomUUID(),
    company: "Spotify",
    role: "数据科学实习生",
    status: "Rejected",
    priority: "Low",
    deadline: offsetDate(-8),
    location: "斯德哥尔摩",
    nextAction: "归档笔试经验",
    notes: "Online assessment 后收到拒信。"
  },
  {
    id: crypto.randomUUID(),
    company: "Canva",
    role: "增长营销实习生",
    status: "Offer",
    priority: "High",
    deadline: offsetDate(14),
    location: "悉尼 / 远程",
    nextAction: "比较薪资、签证和入职时间",
    notes: "Offer 决策截止日期在两周后。"
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
  openJdDialog: document.querySelector("#openJdDialog"),
  jdDialog: document.querySelector("#jdDialog"),
  closeJdDialog: document.querySelector("#closeJdDialog"),
  cancelJdButton: document.querySelector("#cancelJdButton"),
  jdFileInput: document.querySelector("#jdFileInput"),
  resumeFileInput: document.querySelector("#resumeFileInput"),
  jdStatus: document.querySelector("#jdStatus"),
  jdText: document.querySelector("#jdText"),
  resumeText: document.querySelector("#resumeText"),
  parseJdText: document.querySelector("#parseJdText"),
  analyzeFitButton: document.querySelector("#analyzeFitButton"),
  copyEmailButton: document.querySelector("#copyEmailButton"),
  useJdButton: document.querySelector("#useJdButton"),
  matchScore: document.querySelector("#matchScore"),
  matchDetails: document.querySelector("#matchDetails"),
  suggestionsList: document.querySelector("#suggestionsList"),
  emailDraft: document.querySelector("#emailDraft"),
  parsedCompany: document.querySelector("#parsedCompany"),
  parsedRole: document.querySelector("#parsedRole"),
  parsedLocation: document.querySelector("#parsedLocation"),
  parsedDeadline: document.querySelector("#parsedDeadline"),
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

if (window.pdfjsLib) {
  window.pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
}

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
elements.openJdDialog.addEventListener("click", openJdDialog);
elements.closeJdDialog.addEventListener("click", () => elements.jdDialog.close());
elements.cancelJdButton.addEventListener("click", () => elements.jdDialog.close());
elements.parseJdText.addEventListener("click", () => parseAndFillJd(elements.jdText.value));
elements.analyzeFitButton.addEventListener("click", analyzeFitFromMaterials);
elements.copyEmailButton.addEventListener("click", copyEmailDraft);
elements.useJdButton.addEventListener("click", applyJdToApplicationForm);
elements.jdFileInput.addEventListener("change", handleJdFile);
elements.resumeFileInput.addEventListener("change", handleResumeFile);

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
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (!Array.isArray(parsed)) {
        return sampleApplications;
      }
      const migrated = migrateLegacySamples(parsed);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
      return migrated;
    } catch {
      return sampleApplications;
    }
  }

  const legacyKey = PREVIOUS_STORAGE_KEYS.find((key) => localStorage.getItem(key));
  const legacy = legacyKey ? localStorage.getItem(legacyKey) : "";
  if (legacy) {
    try {
      const parsed = JSON.parse(legacy);
      const migrated = Array.isArray(parsed) ? migrateLegacySamples(parsed) : sampleApplications;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
      return migrated;
    } catch {
      return sampleApplications;
    }
  }

  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleApplications));
    return sampleApplications;
  }
}

function migrateLegacySamples(items) {
  const translations = {
    "Monzo|Product Analyst Intern": {
      role: "产品分析实习生",
      location: "伦敦",
      nextAction: "准备 metrics case study",
      notes: "第二轮面试，重点准备产品分析和增长指标。"
    },
    "Figma|Design Engineer Intern": {
      role: "设计工程实习生",
      location: "远程",
      nextAction: "联系校友跟进内推",
      notes: "申请里已附作品集链接。"
    },
    "Wise|Software Engineering Intern": {
      role: "软件工程实习生",
      location: "伦敦",
      nextAction: "根据支付项目经历修改简历",
      notes: "需要突出后端项目和 API 经验。"
    },
    "Spotify|Data Science Intern": {
      role: "数据科学实习生",
      location: "斯德哥尔摩",
      nextAction: "归档笔试经验",
      notes: "Online assessment 后收到拒信。"
    },
    "Canva|Growth Marketing Intern": {
      role: "增长营销实习生",
      location: "悉尼 / 远程",
      nextAction: "比较薪资、签证和入职时间",
      notes: "Offer 决策截止日期在两周后。"
    }
  };

  return items.map((item) => {
    const translation = translations[`${item.company}|${item.role}`];
    return translation ? { ...item, ...translation } : item;
  });
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
  elements.weekGoal.textContent = `${followUps} 个跟进`;
  elements.weekGoalMeta.textContent = upcoming.length
    ? `${upcoming.length} 个截止日期在 7 天内`
    : "暂无紧急事项";
}

function renderFocusList(items) {
  const sorted = [...items]
    .filter((application) => application.status !== "Rejected")
    .sort((a, b) => daysUntil(a.deadline) - daysUntil(b.deadline))
    .slice(0, 5);

  if (!sorted.length) {
    elements.focusList.innerHTML = `<div class="empty-state">没有匹配的申请。可以新增岗位，或清空筛选条件。</div>`;
    return;
  }

  elements.focusList.innerHTML = sorted
    .map((application) => `
      <article class="focus-item">
        <div>
          <h4>${escapeHtml(application.company)} · ${escapeHtml(application.role)}</h4>
          <p>${escapeHtml(application.nextAction || "选择下一步行动")} · ${formatDeadline(application.deadline)}</p>
        </div>
        <button class="secondary-button" type="button" data-edit="${application.id}">编辑</button>
      </article>
    `)
    .join("");

  bindEditButtons(elements.focusList);
}

function renderPipelineHealth() {
  if (!applications.length) {
    elements.pipelineScore.textContent = "0%";
    elements.pipelineBar.style.width = "0%";
    elements.pipelineAdvice.textContent = "添加申请后，这里会显示你的申请流程健康度。";
    return;
  }

  const active = applications.filter((application) => application.status !== "Rejected").length;
  const interviewOrOffer = applications.filter((application) => ["Interview", "Offer"].includes(application.status)).length;
  const completion = Math.round(((active + interviewOrOffer * 1.5) / Math.max(applications.length * 2, 1)) * 100);
  const score = Math.min(completion, 100);

  elements.pipelineScore.textContent = `${score}%`;
  elements.pipelineBar.style.width = `${score}%`;
  elements.pipelineAdvice.textContent = score >= 65
    ? "当前 pipeline 覆盖度不错。继续保持跟进，并比较高价值机会。"
    : "建议本周增加更多活跃申请，或把想申请岗位推进到已申请。";
}

function renderKanban(items) {
  elements.kanbanBoard.innerHTML = STATUSES.map((status) => {
    const statusItems = items.filter((application) => application.status === status);
    return `
      <section class="stage-column" aria-label="${STATUS_LABELS[status]}">
        <div class="stage-header">
          <span>${STATUS_LABELS[status]}</span>
          <span>${statusItems.length}</span>
        </div>
        <div class="stage-list">
          ${statusItems.length ? statusItems.map(renderApplicationCard).join("") : `<div class="empty-state">暂无</div>`}
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
        <span class="pill ${application.priority.toLowerCase()}">${PRIORITY_LABELS[application.priority]}</span>
        <span class="pill">${formatDeadline(application.deadline)}</span>
      </div>
      <button class="link-button" type="button" data-edit="${application.id}">编辑</button>
    </article>
  `;
}

function renderTable(items) {
  if (!items.length) {
    elements.applicationTable.innerHTML = `
      <tr>
        <td colspan="6"><div class="empty-state">当前筛选条件下没有申请记录。</div></td>
      </tr>
    `;
    return;
  }

  elements.applicationTable.innerHTML = items
    .map((application) => `
      <tr>
        <td>${escapeHtml(application.company)}</td>
        <td>${escapeHtml(application.role)}</td>
        <td><span class="pill">${STATUS_LABELS[application.status]}</span></td>
        <td>${formatDeadline(application.deadline)}</td>
        <td><span class="pill ${application.priority.toLowerCase()}">${PRIORITY_LABELS[application.priority]}</span></td>
        <td><button class="link-button" type="button" data-edit="${application.id}">编辑</button></td>
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

function openDialog(id = "", defaults = {}) {
  const application = applications.find((item) => item.id === id);
  elements.dialogTitle.textContent = application ? "编辑申请" : "新增申请";
  elements.deleteButton.hidden = !application;

  elements.fields.id.value = application?.id || "";
  elements.fields.company.value = application?.company || defaults.company || "";
  elements.fields.role.value = application?.role || defaults.role || "";
  elements.fields.status.value = application?.status || defaults.status || "Wishlist";
  elements.fields.priority.value = application?.priority || defaults.priority || "Medium";
  elements.fields.deadline.value = application?.deadline || defaults.deadline || "";
  elements.fields.location.value = application?.location || defaults.location || "";
  elements.fields.nextAction.value = application?.nextAction || defaults.nextAction || "";
  elements.fields.notes.value = application?.notes || defaults.notes || "";

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

function openJdDialog() {
  elements.jdFileInput.value = "";
  elements.resumeFileInput.value = "";
  elements.jdText.value = "";
  elements.resumeText.value = "";
  elements.parsedCompany.value = "";
  elements.parsedRole.value = "";
  elements.parsedLocation.value = "";
  elements.parsedDeadline.value = "";
  elements.matchScore.textContent = "尚未分析";
  elements.matchDetails.textContent = "导入 JD 和简历/经历后，点击“分析匹配度”。";
  elements.suggestionsList.innerHTML = "<li>先上传或粘贴材料。</li>";
  elements.emailDraft.value = "";
  setJdStatus("选择文件后开始读取，或直接粘贴 JD 和经历文本。");
  elements.jdDialog.showModal();
}

async function handleJdFile(event) {
  const file = event.target.files?.[0];
  if (!file) {
    return;
  }

  try {
    setJdStatus(`正在读取：${file.name}`);
    const text = await extractTextFromFile(file);
    elements.jdText.value = normalizeWhitespace(text);
    parseAndFillJd(elements.jdText.value);
    setJdStatus("读取完成。请检查识别结果，再应用到申请表。");
  } catch (error) {
    setJdStatus(error.message || "读取失败，请直接粘贴 JD 文本。", true);
  }
}

async function handleResumeFile(event) {
  const file = event.target.files?.[0];
  if (!file) {
    return;
  }

  try {
    setJdStatus(`正在读取简历/经历：${file.name}`);
    const text = await extractTextFromFile(file);
    elements.resumeText.value = normalizeWhitespace(text);
    setJdStatus("简历/经历读取完成。可以继续分析匹配度。");
  } catch (error) {
    setJdStatus(error.message || "读取失败，请直接粘贴简历或经历文本。", true);
  }
}

async function extractTextFromFile(file) {
  if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
    return extractPdfText(file);
  }

  if (file.type.startsWith("image/")) {
    return extractImageText(file);
  }

  return file.text();
}

async function extractPdfText(file) {
  if (!window.pdfjsLib) {
    throw new Error("PDF 解析库还没有加载完成，请稍后重试。");
  }

  const data = await file.arrayBuffer();
  const pdf = await window.pdfjsLib.getDocument({ data }).promise;
  const pageTexts = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    setJdStatus(`正在读取 PDF：第 ${pageNumber} / ${pdf.numPages} 页`);
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    pageTexts.push(content.items.map((item) => item.str).join(" "));
  }

  return pageTexts.join("\n\n");
}

async function extractImageText(file) {
  if (!window.Tesseract) {
    throw new Error("图片 OCR 库还没有加载完成，请稍后重试。");
  }

  const result = await window.Tesseract.recognize(file, "eng+chi_sim", {
    logger: (message) => {
      if (message.status === "recognizing text") {
        setJdStatus(`正在识别图片文字：${Math.round(message.progress * 100)}%`);
      }
    }
  });

  return result.data.text;
}

function parseAndFillJd(text) {
  const parsed = parseJd(text);
  elements.parsedCompany.value = parsed.company;
  elements.parsedRole.value = parsed.role;
  elements.parsedLocation.value = parsed.location;
  elements.parsedDeadline.value = parsed.deadline;
  setJdStatus(text.trim() ? "已根据 JD 文本生成初步识别结果。" : "请先上传或粘贴 JD 文本。", !text.trim());
}

function parseJd(text) {
  const cleaned = normalizeWhitespace(text);
  const lines = cleaned
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 40);

  return {
    company: pickField(cleaned, [
      /(?:公司|公司名称|Company|Employer)\s*[:：]\s*([^\n|,，]+)/i,
      /(?:About|关于)\s+([A-Z][A-Za-z0-9 &.-]{2,40})/i
    ]) || guessCompany(lines),
    role: pickField(cleaned, [
      /(?:岗位|职位|岗位名称|职位名称|Role|Position|Title|Job Title)\s*[:：]\s*([^\n|,，]+)/i,
      /([A-Za-z\u4e00-\u9fa5 ]{2,40}(?:Intern|Internship|实习生|实习))/i
    ]) || guessRole(lines),
    location: pickField(cleaned, [
      /(?:地点|工作地点|Location|Office)\s*[:：]\s*([^\n]+)/i,
      /(Remote|Hybrid|Onsite|London|Shanghai|Beijing|Shenzhen|New York|Singapore|Hong Kong|远程|伦敦|上海|北京|深圳|新加坡|香港)/i
    ]),
    deadline: normalizeDate(pickField(cleaned, [
      /(?:截止|截止日期|申请截止|Deadline|Apply by|Closing date)\s*[:：]?\s*([A-Za-z0-9,./\- 年月日]+)/i,
      /(\d{4}[./-]\d{1,2}[./-]\d{1,2})/
    ]))
  };
}

function analyzeFitFromMaterials() {
  const jdText = elements.jdText.value.trim();
  const resumeText = elements.resumeText.value.trim();

  if (!jdText || !resumeText) {
    setJdStatus("请先提供 JD 和简历/过往经历，再分析匹配度。", true);
    return;
  }

  parseAndFillJd(jdText);
  const analysis = buildFitAnalysis(jdText, resumeText);
  elements.matchScore.textContent = `${analysis.score}%`;
  elements.matchDetails.textContent = analysis.details;
  elements.suggestionsList.innerHTML = analysis.suggestions
    .map((suggestion) => `<li>${escapeHtml(suggestion)}</li>`)
    .join("");
  elements.emailDraft.value = buildEmailDraft(analysis);
  setJdStatus("匹配度、提升建议和投递邮件草稿已生成。");
}

function buildFitAnalysis(jdText, resumeText) {
  const jdSkills = extractSkillKeywords(jdText);
  const resumeSkills = extractSkillKeywords(resumeText);
  const matchedSkills = jdSkills.filter((skill) => resumeSkills.includes(skill));
  const missingSkills = jdSkills.filter((skill) => !resumeSkills.includes(skill));
  const jdTokens = getImportantTokens(jdText);
  const resumeTokens = getImportantTokens(resumeText);
  const tokenMatches = jdTokens.filter((token) => resumeTokens.includes(token));
  const skillScore = jdSkills.length ? matchedSkills.length / jdSkills.length : 0.45;
  const tokenScore = jdTokens.length ? tokenMatches.length / jdTokens.length : 0.35;
  const evidenceBonus = /(实习|intern|项目|project|lead|负责|built|developed|launched|分析|research|用户|data|api)/i.test(resumeText) ? 0.12 : 0;
  const score = Math.min(95, Math.round((skillScore * 0.62 + tokenScore * 0.26 + evidenceBonus) * 100));
  const parsed = parseJd(jdText);

  return {
    score,
    company: elements.parsedCompany.value.trim() || parsed.company || "目标公司",
    role: elements.parsedRole.value.trim() || parsed.role || "目标岗位",
    matchedSkills,
    missingSkills,
    tokenMatches: tokenMatches.slice(0, 8),
    suggestions: buildSuggestions(missingSkills, score),
    details: buildMatchDetails(score, matchedSkills, missingSkills, tokenMatches)
  };
}

function extractSkillKeywords(text) {
  const skillMap = [
    ["JavaScript", /javascript|typescript|react|vue|node|前端|网页|web/i],
    ["Python", /python|pandas|numpy|flask|django/i],
    ["数据分析", /data analysis|analytics|sql|tableau|power bi|数据分析|数据可视化|指标/i],
    ["机器学习", /machine learning|ml|deep learning|pytorch|tensorflow|机器学习|深度学习|模型/i],
    ["产品思维", /product|roadmap|user research|用户研究|产品|需求分析|增长/i],
    ["设计能力", /\b(?:figma|ui|ux|prototype|wireframe)\b|设计|原型/i],
    ["后端/API", /api|backend|server|database|postgres|mysql|后端|数据库/i],
    ["沟通协作", /communication|stakeholder|collaborat|presentation|沟通|协作|跨团队/i],
    ["项目管理", /project management|prioriti[sz]e|deadline|agile|scrum|项目管理|排期/i],
    ["研究能力", /research|experiment|survey|interview|调研|实验|访谈/i],
    ["市场/增长", /marketing|growth|seo|campaign|crm|市场|增长|投放/i],
    ["金融/商业", /finance|business|strategy|market|商业|金融|策略/i]
  ];

  return skillMap
    .filter(([, pattern]) => pattern.test(text))
    .map(([label]) => label);
}

function getImportantTokens(text) {
  const stopWords = new Set(["and", "the", "for", "with", "you", "our", "will", "are", "from", "this", "that", "工作", "岗位", "要求", "负责", "能力", "相关", "进行"]);
  const tokens = normalizeWhitespace(text)
    .toLowerCase()
    .match(/[a-z][a-z+#.-]{2,}|[\u4e00-\u9fa5]{2,}/g) || [];
  const counts = new Map();

  tokens.forEach((token) => {
    if (!stopWords.has(token) && token.length <= 24) {
      counts.set(token, (counts.get(token) || 0) + 1);
    }
  });

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 16)
    .map(([token]) => token);
}

function buildMatchDetails(score, matchedSkills, missingSkills, tokenMatches) {
  const matched = matchedSkills.length ? `已匹配：${matchedSkills.join("、")}。` : "暂未识别到明显技能匹配。";
  const missing = missingSkills.length ? `待补强：${missingSkills.join("、")}。` : "JD 中的核心技能基本都有覆盖。";
  const overlap = tokenMatches.length ? `关键词重合：${tokenMatches.slice(0, 6).join("、")}。` : "关键词重合度偏低。";
  return `综合匹配度 ${score}%。${matched}${missing}${overlap}`;
}

function buildSuggestions(missingSkills, score) {
  const suggestions = [];

  if (missingSkills.length) {
    suggestions.push(`优先补强 JD 中缺口最大的能力：${missingSkills.slice(0, 4).join("、")}。`);
    suggestions.push("用一个 1-2 周的小项目补证据：明确目标、过程、结果和可量化指标。");
  } else {
    suggestions.push("当前经历和 JD 的技能要求较贴合，重点把项目结果写得更量化。");
  }

  if (score < 60) {
    suggestions.push("投递前建议重写简历摘要，把最相关的课程、项目或实习放到最前面。");
  } else if (score < 78) {
    suggestions.push("在邮件里主动解释匹配点，并补一句你正在提升的能力。");
  } else {
    suggestions.push("可以把邮件写得更直接，突出 2 个最强匹配点并请求面试机会。");
  }

  suggestions.push("把 JD 关键词自然放进简历 bullet，但避免堆砌关键词。");
  return suggestions;
}

function buildEmailDraft(analysis) {
  const matched = analysis.matchedSkills.length
    ? analysis.matchedSkills.slice(0, 3).join("、")
    : "相关项目经历和学习能力";
  const gap = analysis.missingSkills.length
    ? `我也注意到岗位需要 ${analysis.missingSkills.slice(0, 2).join("、")}，目前正在通过项目练习继续补强。`
    : "我的经历与岗位要求较为贴合，也希望进一步了解团队当前最重要的问题。";

  return `邮件主题：申请 ${analysis.company} ${analysis.role}\n\n您好，\n\n我想申请 ${analysis.company} 的 ${analysis.role}。我对这个机会很感兴趣，因为岗位要求与我过往在 ${matched} 方面的经历有较高匹配度。\n\n根据 JD，我理解这个岗位需要候选人能够快速学习、主动推进任务，并把分析或项目结果转化为实际产出。我的相关经历可以支持这些要求：我有过项目拆解、协作交付和结果复盘的经验，也习惯用清晰的文档和数据说明工作成果。\n\n${gap}\n\n如果方便的话，希望能有机会进一步沟通我如何为团队贡献价值。附件中是我的简历，感谢您的时间。\n\n祝好，\n[你的名字]`;
}

async function copyEmailDraft() {
  const text = elements.emailDraft.value.trim();
  if (!text) {
    setJdStatus("还没有可复制的邮件草稿，请先分析匹配度。", true);
    return;
  }

  await navigator.clipboard.writeText(text);
  setJdStatus("投递邮件已复制到剪贴板。");
}

function applyJdToApplicationForm() {
  const text = elements.jdText.value.trim();
  const resumeText = elements.resumeText.value.trim();
  const emailText = elements.emailDraft.value.trim();
  const jdSnippet = text ? `\n\nJD 原文摘录：\n${text.slice(0, 1800)}` : "";
  const resumeSnippet = resumeText ? `\n\n简历/经历摘录：\n${resumeText.slice(0, 1200)}` : "";
  const emailSnippet = emailText ? `\n\n投递邮件草稿：\n${emailText}` : "";

  elements.jdDialog.close();
  openDialog("", {
    company: elements.parsedCompany.value.trim(),
    role: elements.parsedRole.value.trim(),
    location: elements.parsedLocation.value.trim(),
    deadline: elements.parsedDeadline.value,
    status: "Wishlist",
    priority: "Medium",
    nextAction: "根据 JD 调整简历并提交申请",
    notes: `由投递助手生成。${jdSnippet}${resumeSnippet}${emailSnippet}`.trim()
  });
}

function pickField(text, patterns) {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) {
      return match[1].trim().replace(/[。；;]$/, "");
    }
  }

  return "";
}

function guessCompany(lines) {
  const companyLine = lines.find((line) => /company|公司|about/i.test(line));
  if (!companyLine) {
    return "";
  }

  return companyLine
    .replace(/(?:company|公司|about|关于)\s*[:：]?/i, "")
    .trim()
    .slice(0, 60);
}

function guessRole(lines) {
  const roleLine = lines.find((line) => /intern|internship|实习|岗位|职位|role|position/i.test(line));
  return roleLine ? roleLine.replace(/(?:岗位|职位|role|position|title)\s*[:：]?/i, "").trim().slice(0, 80) : "";
}

function normalizeDate(value) {
  if (!value) {
    return "";
  }

  const normalized = value
    .replace(/年|\.|\//g, "-")
    .replace(/月/g, "-")
    .replace(/日/g, "")
    .replace(/,/g, "")
    .trim();
  const numeric = normalized.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);

  if (!numeric) {
    return "";
  }

  const [, year, month, day] = numeric;
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

function normalizeWhitespace(value) {
  return String(value || "")
    .replace(/\r/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function setJdStatus(message, isError = false) {
  elements.jdStatus.textContent = message;
  elements.jdStatus.classList.toggle("error", isError);
}

function exportCsv() {
  const headers = ["公司", "岗位", "状态", "优先级", "截止日期", "地点", "下一步行动", "备注"];
  const rows = applications.map((application) => [
    application.company,
    application.role,
    STATUS_LABELS[application.status],
    PRIORITY_LABELS[application.priority],
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
    return "无截止日期";
  }
  if (days < 0) {
    return `已逾期 ${Math.abs(days)} 天`;
  }
  if (days === 0) {
    return "今天截止";
  }
  return `还剩 ${days} 天`;
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
