const CATEGORIES = [
  { id: "dining", label: "Dining / Restaurants" },
  { id: "groceries", label: "Groceries" },
  { id: "gas", label: "Gas" },
  { id: "travel", label: "Travel" },
  { id: "transit", label: "Transit" },
  { id: "rideshare", label: "Rideshare" },
  { id: "streaming", label: "Streaming Services" },
  { id: "online", label: "Online Shopping" },
  { id: "drugstore", label: "Drugstores" },
  { id: "other", label: "Everything Else" },
];

const DB_NAME = "cardtracker-db";
const DB_VERSION = 1;
const STORE_CARDS = "cards";

const state = {
  cards: [],
  editingCardId: null,
};

const els = {
  categoryPicker: document.getElementById("categoryPicker"),
  result: document.getElementById("result"),
  ranking: document.getElementById("ranking"),
  cardList: document.getElementById("cardList"),
  cardCount: document.getElementById("cardCount"),
  cardForm: document.getElementById("cardForm"),
  formTitle: document.getElementById("formTitle"),
  saveCardBtn: document.getElementById("saveCardBtn"),
  cancelEdit: document.getElementById("cancelEdit"),
  cardName: document.getElementById("cardName"),
  issuer: document.getElementById("issuer"),
  rewardRows: document.getElementById("rewardRows"),
  addRewardRow: document.getElementById("addRewardRow"),
  rewardRowTemplate: document.getElementById("rewardRowTemplate"),
};

let dbPromise;

init().catch((error) => {
  console.error(error);
  els.result.textContent = "Error loading app data.";
});

async function init() {
  populateCategoryPickers();
  wireEvents();
  dbPromise = openDb();
  state.cards = await readCards();
  resetForm();
  render();
  registerServiceWorker();
}

function wireEvents() {
  els.addRewardRow.addEventListener("click", () => addRewardRow());
  els.cancelEdit.addEventListener("click", resetForm);
  els.categoryPicker.addEventListener("change", renderComparison);
  els.cardForm.addEventListener("submit", onSubmitCard);
  els.rewardRows.addEventListener("click", (event) => {
    if (event.target.classList.contains("remove-row")) {
      const row = event.target.closest(".reward-row");
      row?.remove();
    }
  });
  els.cardList.addEventListener("click", async (event) => {
    const editId = event.target.getAttribute("data-edit-id");
    if (editId) {
      startEdit(editId);
      return;
    }

    const deleteId = event.target.getAttribute("data-delete-id");
    if (!deleteId) return;
    await deleteCard(deleteId);
    state.cards = state.cards.filter((card) => card.id !== deleteId);
    if (state.editingCardId === deleteId) {
      resetForm();
    }
    render();
  });
}

function populateCategoryPickers() {
  const pickerHtml = CATEGORIES.map(
    (cat) => `<option value="${cat.id}">${cat.label}</option>`,
  ).join("");
  els.categoryPicker.innerHTML = pickerHtml;
}

function addRewardRow(category = "other", multiplier = "1") {
  const fragment = els.rewardRowTemplate.content.cloneNode(true);
  const row = fragment.querySelector(".reward-row");
  const categorySelect = row.querySelector(".reward-category");
  const multiplierInput = row.querySelector(".reward-multiplier");

  categorySelect.innerHTML = CATEGORIES.map(
    (cat) => `<option value="${cat.id}">${cat.label}</option>`,
  ).join("");
  categorySelect.value = category;
  multiplierInput.value = String(multiplier);
  els.rewardRows.appendChild(fragment);
}

async function onSubmitCard(event) {
  event.preventDefault();
  const name = els.cardName.value.trim();
  const issuer = els.issuer.value.trim();
  const rewards = collectRewards();

  if (!name || rewards.length === 0) {
    return;
  }

  const editingCard = state.cards.find((card) => card.id === state.editingCardId);
  const card = {
    id: editingCard?.id || crypto.randomUUID(),
    name,
    issuer,
    rewards,
    createdAt: editingCard?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await saveCard(card);
  if (editingCard) {
    state.cards = state.cards.map((existing) => (existing.id === card.id ? card : existing));
  } else {
    state.cards.push(card);
  }

  resetForm();
  render();
}

function collectRewards() {
  const rows = Array.from(els.rewardRows.querySelectorAll(".reward-row"));
  const map = new Map();

  rows.forEach((row) => {
    const category = row.querySelector(".reward-category")?.value;
    const multiplierRaw = row.querySelector(".reward-multiplier")?.value;
    const multiplier = Number(multiplierRaw);
    if (!category || Number.isNaN(multiplier) || multiplier <= 0) return;

    const currentBest = map.get(category) || 0;
    map.set(category, Math.max(multiplier, currentBest));
  });

  return Array.from(map.entries()).map(([category, multiplier]) => ({
    category,
    multiplier,
  }));
}

function render() {
  renderCards();
  renderComparison();
}

function renderCards() {
  els.cardCount.textContent = `${state.cards.length} ${state.cards.length === 1 ? "card" : "cards"}`;
  if (state.cards.length === 0) {
    els.cardList.innerHTML = `<li class="muted">No cards yet. Add one below.</li>`;
    return;
  }

  const html = state.cards
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((card) => {
      const tags = card.rewards
        .map((reward) => {
          const label = CATEGORIES.find((cat) => cat.id === reward.category)?.label || reward.category;
          return `<span class="tag">${label}: ${reward.multiplier}x</span>`;
        })
        .join("");
      return `
        <li>
          <div class="card-header">
            <div>
              <div class="card-title">${escapeHtml(card.name)}</div>
              <div class="issuer">${escapeHtml(card.issuer || "No issuer")}</div>
            </div>
            <div class="card-actions">
              <button class="secondary" data-edit-id="${card.id}" aria-label="Edit ${escapeHtml(card.name)}">Edit</button>
              <button class="ghost" data-delete-id="${card.id}" aria-label="Delete ${escapeHtml(card.name)}">Delete</button>
            </div>
          </div>
          <div class="tags">${tags}</div>
        </li>
      `;
    })
    .join("");

  els.cardList.innerHTML = html;
}

function renderComparison() {
  const category = els.categoryPicker.value || "other";
  const scored = state.cards
    .map((card) => {
      const match = card.rewards.find((reward) => reward.category === category);
      const fallback = card.rewards.find((reward) => reward.category === "other");
      const multiplier = match?.multiplier || fallback?.multiplier || 1;
      return { card, multiplier };
    })
    .sort((a, b) => b.multiplier - a.multiplier);

  if (scored.length === 0) {
    els.result.textContent = "Add at least one card to compare.";
    els.result.classList.add("muted");
    els.ranking.innerHTML = "";
    return;
  }

  const [best] = scored;
  const categoryLabel = CATEGORIES.find((cat) => cat.id === category)?.label || category;
  els.result.classList.remove("muted");
  els.result.innerHTML = `Best card for <strong>${escapeHtml(categoryLabel)}</strong>: <strong>${escapeHtml(best.card.name)}</strong> at <strong>${best.multiplier}x</strong>.`;

  els.ranking.innerHTML = scored
    .map(
      ({ card, multiplier }, idx) => `
      <li class="${idx === 0 ? "best" : ""}">
        <strong>${idx + 1}. ${escapeHtml(card.name)}</strong>
        <span class="muted"> - ${multiplier}x</span>
      </li>`,
    )
    .join("");
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function resetForm() {
  state.editingCardId = null;
  els.cardForm.reset();
  els.formTitle.textContent = "Add Card";
  els.saveCardBtn.textContent = "Save Card";
  els.cancelEdit.hidden = true;
  els.rewardRows.innerHTML = "";
  addRewardRow();
}

function startEdit(cardId) {
  const card = state.cards.find((entry) => entry.id === cardId);
  if (!card) return;

  state.editingCardId = cardId;
  els.formTitle.textContent = "Edit Card";
  els.saveCardBtn.textContent = "Update Card";
  els.cancelEdit.hidden = false;
  els.cardName.value = card.name;
  els.issuer.value = card.issuer || "";
  els.rewardRows.innerHTML = "";
  card.rewards.forEach((reward) => addRewardRow(reward.category, reward.multiplier));
  if (card.rewards.length === 0) {
    addRewardRow();
  }
}

function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_CARDS)) {
        db.createObjectStore(STORE_CARDS, { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function readCards() {
  const db = await dbPromise;
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_CARDS, "readonly");
    const store = tx.objectStore(STORE_CARDS);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

async function saveCard(card) {
  const db = await dbPromise;
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_CARDS, "readwrite");
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.objectStore(STORE_CARDS).put(card);
  });
}

async function deleteCard(id) {
  const db = await dbPromise;
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_CARDS, "readwrite");
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.objectStore(STORE_CARDS).delete(id);
  });
}

async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  try {
    await navigator.serviceWorker.register("/sw.js");
  } catch (error) {
    console.error("Service worker registration failed", error);
  }
}
