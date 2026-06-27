/*
 * Honored - 여행지 한 줄 추천 (recommendations.js)
 * ====================================================
 * Supabase의 recommendations 표를 읽고 씁니다.
 * 모든 함수가 async(Promise)라서, 화면 코드(app.js)는 await 로 기다리면 됩니다.
 *
 *  - list()                 : 모든 추천 읽기 (누구나 가능)
 *  - add(destId, comment)   : 추천 추가 (로그인 필요 — 글쓴이는 자동으로 '나')
 *  - update(id, comment)    : 추천 수정 (본인 글만 — RLS가 보호)
 *  - remove(id)             : 추천 삭제 (본인 글만)
 *
 * 참고: add() 할 때 owner_id 를 보내지 않아도 됩니다.
 *       표의 owner_id 기본값(auth.uid())이 '지금 로그인한 사람'으로 자동 채워줍니다.
 */
(function () {
  "use strict";

  const sb = window.HonoredSupabase;
  const TABLE = "recommendations";

  // 모든 추천 읽기 (최신순)
  async function list() {
    const { data, error } = await sb
      .from(TABLE)
      .select("id, destination_id, comment, owner_id, created_at")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data || [];
  }

  // 추가 (owner_id 는 DB가 자동으로 채움)
  async function add(destinationId, comment) {
    const { error } = await sb
      .from(TABLE)
      .insert({ destination_id: destinationId, comment: comment });
    if (error) throw error;
  }

  // 수정 (본인 글만 — 규칙이 막아줌)
  async function update(id, comment) {
    const { error } = await sb.from(TABLE).update({ comment: comment }).eq("id", id);
    if (error) throw error;
  }

  // 삭제 (본인 글만)
  async function remove(id) {
    const { error } = await sb.from(TABLE).delete().eq("id", id);
    if (error) throw error;
  }

  window.HonoredRecs = { list, add, update, remove };
})();
