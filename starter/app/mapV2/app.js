"use strict";

// get plan id from url
let params = new URL(document.location.toString()).searchParams;
let planId = params.get("id");
console.log(planId)

let map, geocoder, infoWindow;
let planItems = [];
let dragSrcIndex = null;

const $ = (id) => document.getElementById(id);
function el(tag, cls, props) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (props) Object.assign(n, props);
  return n;
}
function iconTrash() {
  const i = el("span");
  i.innerHTML =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
    'stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ' +
    'width="18" height="18" aria-hidden="true">' +
    '<polyline points="3 6 5 6 21 6"></polyline>' +
    '<path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path>' +
    '<path d="M10 11v6"></path><path d="M14 11v6"></path>' +
    '<path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"></path></svg>';
  return i;
}

function bootstrapMaps() {
  return fetch("/mapV2/config/maps-api-url", { credentials: "same-origin" })
    .then((res) => res.text().then((t) => {
      if (!res.ok) throw new Error("Config fetch failed");
      return JSON.parse(t);
    }))
    .then((cfg) => new Promise((resolve, reject) => {
      window.initMap = initMap;
      const s = el("script", null, { src: cfg.url + "&callback=initMap", async: true, defer: true });
      s.onload = resolve; s.onerror = reject; document.head.appendChild(s);
    }))
    .catch((e) => {
      console.error("Maps bootstrap error:", e);
      alert("Failed to load Google Maps. Please try again later.");
    });
}
bootstrapMaps();

function initMap() {
  geocoder = new google.maps.Geocoder();
  infoWindow = new google.maps.InfoWindow();

  const fallback = { lat: 39.8283, lng: -98.5795, zoom: 4 }; // sets it to Kansas cuz it's in the middle of the US, the zoom is enough to display the entire country
  map = new google.maps.Map($("map"), {
    center: { lat: fallback.lat, lng: fallback.lng },
    zoom: fallback.zoom,
    mapId: "STEP2_MAP"
  });

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((pos) => {
      map.setCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude });
    }, function(){});
  }
  
  bindMapSearch();

  map.addListener("click", function (e) {
    reverseGeocode(e.latLng)
      .then((r) => showPickBox(e.latLng, r.address, r.short))
      .catch(() => showPickBox(e.latLng, "Unnamed location", ""));
  });

  const saveBtn = $("savePlan");
  if (saveBtn) {
    saveBtn.addEventListener("click", function () {
      const payload = planItems.map((p, i) => ({
        position: i + 1, lat: p.lat, lng: p.lng,
        address: p.address, name: p.name || "", notes: p.notes || ""
      }));
      console.log("Plan items (ordered):", payload);

      fetch("/post-plan?id=" + planId, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            plan: payload
        }),
    }).then(response => {
      console.log("OK");
      location.assign("/plan?id=" + planId);
    });
      alert("Plan saved (client-side only). Check the console for the payload.");
    });
  }

  const clearBtn = $("clearAll");
  if (clearBtn) {
    clearBtn.addEventListener("click", function () {
      if (!planItems.length || !confirm("Remove all locations from this itinerary?")) return;
      planItems.forEach((p) => p.marker?.setMap && p.marker.setMap(null));
      planItems = [];
      renderList();
    });
  }

  renderList();
}

function bindMapSearch(){
  const input = $("placeSearch");
  const go = $("searchBtn");
  if (!input || !go) return;

  const performSearch = () => {
    const q = (input.value || "").trim();
    if (!q) return;
    geocoder.geocode({ address: q }, (results, status) => {
      if (status === "OK" && results && results[0]) {
        const g = results[0].geometry;
        if (g.viewport) {
          map.fitBounds(g.viewport);
        } else if (g.location) {
          map.setCenter(g.location);
          map.setZoom(12);
        }
      } else {
        alert("Place not found. Try a more specific query.");
      }
    });
  };

  go.addEventListener("click", performSearch);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") performSearch();
  });
}

function reverseGeocode(latLng) {
  return new Promise((resolve) => {
    geocoder.geocode({ location: latLng }, (results, status) => {
      if (status === "OK" && results?.[0]) {
        const best = results[0];
        resolve({
          address: best.formatted_address || "Unnamed location",
          short: best.address_components?.[0]?.short_name || ""
        });
      } else {
        resolve({ address: "Unnamed location", short: "" });
      }
    });
  });
}

function showPickBox(latLng, address, short) {
  const box = el("div", "infobox");
  box.append(el("div", "title", { textContent: short || "Picked location" }));
  box.append(el("div", "small", { textContent: address }));

  const row = el("div", "row");
  const addBtn = el("button", "btn primary", { textContent: "Add to plan" });
  const cancelBtn = el("button", "btn ghost", { textContent: "Cancel" });
  row.append(addBtn, cancelBtn);
  box.append(row);

  infoWindow.setContent(box);
  infoWindow.setPosition(latLng);
  infoWindow.open(map);

  cancelBtn.addEventListener("click", () => infoWindow.close());
  addBtn.addEventListener("click", function () {
    const marker = new google.maps.Marker({ position: latLng, map, title: address });
    planItems.push({
      lat: +latLng.lat().toFixed(6),
      lng: +latLng.lng().toFixed(6),
      address,
      name: "", nameLocked: false,
      notes: "", notesLocked: false, notesExpanded: false,
      marker
    });
    infoWindow.close();
    renderList();
  });
}

function removePlace(i) {
  const it = planItems[i];
  if (!it) return;
  it.marker?.setMap && it.marker.setMap(null);
  planItems.splice(i, 1);
  renderList();
}
function setName(i, value, lock) {
  const it = planItems[i]; if (!it) return;
  const name = String(value || "").trim();
  if (!name) {
    alert("Please enter a name for this place.");
    return;
  }
  it.name = name;
  it.nameLocked = !!lock;
  renderList();
}
function toggleNameEdit(i, editing) { setName(i, planItems[i].name, !editing); }
function setNotes(i, value, lock) {
  const it = planItems[i]; if (!it) return;
  it.notes = String(value || "").trim();
  it.notesLocked = !!lock;
  it.notesExpanded = !lock ? true : false;
  renderList();
}
function expandNotes(i)  { const it = planItems[i]; if (!it) return; it.notesLocked = false; it.notesExpanded = true; renderList(); }
function collapseNotes(i){ const it = planItems[i]; if (!it) return; it.notesExpanded = false; renderList(); }

function attachDragEvents(rowEl, index) {
  rowEl.draggable = true;
  rowEl.dataset.index = index;

  rowEl.addEventListener("dragstart", (e) => {
    dragSrcIndex = +rowEl.dataset.index;
    rowEl.classList.add("dragging");
    e.dataTransfer && (e.dataTransfer.effectAllowed = "move", e.dataTransfer.setData("text/plain", dragSrcIndex));
  });
  rowEl.addEventListener("dragover", (e) => { e.preventDefault(); rowEl.classList.add("drag-over"); });
  rowEl.addEventListener("dragleave", () => rowEl.classList.remove("drag-over"));
  rowEl.addEventListener("drop", (e) => {
    e.preventDefault(); rowEl.classList.remove("drag-over");
    const dest = +rowEl.dataset.index;
    if (isNaN(dest) || dragSrcIndex === null || dragSrcIndex === dest) return;
    planItems.splice(dest, 0, planItems.splice(dragSrcIndex, 1)[0]);
    dragSrcIndex = null; renderList();
  });
  rowEl.addEventListener("dragend", () => { rowEl.classList.remove("dragging","drag-over"); dragSrcIndex = null; });
}

function updateHeader() {
  const countEl = $("agendaCount");
  const saveBtn = $("savePlan");
  const clearBtn = $("clearAll");
  if (countEl) countEl.textContent = `(${planItems.length})`;
  const allNamed = planItems.every(p => p.name && p.name.trim() !== "");
  if (saveBtn) saveBtn.disabled = !planItems.length || !allNamed;
  if (clearBtn) clearBtn.disabled = !planItems.length;
}

function renderList() {
  const list = $("planList");
  list.innerHTML = "";
  list.classList.toggle("empty", !planItems.length);
  updateHeader();

  if (!planItems.length) {
    list.append(el("div", "empty-state", { textContent: "No places yet. Click the map to get started." }));
    return;
  }

  planItems.forEach((item, i) => {
    const row = el("div", "item"); attachDragEvents(row, i);

    const left = el("div", "left-col");
    left.append(el("div", "badge", { textContent: "#" + (i + 1) }));

    const del = el("button", "icon-btn danger", { title: "Remove", ariaLabel: "Remove" });
    del.append(iconTrash()); del.addEventListener("click", () => removePlace(i));
    left.append(del);
    row.append(left);

    const meta = el("div", "meta");
    meta.append(
      el("div", "addr",  { textContent: item.address }),
      el("div", "coords",{ textContent: `(${item.lat}, ${item.lng})` })
    );

    const nameRow = el("div", "name-row");
    if (item.nameLocked) {
      const d = el("span", "name-display", { title: "Click to edit", textContent: item.name || "(no label)" });
      d.addEventListener("click", () => toggleNameEdit(i, true));
      nameRow.append(d);
    } else {
      const input = el("input", "name-input", { placeholder: "Enter a name (required)", value: item.name || "", required: true });
      const save  = el("button", "btn sm success", { textContent: "Save" });
      save.addEventListener("click", () => setName(i, input.value, true));
      nameRow.append(input, save);
    }
    meta.append(nameRow);

    const notesWrap = el("div");
    if (item.notesExpanded) {
      notesWrap.className = "notes-row";
      const ta = el("textarea", "notes-input", { placeholder: "Add notes (tips, booking refs, reminders…)", value: item.notes || "" });
      ta.addEventListener("keydown", (ev) => ((ev.ctrlKey || ev.metaKey) && ev.key === "Enter") && setNotes(i, ta.value, true));
      const actions = el("div", "notes-actions");
      const sv = el("button", "btn sm success", { textContent: "Save notes" });
      const ca = el("button", "btn sm ghost",   { textContent: "Cancel" });
      sv.addEventListener("click", () => setNotes(i, ta.value, true));
      ca.addEventListener("click", () => collapseNotes(i));
      actions.append(sv, ca);
      notesWrap.append(ta, actions);
    } else {
      notesWrap.className = "notes-collapsed";
      if ((item.notes || "").trim()) {
        const prev = (item.notes || "").trim();
        const preview = prev.length > 120 ? prev.slice(0, 120) + "…" : prev;
        notesWrap.append(el("div", "notes-preview", { textContent: preview }));
        const edit = el("button", "link-btn", { textContent: "Edit notes" });
        edit.addEventListener("click", () => expandNotes(i));
        notesWrap.append(edit);
      } else {
        const add = el("button", "link-btn", { textContent: "Add notes" });
        add.addEventListener("click", () => expandNotes(i));
        notesWrap.append(add);
      }
    }
    meta.append(notesWrap);

    row.append(meta);
    list.append(row);
  });
}