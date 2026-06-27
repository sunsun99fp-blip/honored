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
  const Auth = window.HonoredAuth;
  const Stats = window.HonoredStats;
  const Recs = window.HonoredRecs;
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
  //  화면 4. 월별 인기 여행지 (검색량 순위 + 관리자 CRUD)
  // ====================================================
  let monthlyMonth = null; // 화면에서 선택된 달 (처음엔 이번 달)

  async function renderMonthly() {
    setActiveNav("monthly");
    if (monthlyMonth == null) monthlyMonth = new Date().getMonth() + 1;
    const month = monthlyMonth;
    const user = Auth ? await Auth.getUser() : null;

    // 그 달의 검색량 읽기
    let stats = [];
    let loadError = false;
    try {
      stats = Stats ? await Stats.getMonthlyStats(month) : [];
    } catch (e) {
      loadError = true;
      console.error("[Honored] 순위 읽기 실패:", e);
    }

    // 여행지 id → 검색량 (없으면 undefined)
    const volById = {};
    stats.forEach((s) => (volById[s.destination_id] = s.search_volume));

    // 여행지 6곳 전체를 검색량 내림차순으로 정렬 (데이터 없으면 맨 뒤)
    const ranked = DATA.destinations
      .map((d) => ({ d: d, volume: volById[d.id] == null ? null : volById[d.id] }))
      .sort((a, b) => (b.volume == null ? -1 : b.volume) - (a.volume == null ? -1 : a.volume));

    const monthOptions = [];
    for (let mo = 1; mo <= 12; mo++) {
      monthOptions.push(`<option value="${mo}" ${mo === month ? "selected" : ""}>${mo}월</option>`);
    }

    const hasAny = stats.length > 0;
    let listHTML;
    if (loadError) {
      listHTML = `<div class="empty-state"><div class="es-emoji">⚠️</div>
        <h3>순위를 불러오지 못했어요</h3>
        <p>인터넷 연결을 확인하고 잠시 후 새로고침해 주세요.</p></div>`;
    } else if (hasAny) {
      listHTML = `<div class="dest-grid">${ranked.map(rankCardHTML).join("")}</div>`;
    } else {
      listHTML = `<div class="empty-state"><div class="es-emoji">📊</div>
        <h3>${month}월 검색량이 아직 없어요</h3>
        <p>${user ? "아래 관리자 칸에서 검색량을 입력하면 순위가 만들어집니다." : "관리자가 검색량을 입력하면 순위가 표시됩니다."}</p></div>`;
    }

    app.innerHTML = `
      <section class="itin-head">
        <div class="container">
          <h1>월별 인기 여행지</h1>
          <p>검색이 많은 여행지를 달별 순위로 보여드려요.</p>
        </div>
      </section>
      <section class="section">
        <div class="container">
          <div class="itin-toolbar">
            <label for="monthSelect" style="font-weight:700">월 선택</label>
            <select class="day-select" id="monthSelect" aria-label="월 선택">${monthOptions.join("")}</select>
            <span class="spacer"></span>
            <span class="dest-count">${month}월 인기 순위</span>
          </div>

          ${listHTML}

          ${adminPanelHTML(user, month, volById)}
        </div>
      </section>`;

    wireMonthly(user, month);
  }

  function rankCardHTML(entry, index) {
    const d = entry.d;
    const rank = index + 1;
    const volText = entry.volume == null ? "데이터 없음" : "검색량 " + entry.volume.toLocaleString();
    return `
      <article class="dest-card" data-dest="${d.id}" role="link" tabindex="0">
        <div class="dest-cover" style="background:${d.gradient}">
          <span class="cover-region">${rank}위 · ${esc(d.region)}</span>
          <span class="cover-name">${esc(d.name)}</span>
          <span class="cover-emoji">${d.emoji}</span>
        </div>
        <div class="dest-body">
          <p class="dest-tagline">${esc(d.tagline)}</p>
          <div class="dest-foot">
            <span class="dest-count">${volText}</span>
            <span class="dest-go">둘러보기 →</span>
          </div>
        </div>
      </article>`;
  }

  function adminPanelHTML(user, month, volById) {
    if (!user) {
      return `
        <div class="share-card" style="margin-top:28px">
          <h3>관리자 로그인</h3>
          <p>여행지 검색량을 입력·수정하려면 관리자 로그인이 필요합니다.
             (일반 방문자는 로그인 없이 순위를 볼 수 있어요.)</p>
          <div style="display:flex;flex-direction:column;gap:12px;max-width:360px">
            <input class="day-select" id="adminEmail" type="email"
                   placeholder="이메일" autocomplete="username" style="width:100%" />
            <input class="day-select" id="adminPw" type="password"
                   placeholder="비밀번호" autocomplete="current-password" style="width:100%" />
            <button class="btn btn-primary" id="loginBtn">로그인</button>
            <span id="loginMsg" style="color:#b13b2e;font-size:15px"></span>
          </div>
        </div>`;
    }

    const rows = DATA.destinations
      .map((d) => {
        const v = volById[d.id];
        const has = v != null;
        return `
          <div class="itin-item">
            <div class="itin-info">
              <div class="ii-name">${d.emoji} ${esc(d.name)}</div>
              <div class="ii-meta">${has ? "현재 " + v.toLocaleString() : "아직 입력 안 됨"}</div>
            </div>
            <div class="itin-controls">
              <input class="day-select" type="number" min="0" step="1"
                     data-vol="${d.id}" value="${has ? v : ""}" placeholder="검색량" style="width:120px" />
              <button class="btn btn-sm btn-primary" data-save="${d.id}">저장</button>
              <button class="icon-btn danger" data-del="${d.id}" ${has ? "" : "disabled"} aria-label="삭제">✕</button>
            </div>
          </div>`;
      })
      .join("");

    return `
      <div class="share-card" style="margin-top:28px">
        <h3>관리자 — ${month}월 검색량 입력</h3>
        <p><strong>${esc(user.email)}</strong> 님으로 로그인됨.
           숫자를 넣고 <b>저장</b>하면 위 순위에 바로 반영돼요. (✕ = 그 달 데이터 삭제)</p>
        <ul class="day-items" style="list-style:none;margin:0;padding:0">${rows}</ul>
        <div class="share-actions" style="margin-top:16px">
          <button class="btn btn-outline" id="logoutBtn">로그아웃</button>
        </div>
      </div>`;
  }

  function wireMonthly(user, month) {
    const sel = app.querySelector("#monthSelect");
    if (sel) {
      sel.addEventListener("change", (e) => {
        monthlyMonth = parseInt(e.target.value, 10);
        renderMonthly();
      });
    }

    // 순위 카드 클릭 → 여행지 상세로 이동
    app.querySelectorAll("[data-dest]").forEach((card) => {
      card.addEventListener("click", () => {
        location.hash = "#/destination/" + card.dataset.dest;
      });
    });

    if (!Auth) return;

    if (!user) {
      app.querySelector("#loginBtn").addEventListener("click", async () => {
        const email = app.querySelector("#adminEmail").value.trim();
        const pw = app.querySelector("#adminPw").value;
        const msg = app.querySelector("#loginMsg");
        msg.textContent = "";
        if (!email || !pw) {
          msg.textContent = "이메일과 비밀번호를 입력하세요.";
          return;
        }
        try {
          await Auth.signIn(email, pw);
          toast("로그인 성공 ✓");
          renderMonthly();
        } catch (e) {
          msg.textContent = "로그인에 실패했어요. 이메일과 비밀번호를 다시 확인해 주세요.";
          console.error("[Honored] 로그인 실패:", e);
        }
      });
      return;
    }

    // 로그인 상태: 로그아웃 + 저장(추가/수정) + 삭제
    app.querySelector("#logoutBtn").addEventListener("click", async () => {
      await Auth.signOut();
      toast("로그아웃했어요");
      renderMonthly();
    });

    app.querySelectorAll("[data-save]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = btn.dataset.save;
        const input = app.querySelector(`[data-vol="${id}"]`);
        const val = parseInt(input.value, 10);
        if (isNaN(val) || val < 0) {
          toast("0 이상의 숫자를 입력하세요");
          return;
        }
        try {
          await Stats.upsertStat(month, id, val);
          toast("저장했어요 ✓");
          renderMonthly();
        } catch (e) {
          toast("저장 실패 — 로그인 상태를 확인해 주세요");
          console.error("[Honored] 저장 실패:", e);
        }
      });
    });

    app.querySelectorAll("[data-del]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = btn.dataset.del;
        try {
          await Stats.deleteStat(month, id);
          toast("삭제했어요");
          renderMonthly();
        } catch (e) {
          toast("삭제 실패 — 로그인 상태를 확인해 주세요");
          console.error("[Honored] 삭제 실패:", e);
        }
      });
    });
  }

  // ====================================================
  //  화면 5. 여행지 한 줄 추천 (로그인 사용자별 CRUD)
  // ====================================================
  let recEditingId = null; // 지금 수정 중인 추천의 id (없으면 null)

  async function renderRecommend() {
    setActiveNav("recommend");

    // 1) 로딩 상태 먼저 보여주기
    app.innerHTML = `
      <section class="itin-head">
        <div class="container">
          <h1>여행지 한 줄 추천</h1>
          <p>여행지에 대한 한 줄 추천을 남기고, 다른 사람 추천도 구경해보세요.</p>
        </div>
      </section>
      <section class="section">
        <div class="container"><p class="dest-count">불러오는 중…</p></div>
      </section>`;

    // 2) 로그인 사용자 + 추천 목록 읽기
    const user = Auth ? await Auth.getUser() : null;
    let recs = [];
    let loadError = false;
    try {
      recs = Recs ? await Recs.list() : [];
    } catch (e) {
      loadError = true;
      console.error("[Honored] 추천 읽기 실패:", e);
    }

    // 3) 추가 폼(로그인 시) 또는 로그인 안내(비로그인)
    const formHTML = user ? addFormHTML() : loginPromptHTML();

    // 4) 목록 / 빈 상태 / 실패 상태
    let listHTML;
    if (loadError) {
      listHTML = `<div class="empty-state"><div class="es-emoji">⚠️</div>
        <h3>추천을 불러오지 못했어요</h3>
        <p>인터넷 연결을 확인하고 새로고침해 주세요.</p></div>`;
    } else if (!recs.length) {
      listHTML = `<div class="empty-state"><div class="es-emoji">💬</div>
        <h3>아직 추천이 없어요</h3>
        <p>${user ? "위에서 첫 추천을 남겨보세요!" : "로그인하고 첫 추천을 남겨보세요!"}</p></div>`;
    } else {
      listHTML = `<div class="place-grid">${recs.map((r) => recItemHTML(r, user)).join("")}</div>`;
    }

    app.innerHTML = `
      <section class="itin-head">
        <div class="container">
          <h1>여행지 한 줄 추천</h1>
          <p>여행지에 대한 한 줄 추천을 남기고, 다른 사람 추천도 구경해보세요.</p>
        </div>
      </section>
      <section class="section">
        <div class="container">
          ${formHTML}
          <div class="section-head" style="margin:32px 0 18px"><h2 style="font-size:24px">모두의 추천</h2></div>
          ${listHTML}
        </div>
      </section>`;

    wireRecommend(user);
  }

  function addFormHTML() {
    const opts = DATA.destinations
      .map((d) => `<option value="${d.id}">${d.emoji} ${esc(d.name)}</option>`)
      .join("");
    return `
      <div class="share-card">
        <h3>추천 남기기</h3>
        <div style="display:flex;flex-direction:column;gap:12px;max-width:520px">
          <select class="day-select" id="recDest" aria-label="여행지 선택">${opts}</select>
          <textarea class="share-text" id="recComment" maxlength="200"
            style="min-height:90px" placeholder="이 여행지의 한 줄 추천을 적어주세요 (최대 200자)"></textarea>
          <div class="share-actions">
            <button class="btn btn-primary" id="recAddBtn">추천 등록</button>
            <span id="recMsg" style="color:#b13b2e;align-self:center"></span>
          </div>
        </div>
      </div>`;
  }

  function loginPromptHTML() {
    return `
      <div class="share-card">
        <h3>로그인하면 추천을 남길 수 있어요</h3>
        <p>지금은 다른 사람들의 추천을 읽을 수 있어요. 직접 추천을 남기려면 로그인하세요.</p>
        <div style="display:flex;flex-direction:column;gap:12px;max-width:360px">
          <input class="day-select" id="recEmail" type="email"
                 placeholder="이메일" autocomplete="username" style="width:100%" />
          <input class="day-select" id="recPw" type="password"
                 placeholder="비밀번호" autocomplete="current-password" style="width:100%" />
          <button class="btn btn-primary" id="recLoginBtn">로그인</button>
          <span id="recLoginMsg" style="color:#b13b2e;font-size:15px"></span>
        </div>
      </div>`;
  }

  function recItemHTML(r, user) {
    const d = DATA.getDestination(r.destination_id);
    const destName = d ? `${d.emoji} ${esc(d.name)}` : esc(r.destination_id);
    const isOwner = !!(user && r.owner_id === user.id);

    // 이 추천을 수정 중이면 → 편집용 입력칸
    if (recEditingId === r.id) {
      return `
        <div class="place-card" data-rec="${r.id}">
          <div class="place-top"><span class="place-name">${destName}</span></div>
          <textarea class="share-text" data-edit-input maxlength="200"
            style="min-height:80px">${esc(r.comment)}</textarea>
          <div class="share-actions">
            <button class="btn btn-sm btn-primary" data-edit-save="${r.id}">저장</button>
            <button class="btn btn-sm btn-outline" data-edit-cancel="1">취소</button>
          </div>
        </div>`;
    }

    return `
      <div class="place-card" data-rec="${r.id}">
        <div class="place-top">
          <span class="place-name">${destName}</span>
          ${isOwner ? `<span class="cat-pill" style="background:var(--cream-2);color:var(--green-800)">내 추천</span>` : ""}
        </div>
        <p class="place-desc">${esc(r.comment)}</p>
        ${
          isOwner
            ? `<div class="share-actions">
                 <button class="btn btn-sm btn-outline" data-edit="${r.id}">수정</button>
                 <button class="btn btn-sm" data-del-rec="${r.id}"
                   style="border:2px solid #b13b2e;color:#b13b2e;background:#fff">삭제</button>
               </div>`
            : ""
        }
      </div>`;
  }

  function wireRecommend(user) {
    if (!Auth) return;

    // 비로그인: 로그인 폼만 연결
    if (!user) {
      const btn = app.querySelector("#recLoginBtn");
      if (btn) {
        btn.addEventListener("click", async () => {
          const email = app.querySelector("#recEmail").value.trim();
          const pw = app.querySelector("#recPw").value;
          const msg = app.querySelector("#recLoginMsg");
          msg.textContent = "";
          if (!email || !pw) {
            msg.textContent = "이메일과 비밀번호를 입력하세요.";
            return;
          }
          try {
            await Auth.signIn(email, pw);
            toast("로그인 성공 ✓");
            renderRecommend();
          } catch (e) {
            msg.textContent = "로그인에 실패했어요. 이메일과 비밀번호를 확인해 주세요.";
            console.error("[Honored] 로그인 실패:", e);
          }
        });
      }
      return;
    }

    // 로그인: 추가
    const addBtn = app.querySelector("#recAddBtn");
    if (addBtn) {
      addBtn.addEventListener("click", async () => {
        const dest = app.querySelector("#recDest").value;
        const comment = app.querySelector("#recComment").value.trim();
        const msg = app.querySelector("#recMsg");
        msg.textContent = "";
        if (!comment) {
          msg.textContent = "추천 내용을 입력하세요.";
          return;
        }
        try {
          await Recs.add(dest, comment);
          toast("추천을 등록했어요 ✓");
          renderRecommend();
        } catch (e) {
          msg.textContent = "등록에 실패했어요. 잠시 후 다시 시도해 주세요.";
          console.error("[Honored] 추천 등록 실패:", e);
        }
      });
    }

    // 수정 시작
    app.querySelectorAll("[data-edit]").forEach((b) => {
      b.addEventListener("click", () => {
        recEditingId = parseInt(b.dataset.edit, 10);
        renderRecommend();
      });
    });
    // 수정 취소
    const cancelBtn = app.querySelector("[data-edit-cancel]");
    if (cancelBtn) {
      cancelBtn.addEventListener("click", () => {
        recEditingId = null;
        renderRecommend();
      });
    }
    // 수정 저장
    const saveBtn = app.querySelector("[data-edit-save]");
    if (saveBtn) {
      saveBtn.addEventListener("click", async () => {
        const id = parseInt(saveBtn.dataset.editSave, 10);
        const comment = app.querySelector("[data-edit-input]").value.trim();
        if (!comment) {
          toast("내용을 입력하세요");
          return;
        }
        try {
          await Recs.update(id, comment);
          recEditingId = null;
          toast("수정했어요 ✓");
          renderRecommend();
        } catch (e) {
          toast("수정 실패 — 본인 글만 수정할 수 있어요");
          console.error("[Honored] 수정 실패:", e);
        }
      });
    }
    // 삭제
    app.querySelectorAll("[data-del-rec]").forEach((b) => {
      b.addEventListener("click", async () => {
        const id = parseInt(b.dataset.delRec, 10);
        if (!confirm("이 추천을 삭제할까요?")) return;
        try {
          await Recs.remove(id);
          toast("삭제했어요");
          renderRecommend();
        } catch (e) {
          toast("삭제 실패 — 본인 글만 삭제할 수 있어요");
          console.error("[Honored] 삭제 실패:", e);
        }
      });
    });
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
    } else if (hash.startsWith("#/monthly")) {
      await renderMonthly();
    } else if (hash.startsWith("#/recommend")) {
      await renderRecommend();
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
