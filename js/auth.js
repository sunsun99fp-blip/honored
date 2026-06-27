/*
 * Honored - 로그인 담당 (auth.js)
 * ====================================================
 * 관리자(여행지 검색량을 입력·수정하는 사람)의 로그인/로그아웃을 처리합니다.
 * 일반 방문자는 로그인 없이 순위만 볼 수 있습니다.
 *
 * store.js 처럼 모든 함수가 async(Promise)라서, 화면 코드(app.js)는
 * await 로 결과를 기다리기만 하면 됩니다.
 */
(function () {
  "use strict";

  const sb = window.HonoredSupabase;

  // 이메일 + 비밀번호로 로그인 (성공하면 사용자 정보 반환, 실패하면 에러 던짐)
  async function signIn(email, password) {
    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data.user;
  }

  // 로그아웃
  async function signOut() {
    const { error } = await sb.auth.signOut();
    if (error) throw error;
  }

  // 지금 로그인한 사용자 가져오기 (로그인 안 했으면 null)
  async function getUser() {
    const { data } = await sb.auth.getUser();
    return data ? data.user : null;
  }

  window.HonoredAuth = { signIn, signOut, getUser };
})();
