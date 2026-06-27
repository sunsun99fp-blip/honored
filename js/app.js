/*
 * Honored - 앱 UI (app.js)
 * ====================================================
 * 화면(Hero / 여행지 목록 / 상세 / 일정표)을 그리고,
 * 저장은 HonoredStore 에만 맡깁니다. 데이터는 HONORED_DATA 에서 읽습니다.
 *
 * 라우팅: 주소창의 # 뒤 경로로 화면을 전환합니다.
 *   #/                     → 홈(Hero + 여행지 목록)
 *   #/destination/<id>     → 여행지 상세
 *   #/itinerary            → 내 일정표
 */
(function () {
  "use strict";

  const DATA = window.HONORED_DATA;
  const Store = window.HonoredStore;
  const app = document.getElementById("app");
  const navBadge = document.getElementById("navBadge");

  const CAT_ICON = { 맛집: "🍽️", 카페: "☕", 볼거리: "📷" };
  const CAT_ORDER = ["볼거리", "맛집", "카페"];

  // ---------- 작은 도우미 ----------
  function el(html) {
    const t = document.createElement("template");
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[c]));
  }
  function toast(msg) {
    let t = document.querySelector(".toast");
    if (!t) {
      t = el('<div class="toast" role="status"></div>');
      document.body.appendChild(t);
    }
    t.textContent = msg;
    requestAnimationFrame(() => t.classList.add("show"));
    clearTimeout(t._timer);
    t._timer = setTimeout(() => t.classList.remove("show"), 1800);
  }
  async function refreshBadge() {
    const n = await Store.count();
    if (n > 0) {
      navBadge.textContent = n;
      navBadge.hidden = false;
    } else {
      navBadge.hidden = true;
    }
  }
  function setActiveNav(name) {
    document.querySelectorAll(".nav-link").forEach((a) => {
      a.classList.toggle("active", a.dataset.nav === name);
    });
  }

  // ====================================================
  //  화면 1. 홈 (Hero + 여행지 목록)
  // ====================================================
  async function renderHome() {
    setActiveNav("home");
    const previews = DATA.destinations
      .slice(0, 4)
      .map(
        (d) => `
        <a class="preview-card" href="#/destination/${d.id}" style="background:${d.gradient}">
          <span class="pc-emoji">${d.emoji}</span>
          <span>
            <span class="pc-name">${esc(d.name)}</span><br />
            <span class="pc-tag">${esc(d.tagline)}</span>
          </span>
        </a>`
      )
      .join("");

    app.innerHTML = `
      <section class="hero">
        <div class="container hero-inner">
          <div class="hero-copy">
            <span class="eyebrow">시니어를 위한 여행 일정 플래너</span>
            <h1>여행지부터 주변 <span class="accent">맛집·볼거리</span>까지,<br />나만의 여행 일정을 만들어보세요</h1>
            <p class="hero-lead">
              인기 여행지를 둘러보고 마음에 드는 곳을 담으면,
              날짜별 일정표가 완성됩니다. 로그인 없이 바로 시작하세요.
            </p>
            <div class="hero-cta">
              <a class="btn btn-primary" href="#destinations">여행지 둘러보기</a>
              <a class="btn btn-on-dark btn-outline" style="border-color:rgba(255,255,255,.4);color:#fff" href="#/itinerary">내 일정표 보기</a>
            </div>
            <p class="hero-note">큰 글자와 편한 화면으로, 누구나 쉽게 사용할 수 있습니다.</p>
          </div>
          <div class="hero-preview">${previews}</div>
        </div>
      </section>

      <section class="section" id="destinations">
        <div class="container">
          <div class="section-head">
            <span class="eyebrow">인기 여행지</span>
            <h2>어디로 떠나볼까요?</h2>
            <p>여행지를 누르면 주변 맛집·카페·볼거리를 볼 수 있어요.</p>
          </div>
          <div class="dest-grid">
            ${DATA.destinations.map(destCardHTML).join("")}
          </div>
        </div>
      </section>
    `;

    // 카드 전체를 클릭 가능하게
    app.querySelectorAll("[data-dest]").forEach((card) => {
      card.addEventListener("click", () => {
        location.hash = "#/destination/" + card.dataset.dest;
      });
    });
  }

  function destCardHTML(d) {
    return `
      <article class="dest-card" data-dest="${d.id}" role="link" tabindex="0">
        <div class="dest-cover" style="background:${d.gradient}">
          <span class="cover-region">${esc(d.region)}</span>
          <span class="cover-name">${esc(d.name)}</span>
          <span class="cover-emoji">${d.emoji}</span>
        </div>
        <div class="dest-body">
          <p class="dest-tagline">${esc(d.tagline)}</p>
          <p class="dest-desc">${esc(d.description)}</p>
          <div class="dest-foot">
            <span class="dest-count">맛집·카페·볼거리 ${d.places.length}곳</span>
            <span class="dest-go">둘러보기 →</span>
          </div>
        </div>
      </article>`;
  }

  // ====================================================
  //  화면 2. 여행지 상세
  // ====================================================
  async function renderDestination(id) {
    setActiveNav("home");
    const d = DATA.getDestination(id);
    if (!d) {
      app.innerHTML = `<section class="section"><div class="container">
        <p>여행지를 찾을 수 없습니다.</p>
        <a class="btn btn-outline" href="#/">← 홈으로</a></div></section>`;
      return;
    }

    const groups = CAT_ORDER.map((cat) => {
      const items = d.places.filter((p) => p.category === cat);
      if (!items.length) return "";
      return `
        <div class="category-group">
          <div class="category-head">
            <span class="cat-icon">${CAT_ICON[cat]}</span>
            <h3>${cat}</h3>
          </div>
          <div class="place-grid">
            ${items.map((p) => placeCardHTML(p, d)).join("")}
          </div>
        </div>`;
    }).join("");

    app.innerHTML = `
      <section class="detail-hero" style="background:${d.gradient}">
        <div class="container">
          <a class="back-link" href="#/">← 여행지 목록</a>
          <span class="detail-region">${esc(d.region)}</span>
          <h1>${d.emoji} ${esc(d.name)}</h1>
          <p class="detail-desc">${esc(d.description)}</p>
        </div>
      </section>
      <section class="section">
        <div class="container">
          ${groups}
          <div style="margin-top:40px">
            <a class="btn btn-primary" href="#/itinerary">담은 장소로 일정표 만들기 →</a>
          </div>
        </div>
      </section>
    `;

    // 각 "담기" 버튼 상태 반영 + 이벤트 연결
    for (const btn of app.querySelectorAll("[data-add]")) {
      const placeId = btn.dataset.add;
      const saved = await Store.isSaved(placeId);
      paintAddBtn(btn, saved);
      btn.addEventListener("click", async () => {
        const isSaved = await Store.isSaved(placeId);
        if (isSaved) {
          await Store.removePlace(placeId);
          paintAddBtn(btn, false);
          toast("일정표에서 뺐어요");
        } else {
          const place = { ...d.places.find((p) => p.id === placeId), destinationId: d.id, destinationName: d.name };
          await Store.addPlace(place);
          paintAddBtn(btn, true);
          toast("일정표에 담았어요 ✓");
        }
        refreshBadge();
      });
    }
  }

  function placeCardHTML(p, d) {
    return `
      <article class="place-card">
        <div class="place-top">
          <span class="place-name">${esc(p.name)}</span>
          <span class="cat-pill cat-${p.category}">${p.category}</span>
        </div>
        <p class="place-desc">${esc(p.description)}</p>
        <button class="btn btn-outline" data-add="${p.id}">담기</button>
      </article>`;
  }

  function paintAddBtn(btn, saved) {
    if (saved) {
      btn.classList.add("btn-saved");
      btn.classList.remove("btn-outline");
      btn.textContent = "담음 ✓ (다시 누르면 빼기)";
    } else {
      btn.classList.remove("btn-saved");
      btn.classList.add("btn-outline");
      btn.textContent = "담기";
    }
  }

  // ====================================================
  //  화면 3. 내 일정표
  // ====================================================
  async function renderItinerary() {
    setActiveNav("itinerary");
    const data = await Store.getItinerary();

    if (data.items.length === 0) {
      app.innerHTML = `
        <section class="itin-head">
          <div class="container">
            <h1>내 여행 일정표</h1>
            <p>마음에 드는 장소를 담으면 여기에 날짜별로 정리됩니다.</p>
          </div>
        </section>
        <section class="section">
          <div class="container">
            <div class="empty-state">
              <div class="es-emoji">🧳</div>
              <h3>아직 담은 장소가 없어요</h3>
              <p>여행지를 둘러보고 마음에 드는 맛집·카페·볼거리를 담아보세요.</p>
              <a class="btn btn-primary" href="#/">여행지 둘러보기</a>
            </div>
          </div>
        </section>`;
      return;
    }

    const dayBlocks = [];
    for (let day = 1; day <= data.dayCount; day++) {
      const items = data.items.filter((it) => it.day === day);
      const rows = items
        .map((it, idx) => itinRowHTML(it, idx, items.length, data.dayCount))
        .join("");
      dayBlocks.push(`
        <div class="day-block">
          <div class="day-title">Day ${day}</div>
          ${
            items.length
              ? `<ul class="day-items">${rows}</ul>`
              : `<div class="day-empty">이 날짜에 담은 장소가 없습니다. 아래 장소의 ‘날짜 변경’으로 옮겨보세요.</div>`
          }
        </div>`);
    }

    app.innerHTML = `
      <section class="itin-head">
        <div class="container">
          <h1>내 여행 일정표</h1>
          <p>담은 장소 ${data.items.length}곳 · ${data.dayCount}일 일정</p>
        </div>
      </section>
      <section class="section">
        <div class="container">
          <div class="itin-toolbar">
            <button class="btn btn-ghost btn-sm" id="addDayBtn">＋ 날짜 추가</button>
            <button class="btn btn-ghost btn-sm" id="removeDayBtn" ${data.dayCount <= 1 ? "disabled" : ""}>－ 날짜 빼기</button>
            <span class="spacer"></span>
            <a class="btn btn-outline btn-sm" href="#/">여행지 더 담기</a>
            <button class="btn btn-ghost btn-sm" id="clearBtn">전체 비우기</button>
          </div>

          ${dayBlocks.join("")}

          <div class="share-card">
            <h3>일정표 공유하기</h3>
            <p>아래 내용을 복사해 가족이나 친구에게 메시지로 보낼 수 있어요.</p>
            <textarea class="share-text" id="shareText" readonly>${esc(buildShareText(data))}</textarea>
            <div class="share-actions">
              <button class="btn btn-primary" id="copyBtn">📋 일정표 복사하기</button>
              <span class="copied-msg" id="copiedMsg" hidden>복사되었습니다 ✓</span>
            </div>
          </div>
        </div>
      </section>`;

    wireItineraryEvents(data);
  }

  function itinRowHTML(it, idx, total, dayCount) {
    const dayOptions = [];
    for (let d = 1; d <= dayCount; d++) {
      dayOptions.push(
        `<option value="${d}" ${d === it.day ? "selected" : ""}>Day ${d}로</option>`
      );
    }
    return `
      <li class="itin-item" data-place="${it.placeId}">
        <span class="itin-order">${idx + 1}</span>
        <div class="itin-info">
          <div class="ii-name">${esc(it.name)}
            <span class="cat-pill cat-${it.category}" style="margin-left:6px">${it.category}</span>
          </div>
          <div class="ii-meta">${esc(it.destinationName)}</div>
        </div>
        <div class="itin-controls">
          <button class="icon-btn" data-move="up" ${idx === 0 ? "disabled" : ""} aria-label="위로">▲</button>
          <button class="icon-btn" data-move="down" ${idx === total - 1 ? "disabled" : ""} aria-label="아래로">▼</button>
          <select class="day-select" data-setday aria-label="날짜 변경">${dayOptions.join("")}</select>
          <button class="icon-btn danger" data-remove aria-label="빼기">✕</button>
        </div>
      </li>`;
  }

  function wireItineraryEvents() {
    app.querySelector("#addDayBtn").addEventListener("click", async () => {
      await Store.addDay();
      renderItinerary();
    });
    app.querySelector("#removeDayBtn").addEventListener("click", async () => {
      await Store.removeDay();
      renderItinerary();
    });
    app.querySelector("#clearBtn").addEventListener("click", async () => {
      if (confirm("담은 장소와 일정표를 모두 비울까요?")) {
        await Store.clear();
        await refreshBadge();
        renderItinerary();
      }
    });

    app.querySelectorAll(".itin-item").forEach((row) => {
      const placeId = row.dataset.place;
      row.querySelector('[data-move="up"]').addEventListener("click", async () => {
        await Store.move(placeId, "up");
        renderItinerary();
      });
      row.querySelector('[data-move="down"]').addEventListener("click", async () => {
        await Store.move(placeId, "down");
        renderItinerary();
      });
      row.querySelector("[data-setday]").addEventListener("change", async (e) => {
        await Store.setDay(placeId, parseInt(e.target.value, 10));
        renderItinerary();
      });
      row.querySelector("[data-remove]").addEventListener("click", async () => {
        await Store.removePlace(placeId);
        await refreshBadge();
        renderItinerary();
      });
    });

    // 복사
    app.querySelector("#copyBtn").addEventListener("click", async () => {
      const text = app.querySelector("#shareText").value;
      const ok = await copyText(text);
      const msg = app.querySelector("#copiedMsg");
      if (ok) {
        msg.hidden = false;
        setTimeout(() => (msg.hidden = true), 2200);
        toast("일정표를 복사했어요 ✓");
      } else {
        toast("복사가 안 되면 위 칸을 길게 눌러 직접 복사하세요");
      }
    });
  }

  function buildShareText(data) {
    const lines = ["[Honored] 나의 여행 일정표", ""];
    for (let day = 1; day <= data.dayCount; day++) {
      const items = data.items.filter((it) => it.day === day);
      lines.push(`■ Day ${day}`);
      if (!items.length) {
        lines.push("  (담은 장소 없음)");
      } else {
        items.forEach((it, i) => {
          lines.push(`  ${i + 1}. ${it.name} (${it.category}) · ${it.destinationName}`);
        });
      }
      lines.push("");
    }
    lines.push("— Honored 에서 만든 일정표 ✈️");
    return lines.join("\n");
  }

  async function copyText(text) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (e) {
      /* 아래 폴백으로 */
    }
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch (e) {
      return false;
    }
  }

  // ====================================================
  //  라우터
  // ====================================================
  async function router() {
    const hash = location.hash || "#/";
    window.scrollTo(0, 0);

    const m = hash.match(/^#\/destination\/(.+)$/);
    if (m) {
      await renderDestination(decodeURIComponent(m[1]));
    } else if (hash.startsWith("#/itinerary")) {
      await renderItinerary();
    } else {
      await renderHome();
      // #destinations 같은 앵커로 들어온 경우 부드럽게 이동
      if (hash.startsWith("#destinations")) {
        const target = document.getElementById("destinations");
        if (target) target.scrollIntoView({ behavior: "smooth" });
      }
    }
    await refreshBadge();
  }

  window.addEventListener("hashchange", router);
  window.addEventListener("DOMContentLoaded", router);
  // 스크립트가 이미 로드된 시점(DOM 준비됨)이면 즉시 실행
  if (document.readyState !== "loading") router();
})();
