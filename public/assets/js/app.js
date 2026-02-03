async function fetchJson(url) {
  const res = await fetch(url, { headers: { "Accept": "application/json" } });
  if (!res.ok) throw new Error(`Request failed: ${res.status} ${res.statusText}`);
  return res.json();
}

function normalize(s) {
  return (s ?? "").toString().toLowerCase().trim();
}

function matchesKeyword(a, keyword) {
  const k = normalize(keyword);
  if (!k) return true;
  const haystack = [
    a.processName,
    a.content,
    a.location
  ].map(normalize).join(" | ");
  return haystack.includes(k);
}

function renderTable(rows) {
  const tbody = document.querySelector("#assessmentsBody");
  tbody.innerHTML = "";

  if (!rows.length) {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td colspan="12" style="padding: 12px;">No results.</td>`;
    tbody.appendChild(tr);
    return;
  }

  for (const a of rows) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><a href="#" data-id="${a.id}" class="viewLink">${a.processName ?? ""}</a></td>
      <td title="${a.content ?? ""}">${(a.content ?? "").slice(0, 40)}${(a.content ?? "").length > 40 ? "…" : ""}</td>
      <td>${a.informationController ?? ""}</td>
      <td>${a.medium ?? ""}</td>
      <td>${a.location ?? ""}</td>
      <td>${a.securityClassification ?? ""}</td>
      <td>${a.pib ?? ""}</td>
      <td>${a.fctFunction ?? ""}</td>
      <td>${a.fctActivity ?? ""}</td>
      <td>${a.status ?? ""}</td>
      <td>${a.lastUpdated ?? ""}</td>
      <td class="actions">
        <button class="btn" data-action="view" data-id="${a.id}">View</button>
        <button class="btn" data-action="edit" data-id="${a.id}" ${a.status === "Approved" ? "disabled" : ""}>Edit</button>
        <button class="btn" data-action="submit" data-id="${a.id}" ${a.status === "Draft" ? "" : "disabled"}>Submit</button>
      </td>
    `;
    tbody.appendChild(tr);
  }
}

function wireActions(allRows) {
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;

    const action = btn.getAttribute("data-action");
    const id = btn.getAttribute("data-id");
    const row = allRows.find(r => r.id === id);

    if (action === "view") {
      alert(`VIEW: ${row?.processName} (${id})`);
    } else if (action === "edit") {
      alert(`EDIT: ${row?.processName} (${id})`);
    } else if (action === "submit") {
      alert(`SUBMIT FOR REVIEW: ${row?.processName} (${id})`);
    }
  });
}

async function initMyAssessments() {
  const statusEl = document.querySelector("#status");
  const searchEl = document.querySelector("#searchBox");

  try {
    statusEl.textContent = "Loading assessments…";
    const allRows = await fetchJson("/api/assessments");

    let current = [...allRows];
    renderTable(current);
    wireActions(allRows);

    statusEl.textContent = `${current.length} record(s)`;

    searchEl.addEventListener("input", () => {
      const kw = searchEl.value;
      current = allRows.filter(a => matchesKeyword(a, kw));
      renderTable(current);
      statusEl.textContent = `${current.length} record(s)`;
    });

    document.querySelector("#createBtn").addEventListener("click", () => {
      alert("Create New Assessment (placeholder)");
    });

  } catch (err) {
    console.error(err);
    statusEl.textContent = `Error: ${err.message}`;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  // Only run on the My Assessments page
  if (document.querySelector("#assessmentsPage")) initMyAssessments();
});
