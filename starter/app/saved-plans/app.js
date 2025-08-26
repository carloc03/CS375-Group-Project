"use strict";

const $ = (sel) => document.querySelector(sel);
const cards = $("#cards");

function showSkeleton(count = 3){
  cards.innerHTML = "";
  for (let i=0;i<count;i++){
    const sk = document.createElement("div");
    sk.className = "skel";
    sk.innerHTML = `
      <div class="bar" style="width:60%"></div>
      <div class="bar" style="width:40%"></div>
      <div class="bar" style="width:80%;height:36px"></div>
    `;
    cards.appendChild(sk);
  }
}

function renderEmpty(){
  cards.innerHTML = `<div class="empty">No saved plans yet.</div>`;
}

function renderError(msg){
  cards.innerHTML = `<div class="error">Failed to load plans. ${msg ? String(msg) : ""}</div>`;
}

function renderPlans(rows){
  cards.innerHTML = "";
  rows.forEach((row, idx) => {
    const card = document.createElement("div");
    card.className = "card";

    const name = document.createElement("div");
    name.className = "name";
    name.textContent = `Plan ${idx + 1}`; // to be changed later

    const meta = document.createElement("div");
    meta.className = "meta";
    const created = row.created_at ? new Date(row.created_at) : null;
    meta.textContent = created
      ? `Created ${created.toLocaleDateString()}`
      : `Planner ID: ${row.id}`;

    const actions = document.createElement("div");
    actions.className = "actions";

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "btn-primary";
    btn.textContent = "View Details";
    btn.setAttribute("aria-label", `View details for Plan ${idx + 1}`);
    btn.addEventListener("click", () => {
      location.assign(`/plan?id=${encodeURIComponent(row.id)}`);
    });

    actions.appendChild(btn);
    card.append(name, meta, actions);
    cards.appendChild(card);
  });
}

async function loadPlans(){
  showSkeleton();
  try {
    const res = await fetch("/plans", { credentials: "include" });
    if (!res.ok) {
      if (res.status === 401) return renderError("Unauthorized. Please log in.");
      throw new Error(`HTTP ${res.status}`);
    }
    const rows = await res.json();
    if (!Array.isArray(rows) || rows.length === 0) return renderEmpty();
    rows.sort((a, b) => Number(a.id) - Number(b.id));
    renderPlans(rows);
  } catch (err) {
    console.error("Error loading plans:", err);
    renderError(err.message);
  }
}

loadPlans();