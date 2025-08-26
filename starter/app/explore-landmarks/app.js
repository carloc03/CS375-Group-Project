(() => {
  const form = document.getElementById("searchForm");
  const cityInput = document.getElementById("city");
  const results = document.getElementById("results");
  const meta = document.getElementById("meta");
  const cardTemplate = document.getElementById("cardTemplate");

  // Logout sends a POST to server, then redirects to landing page
  const logoutBtn = document.getElementById("logout");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      try { await fetch("/logout", { method: "POST" }); } catch {}
      location.href = "/";
    });
  }

  if (location.hash === "#explore") {
    setTimeout(() => document.getElementById("explore")?.scrollIntoView({ behavior: "smooth" }), 0);
  }

  const qs = new URLSearchParams(location.search);

  const setLoading = (msg = "Loading…") => {
    results.innerHTML = "";
    const div = document.createElement("div");
    div.className = "loading";
    div.textContent = msg;
    results.appendChild(div);
  };

  const showMessage = (className, text) => {
    results.innerHTML = "";
    const div = document.createElement("div");
    div.className = className;
    div.textContent = text;
    results.appendChild(div);
  };

  const formatStars = (place) => {
    const r = place.rating ?? null;
    const n = place.user_ratings_total ?? 0;
    const open = place.open_now === null ? "" : place.open_now ? " · Open now" : " · Closed";
    return r ? `⭐ ${r.toFixed(1)} (${n.toLocaleString()})${open}` : `No rating${open}`;
  };

  async function fetchLandmarks(city) {
    const resp = await fetch(`/api/landmarks?city=${encodeURIComponent(city)}`);
    if (!resp.ok) throw new Error("search failed");
    return resp.json();
  }

  function renderList(payload) {
    const { city, landmarks } = payload;
    meta.textContent = `Top places in ${city}`;
    results.innerHTML = "";

    if (!landmarks || landmarks.length === 0) {
      showMessage("empty", "No landmarks found for this city.");
      return;
    }

    for (const p of landmarks) {
      const node = cardTemplate.content.cloneNode(true);

      const img = node.querySelector(".thumb");
      const name = node.querySelector(".name");
      const rating = node.querySelector(".rating");
      const addr = node.querySelector(".address");
      const link = node.querySelector(".maps");

      name.textContent = p.name;
      rating.textContent = formatStars(p);
      addr.textContent = p.address || "";
      link.href = p.maps_url;

      if (p.photo_ref) {
        img.loading = "lazy";
        img.src = `/api/photo?ref=${encodeURIComponent(p.photo_ref)}`;
        img.alt = p.name;
      } else {
        img.alt = "No photo available";
      }

      results.appendChild(node);
    }
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const city = cityInput.value.trim();
    if (!city) return;
    history.replaceState(null, "", `?city=${encodeURIComponent(city)}#explore`);
    document.getElementById("explore")?.scrollIntoView({ behavior: "smooth" });
    meta.textContent = "";
    setLoading();

    try {
      const data = await fetchLandmarks(city);
      renderList(data);
    } catch {
      showMessage("error", "Something went wrong. Try another city.");
    }
  });

  const initialCity = qs.get("city") || "";
  if (initialCity) {
    cityInput.value = initialCity;
    document.getElementById("explore")?.scrollIntoView();
    setLoading();
    fetchLandmarks(initialCity)
      .then(renderList)
      .catch(() => showMessage("error", "Something went wrong. Try another city."));
  }
})();