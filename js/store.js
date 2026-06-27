/*
 * Honored - 일정표 저장소 (Store)
 * ====================================================
 * 이 파일이 "데이터 저장 계층"입니다. UI(app.js)는 오직
 * 이 store 의 함수만 호출하고, 안에서 어떻게 저장되는지는
 * 신경 쓰지 않습니다.
 *
 *  ▶ 지금:   브라우저 localStorage 에 저장 (로그인 없음, 새로고침 유지)
 *  ▶ 나중에: 이 파일의 _read()/_write() 내부만 Supabase 호출로
 *            바꾸면 됩니다. 함수 시그니처(이름·인자·반환값)는
 *            그대로 두므로 app.js 는 한 줄도 고칠 필요가 없습니다.
 *
 * 모든 함수가 Promise(async) 를 반환하도록 만들어 두었기 때문에
 * 네트워크 기반의 Supabase 로 바뀌어도 호출부가 동일하게 동작합니다.
 *
 * 저장 구조 (itinerary):
 *   {
 *     dayCount: 2,
 *     items: [
 *       { placeId, name, category, description,
 *         destinationId, destinationName, day, addedAt }
 *     ]
 *   }
 */

window.HonoredStore = (function () {
  const KEY = "honored.itinerary.v1";

  function _read() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return { dayCount: 1, items: [] };
      const data = JSON.parse(raw);
      if (!data.dayCount || data.dayCount < 1) data.dayCount = 1;
      if (!Array.isArray(data.items)) data.items = [];
      return data;
    } catch (e) {
      console.warn("저장된 일정을 읽지 못했습니다:", e);
      return { dayCount: 1, items: [] };
    }
  }

  function _write(data) {
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
    } catch (e) {
      console.warn("일정을 저장하지 못했습니다:", e);
    }
    return data;
  }

  // --- 공개 API (Supabase 로 바꿔도 이 시그니처는 유지) ---------------

  async function getItinerary() {
    return _read();
  }

  async function getItems() {
    return _read().items;
  }

  async function isSaved(placeId) {
    return _read().items.some((it) => it.placeId === placeId);
  }

  async function addPlace(place) {
    const data = _read();
    if (data.items.some((it) => it.placeId === place.id)) return data; // 중복 방지
    data.items.push({
      placeId: place.id,
      name: place.name,
      category: place.category,
      description: place.description,
      destinationId: place.destinationId,
      destinationName: place.destinationName,
      day: 1,
      addedAt: Date.now()
    });
    return _write(data);
  }

  async function removePlace(placeId) {
    const data = _read();
    data.items = data.items.filter((it) => it.placeId !== placeId);
    return _write(data);
  }

  async function setDay(placeId, day) {
    const data = _read();
    const it = data.items.find((x) => x.placeId === placeId);
    if (it) it.day = Math.max(1, Math.min(day, data.dayCount));
    return _write(data);
  }

  async function addDay() {
    const data = _read();
    data.dayCount += 1;
    return _write(data);
  }

  async function removeDay() {
    const data = _read();
    if (data.dayCount <= 1) return data;
    const removed = data.dayCount;
    data.dayCount -= 1;
    // 마지막 날에 있던 장소들은 한 칸 앞 날짜로 이동
    data.items.forEach((it) => {
      if (it.day >= removed) it.day = data.dayCount;
    });
    return _write(data);
  }

  // 같은 날짜 안에서 위/아래로 한 칸 이동
  async function move(placeId, direction) {
    const data = _read();
    const it = data.items.find((x) => x.placeId === placeId);
    if (!it) return data;
    const sameDay = data.items.filter((x) => x.day === it.day);
    const idxInDay = sameDay.indexOf(it);
    const swapWith =
      direction === "up" ? sameDay[idxInDay - 1] : sameDay[idxInDay + 1];
    if (!swapWith) return data;

    const a = data.items.indexOf(it);
    const b = data.items.indexOf(swapWith);
    [data.items[a], data.items[b]] = [data.items[b], data.items[a]];
    return _write(data);
  }

  async function clear() {
    return _write({ dayCount: 1, items: [] });
  }

  async function count() {
    return _read().items.length;
  }

  return {
    getItinerary,
    getItems,
    isSaved,
    addPlace,
    removePlace,
    setDay,
    addDay,
    removeDay,
    move,
    clear,
    count
  };
})();
