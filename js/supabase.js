/*
 * Honored - Supabase 연결 (supabase.js)
 * ====================================================
 * 인터넷 데이터베이스(Supabase)에 연결하는 "공개 클라이언트"를 만듭니다.
 * 앱 전체가 이 하나의 연결(window.HonoredSupabase)을 함께 씁니다.
 *
 * 여기 들어가는 두 값은 "공개돼도 안전한" 값입니다.
 *   - 주소(URL)와 공개 열쇠(publishable/anon)는 브라우저에 노출돼도 됩니다.
 *     데이터는 Supabase의 접근 규칙(RLS)이 지켜줍니다.
 *   - ⚠️ 비밀 열쇠(service_role / secret)는 절대 이 파일에 넣지 않습니다.
 *     (그건 나중에 서버 함수에서만 사용)
 */
(function () {
  "use strict";

  // 공개돼도 안전한 값 (RLS 규칙으로 데이터 보호됨)
  const SUPABASE_URL = "https://gbfqesynkuelbllukksx.supabase.co";
  const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_AaPRkLKwGBrXEMaJ1TgMkA_jQRZFkeR";

  // CDN으로 불러온 Supabase 라이브러리가 있는지 확인
  if (!window.supabase || !window.supabase.createClient) {
    console.error(
      "[Honored] Supabase 라이브러리를 불러오지 못했습니다. " +
        "index.html의 CDN <script> 태그를 확인하세요."
    );
    return;
  }

  // 앱 전체에서 함께 쓰는 하나의 연결
  window.HonoredSupabase = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
  );
})();
