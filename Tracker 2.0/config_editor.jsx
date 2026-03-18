import { useState, useEffect } from "react";

// ─── Styles ───────────────────────────────────────────────────────────────
const S = {
  container: { background: "#0f1923", minHeight: "100vh", color: "#e8dcc8", fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif" },
  header: { background: "#1a2530", borderBottom: "1px solid #c9a84c44", padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" },
  title: { fontSize: 18, fontWeight: 600, color: "#c9a84c", letterSpacing: "0.08em", textTransform: "uppercase" },
  nav: { display: "flex", gap: 8, background: "#1a2530", padding: "0 24px", borderBottom: "1px solid #2a3d50" },
  navBtn: (active) => ({
    padding: "12px 16px", background: "none", border: "none", borderBottom: active ? "2px solid #c9a84c" : "2px solid transparent",
    color: active ? "#c9a84c" : "#6a7d8f", fontSize: 13, cursor: "pointer", fontFamily: "inherit"
  }),
  body: { padding: 24, maxWidth: 1100, margin: "0 auto" },
  section: { background: "#1a2530", borderRadius: 8, border: "1px solid #2a3d50", padding: 24, overflowX: "auto" },
  sectionTitle: { fontSize: 14, fontWeight: 600, color: "#c9a84c", marginBottom: 16, letterSpacing: "0.04em" },
  hint: { fontSize: 12, color: "#6a7d8f", marginBottom: 16 },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 },
  field: { display: "flex", flexDirection: "column", gap: 4 },
  label: { fontSize: 11, color: "#6a7d8f", textTransform: "uppercase", letterSpacing: "0.06em" },
  input: { background: "#0f1923", border: "1px solid #2a3d50", borderRadius: 4, padding: "8px 10px", color: "#e8dcc8", fontSize: 14, fontFamily: "inherit" },
  inputSmall: { background: "#0f1923", border: "1px solid #2a3d50", borderRadius: 4, padding: "6px 8px", color: "#e8dcc8", fontSize: 13, fontFamily: "inherit", width: "100%" },
  affix: { fontSize: 13, color: "#6a7d8f" },
  table: { width: "100%", borderCollapse: "collapse", marginBottom: 12 },
  th: { textAlign: "left", padding: "8px 10px", fontSize: 11, color: "#6a7d8f", textTransform: "uppercase", borderBottom: "1px solid #2a3d50" },
  td: { padding: "8px 10px", borderBottom: "1px solid #1e2f3e" },
  addBtn: { background: "#2a3d50", border: "none", borderRadius: 4, padding: "8px 14px", color: "#e8dcc8", fontSize: 12, cursor: "pointer" },
  removeBtn: { background: "#3d1e1e", border: "none", borderRadius: 4, padding: "4px 8px", color: "#e07060", fontSize: 14, cursor: "pointer" },
  actions: { display: "flex", gap: 10, alignItems: "center" },
  saveBtn: { background: "#c9a84c", border: "none", borderRadius: 4, padding: "8px 16px", color: "#0f1923", fontSize: 13, fontWeight: 600, cursor: "pointer" },
  exportBtn: { background: "#2a3d50", border: "none", borderRadius: 4, padding: "8px 14px", color: "#e8dcc8", fontSize: 12, cursor: "pointer" },
  resetBtn: { background: "#3d1e1e", border: "none", borderRadius: 4, padding: "8px 14px", color: "#e07060", fontSize: 12, cursor: "pointer" },
  status: { fontSize: 12, color: "#70AD47" },
  dirty: { fontSize: 11, color: "#e07060" },
  loading: { display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", color: "#6a7d8f", background: "#0f1923" },
  backLink: { fontSize: 12, color: "#6a7d8f", textDecoration: "none" }
};

// ─── Input Components (defined outside to avoid re-creation on render) ──────
const getVal = (config, path) => path.split(".").reduce((o, k) => o?.[k], config);

const TextInput = ({ label, path, placeholder, config, update }) => (
  <div style={S.field}>
    <label style={S.label}>{label}</label>
    <input
      type="text"
      style={S.input}
      value={getVal(config, path) || ""}
      onChange={e => update(path, e.target.value)}
      placeholder={placeholder}
    />
  </div>
);

const DateInput = ({ label, path, config, update }) => (
  <div style={S.field}>
    <label style={S.label}>{label}</label>
    <input
      type="date"
      style={S.input}
      value={getVal(config, path) || ""}
      onChange={e => update(path, e.target.value)}
    />
  </div>
);

const NumInput = ({ label, path, prefix, suffix, step = 1, config, update }) => (
  <div style={S.field}>
    <label style={S.label}>{label}</label>
    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
      {prefix && <span style={S.affix}>{prefix}</span>}
      <input
        type="number"
        style={{ ...S.input, flex: 1 }}
        value={getVal(config, path) ?? ""}
        onChange={e => update(path, e.target.value === "" ? null : parseFloat(e.target.value))}
        step={step}
      />
      {suffix && <span style={S.affix}>{suffix}</span>}
    </div>
  </div>
);

const PctInput = ({ label, path, config, update }) => {
  const raw = getVal(config, path);
  const pct = raw != null ? (raw * 100).toFixed(2) : "";
  return (
    <div style={S.field}>
      <label style={S.label}>{label}</label>
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <input
          type="number"
          style={{ ...S.input, flex: 1 }}
          value={pct}
          onChange={e => update(path, e.target.value === "" ? null : parseFloat(e.target.value) / 100)}
          step="0.1"
        />
        <span style={S.affix}>%</span>
      </div>
    </div>
  );
};

const SelectInput = ({ label, path, options, config, update }) => (
  <div style={S.field}>
    <label style={S.label}>{label}</label>
    <select
      style={S.input}
      value={getVal(config, path) || ""}
      onChange={e => update(path, e.target.value)}
    >
      {options.map(([val, lbl]) => <option key={val} value={val}>{lbl}</option>)}
    </select>
  </div>
);

const CheckInput = ({ label, path, config, update }) => (
  <div style={{ ...S.field, flexDirection: "row", alignItems: "center", gap: 8 }}>
    <input
      type="checkbox"
      checked={getVal(config, path) || false}
      onChange={e => update(path, e.target.checked)}
      style={{ width: 18, height: 18 }}
    />
    <label style={{ ...S.label, marginBottom: 0 }}>{label}</label>
  </div>
);

// ─── Config Editor Component ────────────────────────────────────────────────
export default function ConfigEditor() {
  const [config, setConfig] = useState(null);
  const [activeSection, setActiveSection] = useState("people");
  const [dirty, setDirty] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const [fileHandle, setFileHandle] = useState(null); // For File System Access API

  // Load config from window.USER_CONFIG or localStorage override
  useEffect(() => {
    const saved = localStorage.getItem("user_config_override");
    if (saved) {
      try {
        setConfig(JSON.parse(saved));
      } catch {
        setConfig(window.USER_CONFIG || getDefaultConfig());
      }
    } else {
      setConfig(window.USER_CONFIG || getDefaultConfig());
    }
  }, []);

  const getDefaultConfig = () => ({
    github: { owner: "", repo: "" },
    people: {
      person1: { name: "Person 1", dob: "1970-01-01" },
      person2: { name: "Person 2", dob: "1970-01-01" },
      hasPerson2: false
    },
    accounts: [],
    holdings: [],
    goal: {
      target: 1000000,
      baseline: 500000,
      baselineDate: new Date().toISOString().slice(0, 10),
      monthlyContrib: 1000,
      rateRequired: 0.07,
      rateProjected: 0.10,
      rateBear: 0.05,
      rateBull: 0.15
    },
    retirement: {
      retireYear: 2035,
      person1: { sipp: 0, isa: 0, spAge: 67 },
      person2: { sipp: 0, isa: 0, spAge: 67, partTimeIncome: 0 },
      lsegPension: 0,
      monthlyContrib: 2000,
      contribGrowth: 0.05,
      dbPensions: [],
      statePension: 11502,
      mortgageBalance: 0,
      mortgageClearAge: 67,
      mortgageAnnualCost: 0,
      usePclsForMortgage: true,
      targetNetIncome: 50000,
      inflationRate: 0.025,
      incomeSteps: [],
      scenarioBear: 0.03,
      scenarioCentral: 0.05,
      scenarioBull: 0.07,
      planToAge: 95,
      houseValue: 500000,
      houseGrowthRate: 0.03,
      mortgageNow: 0,
      mortgageRepaymentPortion: 0,
      mortgageClearAgeIHT: 67,
      ihtNrb: 325000,
      ihtRnrb: 175000,
      ihtRate: 0.40,
      ihtRnrbTaperStart: 2000000
    }
  });

  const update = (path, value) => {
    setConfig(c => {
      const newConfig = JSON.parse(JSON.stringify(c));
      const parts = path.split(".");
      let obj = newConfig;
      for (let i = 0; i < parts.length - 1; i++) {
        if (obj[parts[i]] === undefined) obj[parts[i]] = {};
        obj = obj[parts[i]];
      }
      obj[parts[parts.length - 1]] = value;
      return newConfig;
    });
    setDirty(true);
  };

  const saveToLocalStorage = () => {
    localStorage.setItem("user_config_override", JSON.stringify(config));
    setDirty(false);
    setSaveStatus("saved");
    setTimeout(() => setSaveStatus(null), 2000);
  };

  const exportConfigJS = () => {
    const js = `// user_config.js — auto-generated by Config Editor
// Place this file in your portfolio tracker folder

window.USER_CONFIG = ${JSON.stringify(config, null, 2)};
`;
    const blob = new Blob([js], { type: "application/javascript" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "user_config.js";
    a.click();
    URL.revokeObjectURL(url);
  };

  // File System Access API - direct save to file
  const saveToFile = async () => {
    const js = `// user_config.js — auto-generated by Config Editor\n// Last saved: ${new Date().toISOString()}\n\nwindow.USER_CONFIG = ${JSON.stringify(config, null, 2)};\n`;
    
    try {
      let handle = fileHandle;
      
      // If we don't have a handle yet, prompt user to pick file
      if (!handle) {
        if (!window.showSaveFilePicker) {
          alert("Your browser doesn't support direct file saving. Use 'Export user_config.js' instead.");
          return;
        }
        handle = await window.showSaveFilePicker({
          suggestedName: "user_config.js",
          types: [{
            description: "JavaScript file",
            accept: { "application/javascript": [".js"] }
          }]
        });
        setFileHandle(handle);
      }
      
      // Write to the file
      const writable = await handle.createWritable();
      await writable.write(js);
      await writable.close();
      
      setDirty(false);
      setSaveStatus("file-saved");
      setTimeout(() => setSaveStatus(null), 2000);
    } catch (err) {
      if (err.name !== "AbortError") {
        console.error("Save failed:", err);
        alert("Failed to save: " + err.message);
      }
    }
  };

  const resetToDefaults = () => {
    if (confirm("Reset all config to defaults? This cannot be undone.")) {
      localStorage.removeItem("user_config_override");
      setConfig(getDefaultConfig());
      setDirty(false);
    }
  };

  const clearOverride = () => {
    if (confirm("Clear local overrides and reload from user_config.js?")) {
      localStorage.removeItem("user_config_override");
      setConfig(window.USER_CONFIG || getDefaultConfig());
      setDirty(false);
    }
  };

  if (!config) return <div style={S.loading}>Loading configuration...</div>;

  const p1Name = config.people?.person1?.name || "Person 1";
  const p2Name = config.people?.person2?.name || "Person 2";
  const hasPerson2 = config.people?.hasPerson2 ?? false;

  const sections = [
    { id: "people", label: "People" },
    { id: "accounts", label: "Accounts" },
    { id: "holdings", label: "Holdings" },
    { id: "github", label: "GitHub" },
    { id: "goal", label: "Goal" },
    { id: "retirement", label: "Retirement" },
  ];

  // Helper functions for dynamic arrays
  const accounts = config.accounts || [];
  const addAccount = () => {
    setConfig(c => {
      const newConfig = JSON.parse(JSON.stringify(c));
      newConfig.accounts = [...(newConfig.accounts || []), { id: `account-${Date.now()}`, person: "person1", type: "ISA", provider: "" }];
      return newConfig;
    });
    setDirty(true);
  };
  const removeAccount = (idx) => update("accounts", accounts.filter((_, i) => i !== idx));
  const updateAccount = (idx, field, value) => {
    const newAccounts = [...accounts];
    newAccounts[idx] = { ...newAccounts[idx], [field]: value };
    update("accounts", newAccounts);
  };

  // Holdings helpers
  const holdings = config.holdings || [];
  const addHolding = () => {
    setConfig(c => {
      const newConfig = JSON.parse(JSON.stringify(c));
      newConfig.holdings = [...(newConfig.holdings || []), {
        id: `holding-${Date.now()}`,
        account: accounts[0]?.id || "",
        name: "",
        ticker: "",
        isin: "",
        category: "ETF",
        units: 0,
        purchasePrice: 0,
        purchaseDate: "",
        currency: "GBP",
        type: "Acc"
      }];
      return newConfig;
    });
    setDirty(true);
  };
  const removeHolding = (idx) => update("holdings", holdings.filter((_, i) => i !== idx));
  const updateHolding = (idx, field, value) => {
    const newHoldings = [...holdings];
    newHoldings[idx] = { ...newHoldings[idx], [field]: value };
    update("holdings", newHoldings);
  };

  // Lookup ticker using OpenFIGI API (free, no key required)
  // Works for stocks, ETFs, and funds
  const lookupTicker = async (idx, ticker) => {
    if (!ticker) {
      alert("Please enter a ticker symbol first");
      return;
    }
    try {
      // Try multiple exchange codes for stocks, ETFs and funds
      const queries = [
        { idType: "TICKER", idValue: ticker.toUpperCase(), exchCode: "LN" },   // London Stock Exchange
        { idType: "TICKER", idValue: ticker.toUpperCase(), marketSecDes: "Equity" },  // Equities
        { idType: "TICKER", idValue: ticker.toUpperCase(), securityType2: "ETP" },    // ETFs/ETPs
        { idType: "TICKER", idValue: ticker.toUpperCase(), securityType2: "Open-End Fund" },  // Funds
        { idType: "TICKER", idValue: ticker.toUpperCase() },  // Global fallback
        { idType: "TICKER", idValue: ticker.toUpperCase(), exchCode: "US" },   // US markets
        { idType: "TICKER", idValue: ticker.toUpperCase(), exchCode: "NA" },   // NYSE Arca (US ETFs)
      ];
      
      const figiRes = await fetch("https://api.openfigi.com/v3/mapping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(queries)
      });
      const figiData = await figiRes.json();
      
      // Find first successful result, prefer London-listed
      let match = null;
      let allMatches = [];
      for (const result of figiData) {
        if (result?.data) {
          allMatches.push(...result.data);
        }
      }
      // Prefer London exchange
      match = allMatches.find(m => m.exchCode === "LN") || allMatches[0];
      
      if (match) {
        const secType = match.securityType2 || match.securityType || "";
        // Map API security type to our category
        let category = "Stock";
        if (secType.includes("ETP") || secType.includes("ETF")) category = "ETF";
        else if (secType.includes("Fund") || secType.includes("UCITS")) category = "Fund";
        else if (secType.includes("Bond") || secType.includes("Note")) category = "Bond";
        else if (match.marketSector === "Equity") category = "Stock";
        
        const newHoldings = [...holdings];
        newHoldings[idx] = {
          ...newHoldings[idx],
          name: match.name || newHoldings[idx].name,
          ticker: ticker.toUpperCase(),
          category: category
        };
        update("holdings", newHoldings);
        alert(`Found: ${match.name || ticker}\nCategory: ${category}\nExchange: ${match.exchCode || "N/A"}\n\nNote: ISIN not available from free API - enter manually if needed.`);
      } else {
        alert(`"${ticker}" not found.\n\nTips:\n• For UK ETFs try: VWRL, VUSA, ISF, SWDA\n• For US stocks try: AAPL, MSFT\n• Check spelling\n• Enter details manually if not found`);
      }
    } catch (err) {
      console.error("Lookup failed:", err);
      alert("Lookup failed - please enter details manually");
    }
  };

  const dbPensions = config.retirement?.dbPensions || [];
  const addDbPension = () => {
    update("retirement.dbPensions", [...dbPensions, { person: "person1", name: "", annual: 0, startAge: 65, indexed: false }]);
  };
  const removeDbPension = (idx) => update("retirement.dbPensions", dbPensions.filter((_, i) => i !== idx));
  const updateDbPension = (idx, field, value) => {
    const newPensions = [...dbPensions];
    newPensions[idx] = { ...newPensions[idx], [field]: value };
    update("retirement.dbPensions", newPensions);
  };

  return (
    <div style={S.container}>
      <div style={S.header}>
        <div>
          <div style={S.title}>Configuration Editor</div>
          <a href="./index.html" style={S.backLink}>← Back to Portfolio Tracker</a>
        </div>
        <div style={S.actions}>
          {dirty && <span style={S.dirty}>Unsaved changes</span>}
          {saveStatus === "saved" && <span style={S.status}>✓ Saved to browser</span>}
          {saveStatus === "file-saved" && <span style={S.status}>✓ Saved to file</span>}
          <button style={{...S.saveBtn, background: "#70AD47"}} onClick={saveToFile}>⬇ Save to File</button>
          <button style={S.saveBtn} onClick={saveToLocalStorage}>Save to Browser</button>
          <button style={S.exportBtn} onClick={exportConfigJS}>Export user_config.js</button>
          <button style={S.resetBtn} onClick={clearOverride}>Clear Overrides</button>
        </div>
      </div>

      <div style={S.nav}>
        {sections.map(s => (
          <button key={s.id} style={S.navBtn(activeSection === s.id)} onClick={() => setActiveSection(s.id)}>
            {s.label}
          </button>
        ))}
      </div>

      <div style={S.body}>
        {/* PEOPLE SECTION */}
        {activeSection === "people" && (
          <div style={S.section}>
            <h3 style={S.sectionTitle}>Person 1</h3>
            <div style={S.grid}>
              <TextInput label="Name" path="people.person1.name" placeholder="e.g. John" config={config} update={update} />
              <DateInput label="Date of Birth" path="people.person1.dob" config={config} update={update} />
            </div>
            
            <div style={{ marginTop: 24, marginBottom: 16 }}>
              <CheckInput label="Add a second person (spouse/partner)" path="people.hasPerson2" config={config} update={update} />
            </div>
            
            {hasPerson2 && (
              <>
                <h3 style={S.sectionTitle}>Person 2</h3>
                <div style={S.grid}>
                  <TextInput label="Name" path="people.person2.name" placeholder="e.g. Jane" config={config} update={update} />
                  <DateInput label="Date of Birth" path="people.person2.dob" config={config} update={update} />
                </div>
              </>
            )}
          </div>
        )}

        {/* ACCOUNTS SECTION */}
        {activeSection === "accounts" && (
          <div style={S.section}>
            <p style={S.hint}>Define the accounts you want to track. Each account belongs to a person and has a type.</p>
            <table style={S.table}>
              <thead>
                <tr>
                  <th style={S.th}>Account ID</th>
                  <th style={S.th}>Owner</th>
                  <th style={S.th}>Type</th>
                  <th style={S.th}>Provider</th>
                  <th style={S.th}></th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((acc, i) => (
                  <tr key={i}>
                    <td style={S.td}>
                      <input type="text" style={S.inputSmall} value={acc.id || ""} onChange={e => updateAccount(i, "id", e.target.value)} placeholder="e.g. john-sipp" />
                    </td>
                    <td style={S.td}>
                      <select style={S.inputSmall} value={acc.person || "person1"} onChange={e => updateAccount(i, "person", e.target.value)}>
                        <option value="person1">{p1Name}</option>
                        {hasPerson2 && <option value="person2">{p2Name}</option>}
                      </select>
                    </td>
                    <td style={S.td}>
                      <select style={S.inputSmall} value={acc.type || "ISA"} onChange={e => updateAccount(i, "type", e.target.value)}>
                        <option value="SIPP">SIPP</option>
                        <option value="ISA">ISA</option>
                        <option value="Workplace Pension">Workplace Pension</option>
                        <option value="GIA">GIA</option>
                        <option value="DB Pension">DB Pension</option>
                      </select>
                    </td>
                    <td style={S.td}>
                      <input type="text" style={S.inputSmall} value={acc.provider || ""} onChange={e => updateAccount(i, "provider", e.target.value)} placeholder="e.g. Hargreaves Lansdown" />
                    </td>
                    <td style={S.td}>
                      <button type="button" style={S.removeBtn} onClick={() => removeAccount(i)}>×</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button type="button" style={S.addBtn} onClick={addAccount}>+ Add Account</button>
          </div>
        )}

        {/* HOLDINGS SECTION */}
        {activeSection === "holdings" && (
          <div style={S.section}>
            <p style={S.hint}>Add stocks, ETFs, and funds. Enter a ticker and click 🔍 to lookup the name.</p>
            {accounts.length === 0 ? (
              <p style={{ color: "#e07060" }}>Please add at least one account first.</p>
            ) : (
              <>
                {holdings.map((h, i) => (
                  <div key={i} style={{ background: "#0f1923", borderRadius: 8, padding: 16, marginBottom: 12, border: "1px solid #2a3d50" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                      <span style={{ fontSize: 13, color: "#c9a84c" }}>Holding {i + 1}</span>
                      <button type="button" style={S.removeBtn} onClick={() => removeHolding(i)}>× Remove</button>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12 }}>
                      <div style={S.field}>
                        <label style={S.label}>Account</label>
                        <select style={{...S.input, width: "100%"}} value={h.account || ""} onChange={e => updateHolding(i, "account", e.target.value)}>
                          <option value="">-- Select Account --</option>
                          {accounts.map(acc => (
                            <option key={acc.id} value={acc.id}>{acc.id} ({acc.type})</option>
                          ))}
                        </select>
                      </div>
                      <div style={S.field}>
                        <label style={S.label}>Ticker</label>
                        <div style={{ display: "flex", gap: 4 }}>
                          <input type="text" style={{...S.input, flex: 1}} value={h.ticker || ""} onChange={e => updateHolding(i, "ticker", e.target.value.toUpperCase())} placeholder="e.g. VWRL" />
                          <button type="button" style={{ ...S.addBtn, padding: "6px 10px" }} onClick={() => lookupTicker(i, h.ticker)} title="Lookup ticker">🔍</button>
                        </div>
                      </div>
                      <div style={S.field}>
                        <label style={S.label}>Name</label>
                        <input type="text" style={S.input} value={h.name || ""} onChange={e => updateHolding(i, "name", e.target.value)} placeholder="Auto-filled from lookup" />
                      </div>
                      <div style={S.field}>
                        <label style={S.label}>ISIN</label>
                        <input type="text" style={S.input} value={h.isin || ""} onChange={e => updateHolding(i, "isin", e.target.value.toUpperCase())} placeholder="Optional" />
                      </div>
                      <div style={S.field}>
                        <label style={S.label}>Category</label>
                        <select style={S.input} value={h.category || "ETF"} onChange={e => updateHolding(i, "category", e.target.value)}>
                          <option value="ETF">ETF</option>
                          <option value="Stock">Stock</option>
                          <option value="Fund">Fund</option>
                          <option value="IT">Investment Trust</option>
                          <option value="Bond">Bond</option>
                          <option value="Cash">Cash</option>
                        </select>
                      </div>
                      <div style={S.field}>
                        <label style={S.label}>Units</label>
                        <input type="number" style={S.input} value={h.units ?? ""} onChange={e => updateHolding(i, "units", e.target.value === "" ? 0 : parseFloat(e.target.value))} step="0.0001" />
                      </div>
                      <div style={S.field}>
                        <label style={S.label}>Purchase Price</label>
                        <input type="number" style={S.input} value={h.purchasePrice ?? ""} onChange={e => updateHolding(i, "purchasePrice", e.target.value === "" ? 0 : parseFloat(e.target.value))} step="0.01" />
                      </div>
                      <div style={S.field}>
                        <label style={S.label}>Purchase Date</label>
                        <input type="date" style={S.input} value={h.purchaseDate || ""} onChange={e => updateHolding(i, "purchaseDate", e.target.value)} />
                      </div>
                      <div style={S.field}>
                        <label style={S.label}>Currency</label>
                        <select style={S.input} value={h.currency || "GBP"} onChange={e => updateHolding(i, "currency", e.target.value)}>
                          <option value="GBP">GBP</option>
                          <option value="USD">USD</option>
                          <option value="EUR">EUR</option>
                          <option value="GBX">GBX (pence)</option>
                        </select>
                      </div>
                      <div style={S.field}>
                        <label style={S.label}>Type</label>
                        <select style={S.input} value={h.type || "Acc"} onChange={e => updateHolding(i, "type", e.target.value)}>
                          <option value="Acc">Accumulating</option>
                          <option value="Inc">Income</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
                <button type="button" style={S.addBtn} onClick={addHolding}>+ Add Holding</button>
              </>
            )}
          </div>
        )}

        {/* GITHUB SECTION */}
        {activeSection === "github" && (
          <div style={S.section}>
            <p style={S.hint}>GitHub repo for triggering price refresh workflows.</p>
            <div style={S.grid}>
              <TextInput label="Owner (username)" path="github.owner" placeholder="e.g. jwdaniells" config={config} update={update} />
              <TextInput label="Repository" path="github.repo" placeholder="e.g. portfolio-tracker" config={config} update={update} />
            </div>
          </div>
        )}

        {/* GOAL SECTION */}
        {activeSection === "goal" && (
          <div style={S.section}>
            <p style={S.hint}>Configure your portfolio growth goal and projection rates.</p>
            <div style={S.grid}>
              <NumInput label="Target Value" path="goal.target" prefix="£" config={config} update={update} />
              <NumInput label="Baseline Value" path="goal.baseline" prefix="£" config={config} update={update} />
              <DateInput label="Baseline Date" path="goal.baselineDate" config={config} update={update} />
              <NumInput label="Monthly Contribution" path="goal.monthlyContrib" prefix="£" config={config} update={update} />
            </div>
            <h3 style={{ ...S.sectionTitle, marginTop: 24 }}>Projection Rates</h3>
            <div style={S.grid}>
              <PctInput label="Required Rate" path="goal.rateRequired" config={config} update={update} />
              <PctInput label="Projected Rate" path="goal.rateProjected" config={config} update={update} />
              <PctInput label="Bear Rate" path="goal.rateBear" config={config} update={update} />
              <PctInput label="Bull Rate" path="goal.rateBull" config={config} update={update} />
            </div>
          </div>
        )}

        {/* RETIREMENT SECTION */}
        {activeSection === "retirement" && (
          <div style={S.section}>
            <h3 style={S.sectionTitle}>Retirement Timing</h3>
            <div style={S.grid}>
              <NumInput label="Retire Year" path="retirement.retireYear" config={config} update={update} />
              <NumInput label="Plan To Age" path="retirement.planToAge" config={config} update={update} />
              <NumInput label="Target Net Income (p.a.)" path="retirement.targetNetIncome" prefix="£" config={config} update={update} />
            </div>

            <h3 style={{ ...S.sectionTitle, marginTop: 24 }}>{p1Name}'s Portfolio</h3>
            <div style={S.grid}>
              <NumInput label="SIPP Balance" path="retirement.person1.sipp" prefix="£" config={config} update={update} />
              <NumInput label="ISA Balance" path="retirement.person1.isa" prefix="£" config={config} update={update} />
              <NumInput label="State Pension Age" path="retirement.person1.spAge" config={config} update={update} />
            </div>

            {hasPerson2 && (
              <>
                <h3 style={{ ...S.sectionTitle, marginTop: 24 }}>{p2Name}'s Portfolio</h3>
                <div style={S.grid}>
                  <NumInput label="SIPP Balance" path="retirement.person2.sipp" prefix="£" config={config} update={update} />
                  <NumInput label="ISA Balance" path="retirement.person2.isa" prefix="£" config={config} update={update} />
                  <NumInput label="State Pension Age" path="retirement.person2.spAge" config={config} update={update} />
                  <NumInput label="Part-Time Income" path="retirement.person2.partTimeIncome" prefix="£" suffix="/yr" config={config} update={update} />
                </div>
              </>
            )}

            <h3 style={{ ...S.sectionTitle, marginTop: 24 }}>Workplace Pension & Contributions</h3>
            <div style={S.grid}>
              <NumInput label="Workplace Pension Value" path="retirement.lsegPension" prefix="£" config={config} update={update} />
              <NumInput label="Monthly Contribution" path="retirement.monthlyContrib" prefix="£" config={config} update={update} />
              <PctInput label="Contribution Growth" path="retirement.contribGrowth" config={config} update={update} />
            </div>

            <h3 style={{ ...S.sectionTitle, marginTop: 24 }}>DB Pensions</h3>
            <table style={S.table}>
              <thead>
                <tr>
                  <th style={S.th}>Owner</th>
                  <th style={S.th}>Name</th>
                  <th style={S.th}>Annual</th>
                  <th style={S.th}>Start Age</th>
                  <th style={S.th}>Indexed</th>
                  <th style={S.th}></th>
                </tr>
              </thead>
              <tbody>
                {dbPensions.map((p, i) => (
                  <tr key={i}>
                    <td style={S.td}>
                      <select style={S.inputSmall} value={p.person || "person1"} onChange={e => updateDbPension(i, "person", e.target.value)}>
                        <option value="person1">{p1Name}</option>
                        {hasPerson2 && <option value="person2">{p2Name}</option>}
                      </select>
                    </td>
                    <td style={S.td}>
                      <input type="text" style={S.inputSmall} value={p.name || ""} onChange={e => updateDbPension(i, "name", e.target.value)} placeholder="e.g. Atkins" />
                    </td>
                    <td style={S.td}>
                      <input type="number" style={S.inputSmall} value={p.annual || ""} onChange={e => updateDbPension(i, "annual", parseFloat(e.target.value) || 0)} />
                    </td>
                    <td style={S.td}>
                      <input type="number" style={S.inputSmall} value={p.startAge || 65} onChange={e => updateDbPension(i, "startAge", parseInt(e.target.value) || 65)} />
                    </td>
                    <td style={S.td}>
                      <input type="checkbox" checked={p.indexed || false} onChange={e => updateDbPension(i, "indexed", e.target.checked)} />
                    </td>
                    <td style={S.td}>
                      <button style={S.removeBtn} onClick={() => removeDbPension(i)}>×</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button style={S.addBtn} onClick={addDbPension}>+ Add DB Pension</button>

            <h3 style={{ ...S.sectionTitle, marginTop: 24 }}>State Pension</h3>
            <div style={S.grid}>
              <NumInput label="State Pension (full, p.a.)" path="retirement.statePension" prefix="£" config={config} update={update} />
            </div>

            <h3 style={{ ...S.sectionTitle, marginTop: 24 }}>Mortgage</h3>
            <div style={S.grid}>
              <NumInput label="Current Balance" path="retirement.mortgageBalance" prefix="£" config={config} update={update} />
              <NumInput label={`Clear at ${p1Name} Age`} path="retirement.mortgageClearAge" config={config} update={update} />
              <NumInput label="Annual Cost" path="retirement.mortgageAnnualCost" prefix="£" config={config} update={update} />
              <CheckInput label="Use PCLS for Mortgage" path="retirement.usePclsForMortgage" config={config} update={update} />
            </div>

            <h3 style={{ ...S.sectionTitle, marginTop: 24 }}>Growth Scenarios</h3>
            <div style={S.grid}>
              <PctInput label="Bear Scenario" path="retirement.scenarioBear" config={config} update={update} />
              <PctInput label="Central Scenario" path="retirement.scenarioCentral" config={config} update={update} />
              <PctInput label="Bull Scenario" path="retirement.scenarioBull" config={config} update={update} />
              <PctInput label="Inflation Rate" path="retirement.inflationRate" config={config} update={update} />
            </div>

            <h3 style={{ ...S.sectionTitle, marginTop: 24 }}>Estate / IHT</h3>
            <div style={S.grid}>
              <NumInput label="House Value" path="retirement.houseValue" prefix="£" config={config} update={update} />
              <PctInput label="House Growth Rate" path="retirement.houseGrowthRate" config={config} update={update} />
              <NumInput label="Current Mortgage" path="retirement.mortgageNow" prefix="£" config={config} update={update} />
              <NumInput label="Repayment Portion" path="retirement.mortgageRepaymentPortion" prefix="£" config={config} update={update} />
              <NumInput label="IHT Nil-Rate Band" path="retirement.ihtNrb" prefix="£" config={config} update={update} />
              <NumInput label="IHT Residence NRB" path="retirement.ihtRnrb" prefix="£" config={config} update={update} />
              <PctInput label="IHT Rate" path="retirement.ihtRate" config={config} update={update} />
              <NumInput label="RNRB Taper Start" path="retirement.ihtRnrbTaperStart" prefix="£" config={config} update={update} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
