/*
 * Honored - 월별 검색량 읽기/쓰기 (stats.js)
 * ====================================================
 * Supabase의 destination_stats 표를 읽고 씁니다.
 * store.js 처럼 모든 함수가 async(Promise)라서, 화면 코드(app.js)는
 * await 로 결과를 기다리기만 하면 됩니다.
 *
 *  - getMonthlyStats(month)  : 그 달의 검색량 목록 읽기 (누구나 가능)
 *  - upsertStat(...)         : 추가/수정 (로그인한 관리자만 — RLS가 보호)
 *  - deleteStat(...)         : 삭제 (로그인한 관리자만)
 */
(function () {
  "use strict";

  const sb = window.HonoredSupabase;
  const TABLE = "destination_stats";

  // 특정 달의 모든 검색량 행 읽기 (검색량 내림차순)
  async function getMonthlyStats(month) {
    const { data, error } = await sb
      .from(TABLE)
      .select("destination_id, search_volume, updated_at")
      .eq("month", month)
      .order("search_volume", { ascending: false });
    if (error) throw error;
    return data || [];
  }

  // 추가/수정: 같은 (month, destination_id)가 이미 있으면 덮어씁니다.
  async function upsertStat(month, destinationId, searchVolume) {
    const { error } = await sb.from(TABLE).upsert(
      {
        month: month,
        destination_id: destinationId,
        search_volume: searchVolume,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "month,destination_id" }
    );
    if (error) throw error;
  }

  // 삭제
  async function deleteStat(month, destinationId) {
    const { error } = await sb
      .from(TABLE)
      .delete()
      .eq("month", month)
      .eq("destination_id", destinationId);
    if (error) throw error;
  }

  window.HonoredStats = { getMonthlyStats, upsertStat, deleteStat };
})();
