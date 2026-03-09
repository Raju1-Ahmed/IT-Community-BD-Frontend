export const SOFTWARE_CATEGORY = "Software & Web Development";

export const CATEGORY_PROFILE_CONFIG = {
  "Data Science & Business Intelligence": [
    {
      key: "analyticsProjects",
      label: "Analytics Projects",
      description: "Show major analysis work and measurable business value.",
      template: {
        projectName: "",
        dataSource: "",
        tools: "",
        businessImpact: ""
      },
      fields: [
        { key: "projectName", label: "Project Name", placeholder: "Sales Forecasting Dashboard", type: "text" },
        { key: "dataSource", label: "Data Source", placeholder: "ERP + CRM + Web Analytics", type: "text" },
        { key: "tools", label: "Tools/Stack", placeholder: "SQL, Python, Power BI", type: "text" },
        { key: "businessImpact", label: "Business Impact", placeholder: "Reduced reporting time by 40%", type: "textarea" }
      ]
    },
    {
      key: "dashboardPortfolio",
      label: "Dashboard Portfolio",
      description: "List dashboards or reports that stakeholders actively use.",
      template: {
        dashboardName: "",
        platform: "",
        kpis: "",
        link: ""
      },
      fields: [
        { key: "dashboardName", label: "Dashboard Name", placeholder: "Executive KPI Dashboard", type: "text" },
        { key: "platform", label: "Platform", placeholder: "Power BI / Tableau", type: "text" },
        { key: "kpis", label: "Key KPIs", placeholder: "Revenue, CAC, churn, conversion", type: "text" },
        { key: "link", label: "Link", placeholder: "https://...", type: "url" }
      ]
    }
  ],
  "Digital Marketing & Growth": [
    {
      key: "campaigns",
      label: "Campaign Portfolio",
      description: "Provide campaign performance that proves growth outcomes.",
      template: {
        campaignName: "",
        channel: "",
        duration: "",
        result: ""
      },
      fields: [
        { key: "campaignName", label: "Campaign Name", placeholder: "Eid Promo 2026", type: "text" },
        { key: "channel", label: "Channel", placeholder: "Google Ads / Meta / Email", type: "text" },
        { key: "duration", label: "Duration", placeholder: "Jan 2026 - Mar 2026", type: "text" },
        { key: "result", label: "Outcome", placeholder: "ROAS 4.2x, CPL reduced 28%", type: "textarea" }
      ]
    },
    {
      key: "contentPortfolio",
      label: "Content & Brand Work",
      description: "Add best content or social media execution examples.",
      template: {
        title: "",
        platform: "",
        objective: "",
        link: ""
      },
      fields: [
        { key: "title", label: "Content Title", placeholder: "Product Launch Sequence", type: "text" },
        { key: "platform", label: "Platform", placeholder: "Facebook, YouTube, LinkedIn", type: "text" },
        { key: "objective", label: "Objective", placeholder: "Lead generation / engagement", type: "text" },
        { key: "link", label: "Link", placeholder: "https://...", type: "url" }
      ]
    }
  ],
  "Cybersecurity & Infrastructure": [
    {
      key: "securityProjects",
      label: "Security Projects",
      description: "Highlight security improvements, audits, and remediation outcomes.",
      template: {
        projectName: "",
        scope: "",
        tools: "",
        outcome: ""
      },
      fields: [
        { key: "projectName", label: "Project Name", placeholder: "Vulnerability Hardening Program", type: "text" },
        { key: "scope", label: "Scope", placeholder: "Web app + network perimeter", type: "text" },
        { key: "tools", label: "Tools", placeholder: "Nessus, Burp Suite, SIEM", type: "text" },
        { key: "outcome", label: "Outcome", placeholder: "Closed 95% high-risk issues", type: "textarea" }
      ]
    },
    {
      key: "incidentHandling",
      label: "Incident Handling",
      description: "Add incidents handled and response effectiveness.",
      template: {
        incidentType: "",
        actionTaken: "",
        responseTime: "",
        result: ""
      },
      fields: [
        { key: "incidentType", label: "Incident Type", placeholder: "Ransomware attempt / DDoS", type: "text" },
        { key: "actionTaken", label: "Action Taken", placeholder: "Containment, forensics, patching", type: "textarea" },
        { key: "responseTime", label: "Response Time", placeholder: "Within 45 minutes", type: "text" },
        { key: "result", label: "Result", placeholder: "Service restored with no data loss", type: "text" }
      ]
    }
  ],
  "Cloud, DevOps & SRE": [
    {
      key: "devopsProjects",
      label: "DevOps Implementations",
      description: "Show automation, CI/CD and deployment improvements.",
      template: {
        projectName: "",
        stack: "",
        automation: "",
        impact: ""
      },
      fields: [
        { key: "projectName", label: "Project Name", placeholder: "CI/CD Modernization", type: "text" },
        { key: "stack", label: "Stack", placeholder: "Docker, Kubernetes, GitHub Actions", type: "text" },
        { key: "automation", label: "Automation Scope", placeholder: "Build, test, deploy, rollback", type: "text" },
        { key: "impact", label: "Impact", placeholder: "Deployment time reduced from 2h to 20m", type: "textarea" }
      ]
    },
    {
      key: "infraOwnership",
      label: "Infrastructure Ownership",
      description: "Capture reliability metrics and platform scale.",
      template: {
        environment: "",
        uptime: "",
        scale: "",
        notes: ""
      },
      fields: [
        { key: "environment", label: "Environment", placeholder: "Production + staging", type: "text" },
        { key: "uptime", label: "Uptime/SLA", placeholder: "99.95%", type: "text" },
        { key: "scale", label: "Scale", placeholder: "120+ services, 2M MAU", type: "text" },
        { key: "notes", label: "Notes", placeholder: "On-call rotation, incident postmortems", type: "textarea" }
      ]
    }
  ],
  "UI/UX & Creative Design": [
    {
      key: "caseStudies",
      label: "Case Studies",
      description: "Include user problem, design process, and measurable result.",
      template: {
        projectName: "",
        role: "",
        tools: "",
        outcome: "",
        link: ""
      },
      fields: [
        { key: "projectName", label: "Project Name", placeholder: "Checkout UX Redesign", type: "text" },
        { key: "role", label: "Role", placeholder: "Lead Product Designer", type: "text" },
        { key: "tools", label: "Tools", placeholder: "Figma, FigJam, Adobe", type: "text" },
        { key: "outcome", label: "Outcome", placeholder: "Cart abandonment down 18%", type: "textarea" },
        { key: "link", label: "Case Study Link", placeholder: "https://...", type: "url" }
      ]
    },
    {
      key: "designAssets",
      label: "Design Portfolio Highlights",
      description: "Provide notable design assets for hiring review.",
      template: {
        assetType: "",
        brand: "",
        tool: "",
        link: ""
      },
      fields: [
        { key: "assetType", label: "Asset Type", placeholder: "Brand kit / Social creatives", type: "text" },
        { key: "brand", label: "Brand/Client", placeholder: "Acme Corp", type: "text" },
        { key: "tool", label: "Primary Tool", placeholder: "Photoshop / Illustrator / After Effects", type: "text" },
        { key: "link", label: "Asset Link", placeholder: "https://...", type: "url" }
      ]
    }
  ],
  "AI & Emerging Technologies": [
    {
      key: "aiProjects",
      label: "AI / Emerging Tech Projects",
      description: "Show models or systems and the value they delivered.",
      template: {
        projectName: "",
        modelOrTech: "",
        dataOrPlatform: "",
        impact: "",
        link: ""
      },
      fields: [
        { key: "projectName", label: "Project Name", placeholder: "Support Ticket Auto-Triage", type: "text" },
        { key: "modelOrTech", label: "Model/Tech", placeholder: "LLM + RAG / CV model / Blockchain", type: "text" },
        { key: "dataOrPlatform", label: "Dataset/Platform", placeholder: "Internal docs, Ethereum testnet", type: "text" },
        { key: "impact", label: "Impact", placeholder: "Resolution speed improved 30%", type: "textarea" },
        { key: "link", label: "Project Link", placeholder: "https://...", type: "url" }
      ]
    },
    {
      key: "experiments",
      label: "Research / Experiments",
      description: "Capture experimentation mindset and measurable outputs.",
      template: {
        objective: "",
        approach: "",
        metric: "",
        result: ""
      },
      fields: [
        { key: "objective", label: "Objective", placeholder: "Improve intent classification", type: "text" },
        { key: "approach", label: "Approach", placeholder: "Fine-tuned transformer with prompt eval", type: "textarea" },
        { key: "metric", label: "Metric", placeholder: "F1, BLEU, latency, gas fee", type: "text" },
        { key: "result", label: "Result", placeholder: "F1 improved from 0.72 to 0.84", type: "text" }
      ]
    }
  ],
  "QA, Testing & Maintenance": [
    {
      key: "qaProjects",
      label: "QA Projects",
      description: "Demonstrate testing scope, tooling, and release quality impact.",
      template: {
        product: "",
        testType: "",
        tools: "",
        result: ""
      },
      fields: [
        { key: "product", label: "Product/System", placeholder: "E-commerce platform", type: "text" },
        { key: "testType", label: "Test Type", placeholder: "Manual + API + automation", type: "text" },
        { key: "tools", label: "Tools", placeholder: "Selenium, Postman, JMeter", type: "text" },
        { key: "result", label: "Result", placeholder: "Production defects reduced by 45%", type: "textarea" }
      ]
    },
    {
      key: "bugHighlights",
      label: "Bug Handling Highlights",
      description: "Show severity handling, fix cycle, and collaboration quality.",
      template: {
        issueType: "",
        severity: "",
        resolution: "",
        turnaround: ""
      },
      fields: [
        { key: "issueType", label: "Issue Type", placeholder: "Payment flow failure", type: "text" },
        { key: "severity", label: "Severity", placeholder: "Critical / High / Medium", type: "text" },
        { key: "resolution", label: "Resolution", placeholder: "Root-cause trace + test coverage patch", type: "textarea" },
        { key: "turnaround", label: "Turnaround", placeholder: "Fixed and verified within 6 hours", type: "text" }
      ]
    }
  ],
  "IT Management & Business Operations": [
    {
      key: "initiatives",
      label: "Initiatives Led",
      description: "Add cross-functional initiatives and delivery outcomes.",
      template: {
        initiative: "",
        teamSize: "",
        methodology: "",
        outcome: ""
      },
      fields: [
        { key: "initiative", label: "Initiative", placeholder: "ERP rollout for finance team", type: "text" },
        { key: "teamSize", label: "Team Size", placeholder: "12 people across 3 departments", type: "text" },
        { key: "methodology", label: "Methodology", placeholder: "Agile Scrum / Waterfall", type: "text" },
        { key: "outcome", label: "Outcome", placeholder: "Go-live in 4 months with 98% adoption", type: "textarea" }
      ]
    },
    {
      key: "operationsHighlights",
      label: "Operations Highlights",
      description: "Show process optimization, governance, and KPI impact.",
      template: {
        functionArea: "",
        tools: "",
        ownership: "",
        impact: ""
      },
      fields: [
        { key: "functionArea", label: "Function Area", placeholder: "Service desk, procurement, PMO", type: "text" },
        { key: "tools", label: "Tools/Systems", placeholder: "JIRA, Odoo, SAP, Freshservice", type: "text" },
        { key: "ownership", label: "Ownership", placeholder: "SLA compliance and escalation policy", type: "text" },
        { key: "impact", label: "Impact", placeholder: "Ticket backlog reduced by 35%", type: "textarea" }
      ]
    }
  ]
};

const asString = (value) => (typeof value === "string" ? value.trim() : "");

const hasRowValue = (row) =>
  Object.values(row || {}).some((value) => (typeof value === "string" ? value.trim().length > 0 : Boolean(value)));

const normalizeRow = (row, template) => {
  const normalized = {};
  Object.keys(template).forEach((key) => {
    normalized[key] = asString(row?.[key]);
  });
  return normalized;
};

export const isSoftwareCategory = (jobCategory) => jobCategory === SOFTWARE_CATEGORY;

export const getCategoryProfileSections = (jobCategory) => CATEGORY_PROFILE_CONFIG[jobCategory] || [];

export const buildCategoryProfileState = (jobCategory, rawProfile = {}) => {
  const sections = getCategoryProfileSections(jobCategory);
  const nextState = {};

  sections.forEach((section) => {
    const sourceRows = Array.isArray(rawProfile?.[section.key]) ? rawProfile[section.key] : [];
    const normalizedRows = sourceRows
      .map((row) => normalizeRow(row, section.template))
      .filter((row) => hasRowValue(row));

    nextState[section.key] = normalizedRows.length ? normalizedRows : [{ ...section.template }];
  });

  return nextState;
};

export const sanitizeCategoryProfile = (jobCategory, rawProfile = {}) => {
  const sections = getCategoryProfileSections(jobCategory);
  const sanitized = {};

  sections.forEach((section) => {
    const sourceRows = Array.isArray(rawProfile?.[section.key]) ? rawProfile[section.key] : [];
    const normalizedRows = sourceRows
      .map((row) => normalizeRow(row, section.template))
      .filter((row) => hasRowValue(row));

    if (normalizedRows.length) {
      sanitized[section.key] = normalizedRows;
    }
  });

  return sanitized;
};

export const getCategoryResumeSections = (jobCategory, rawProfile = {}) => {
  const sections = getCategoryProfileSections(jobCategory);
  const cleaned = sanitizeCategoryProfile(jobCategory, rawProfile);

  return sections
    .map((section) => ({
      ...section,
      items: cleaned[section.key] || []
    }))
    .filter((section) => section.items.length > 0);
};
