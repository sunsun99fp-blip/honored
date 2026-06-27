/*
 * Honored - 여행지 / 장소 mock 데이터
 * ----------------------------------------------------
 * 이 파일은 "읽기 전용 콘텐츠" 계층입니다.
 * 나중에 Supabase로 옮길 때는 이 배열을 그대로
 *   destinations 테이블 + places 테이블로 옮기면 됩니다.
 *   - destination: id, name, region, emoji, gradient, tagline, description
 *   - place:       id, destinationId, name, category, description
 */

window.HONORED_DATA = {
  destinations: [
    {
      id: "gyeongju",
      name: "경주",
      region: "경상북도",
      emoji: "🏯",
      gradient: "linear-gradient(135deg, #1f4733 0%, #2e6b4a 100%)",
      tagline: "천년의 시간을 걷다",
      description:
        "신라 천년의 역사가 도시 전체에 살아 있는 경주. 능과 사찰, 별빛 어린 야경까지 여유롭게 둘러보기 좋은 고도입니다.",
      places: [
        { id: "gyeongju-1", category: "볼거리", name: "불국사", description: "유네스코 세계유산. 완만한 길이라 천천히 걷기 좋습니다." },
        { id: "gyeongju-2", category: "볼거리", name: "동궁과 월지", description: "밤이 되면 연못에 비치는 야경이 아름다운 곳." },
        { id: "gyeongju-3", category: "볼거리", name: "대릉원·첨성대", description: "넓고 평탄한 산책로, 봄가을에 특히 좋습니다." },
        { id: "gyeongju-4", category: "맛집", name: "별채반 교동쌈밥", description: "정갈한 한정식 쌈밥, 어르신 입맛에 잘 맞습니다." },
        { id: "gyeongju-5", category: "맛집", name: "숙영식당 한우", description: "경주식 한우 물회와 불고기로 유명한 노포." },
        { id: "gyeongju-6", category: "카페", name: "황리단길 한옥카페", description: "고즈넉한 한옥 마당에서 쉬어가는 찻집." }
      ]
    },
    {
      id: "jeonju",
      name: "전주",
      region: "전라북도",
      emoji: "🍲",
      gradient: "linear-gradient(135deg, #1c3f30 0%, #3a6b4d 100%)",
      tagline: "맛과 멋의 고장",
      description:
        "한옥마을의 기와 물결과 전국 제일의 먹거리가 어우러진 도시. 골목골목 천천히 맛보며 걷기 좋습니다.",
      places: [
        { id: "jeonju-1", category: "볼거리", name: "전주한옥마을", description: "기와집이 모인 평탄한 골목, 한복 입고 산책하기 좋아요." },
        { id: "jeonju-2", category: "볼거리", name: "경기전", description: "고즈넉한 숲길과 어진박물관이 있는 쉼터." },
        { id: "jeonju-3", category: "볼거리", name: "오목대", description: "한옥마을 전경을 한눈에 내려다보는 전망 좋은 언덕." },
        { id: "jeonju-4", category: "맛집", name: "한국집 비빔밥", description: "전주비빔밥의 정석, 부드럽고 깔끔한 맛." },
        { id: "jeonju-5", category: "맛집", name: "왱이집 콩나물국밥", description: "해장으로 좋은 뜨끈한 콩나물국밥." },
        { id: "jeonju-6", category: "카페", name: "전동성당 앞 찻집", description: "성당을 바라보며 차 한잔하기 좋은 자리." }
      ]
    },
    {
      id: "gangneung",
      name: "강릉",
      region: "강원도",
      emoji: "☕",
      gradient: "linear-gradient(135deg, #173a3a 0%, #2f6361 100%)",
      tagline: "바다와 커피의 도시",
      description:
        "동해의 푸른 바다와 향 깊은 커피가 함께하는 강릉. 바닷바람을 맞으며 느긋하게 머무르기 좋습니다.",
      places: [
        { id: "gangneung-1", category: "볼거리", name: "경포대·경포호", description: "넓은 호수와 바다를 끼고 도는 평탄한 산책길." },
        { id: "gangneung-2", category: "볼거리", name: "정동진", description: "기차에서 내리면 바로 바다, 일출 명소로 유명합니다." },
        { id: "gangneung-3", category: "볼거리", name: "오죽헌", description: "신사임당과 율곡 이이의 숨결이 깃든 고택." },
        { id: "gangneung-4", category: "맛집", name: "초당 순두부", description: "바닷물로 굳힌 부드러운 순두부 한 상." },
        { id: "gangneung-5", category: "맛집", name: "중앙시장 먹거리", description: "갓 부친 생선전과 수제 어묵을 맛보는 곳." },
        { id: "gangneung-6", category: "카페", name: "안목해변 커피거리", description: "바다를 보며 커피 한잔, 강릉 커피의 시작점." }
      ]
    },
    {
      id: "andong",
      name: "안동",
      region: "경상북도",
      emoji: "🏘️",
      gradient: "linear-gradient(135deg, #243f2c 0%, #41613f 100%)",
      tagline: "전통이 살아 숨쉬는",
      description:
        "고택과 종갓집 음식, 강 위를 가로지르는 달빛 다리까지. 한국의 전통이 가장 차분하게 남아 있는 고장입니다.",
      places: [
        { id: "andong-1", category: "볼거리", name: "하회마을", description: "강이 마을을 감아 도는 유네스코 세계유산 마을." },
        { id: "andong-2", category: "볼거리", name: "월영교", description: "밤에 불을 밝히면 운치 있는 목조 다리. 산책로가 평탄합니다." },
        { id: "andong-3", category: "볼거리", name: "도산서원", description: "퇴계 이황의 자취가 남은 고요한 서원." },
        { id: "andong-4", category: "맛집", name: "안동찜닭 골목", description: "푸짐하고 달큰한 안동찜닭, 여럿이 나눠 먹기 좋아요." },
        { id: "andong-5", category: "맛집", name: "헛제삿밥", description: "제사 음식을 본뜬 담백한 비빔밥 한 상." },
        { id: "andong-6", category: "카페", name: "월영교 강변 카페", description: "다리와 강을 바라보며 쉬어가는 찻집." }
      ]
    },
    {
      id: "yeosu",
      name: "여수",
      region: "전라남도",
      emoji: "🌃",
      gradient: "linear-gradient(135deg, #16384a 0%, #2c6079 100%)",
      tagline: "밤바다의 낭만",
      description:
        "노래로도 유명한 여수 밤바다. 해산물과 야경, 케이블카에서 보는 바다 풍경이 오래 기억에 남습니다.",
      places: [
        { id: "yeosu-1", category: "볼거리", name: "여수 밤바다·낭만포차", description: "불빛이 비치는 밤바다 산책로, 여수의 대표 풍경." },
        { id: "yeosu-2", category: "볼거리", name: "오동도", description: "동백나무 숲길을 걷는 작은 섬, 동백열차도 있습니다." },
        { id: "yeosu-3", category: "볼거리", name: "해상케이블카", description: "바다 위를 가로지르며 보는 시원한 전망." },
        { id: "yeosu-4", category: "맛집", name: "게장백반", description: "밥도둑 간장게장과 양념게장을 함께 맛보는 한 상." },
        { id: "yeosu-5", category: "맛집", name: "서대회무침", description: "여수 별미, 새콤달콤한 회무침." },
        { id: "yeosu-6", category: "카페", name: "오션뷰 루프탑 카페", description: "바다와 케이블카가 보이는 전망 좋은 카페." }
      ]
    },
    {
      id: "jeju",
      name: "제주",
      region: "제주특별자치도",
      emoji: "🌊",
      gradient: "linear-gradient(135deg, #1b4540 0%, #2f7068 100%)",
      tagline: "자연이 주는 쉼",
      description:
        "오름과 바다, 한라산이 어우러진 섬. 서두르지 않고 자연 속에서 쉬어가기 좋은 여행지입니다.",
      places: [
        { id: "jeju-1", category: "볼거리", name: "성산일출봉", description: "바다에서 솟은 분화구, 완만한 길로 정상까지 오릅니다." },
        { id: "jeju-2", category: "볼거리", name: "협재해변", description: "에메랄드빛 바다와 흰 모래가 아름다운 해변." },
        { id: "jeju-3", category: "볼거리", name: "우도", description: "배를 타고 들어가는 평화로운 작은 섬." },
        { id: "jeju-4", category: "맛집", name: "고기국수", description: "진한 돼지육수에 말아낸 제주식 국수." },
        { id: "jeju-5", category: "맛집", name: "흑돼지 구이", description: "쫄깃하고 고소한 제주 흑돼지." },
        { id: "jeju-6", category: "카페", name: "애월 오션뷰 카페", description: "바다를 마주한 통창 카페에서 보내는 여유." }
      ]
    }
  ]
};

// 편의 함수 (앱 어디서나 사용)
window.HONORED_DATA.getDestination = function (id) {
  return window.HONORED_DATA.destinations.find((d) => d.id === id) || null;
};
window.HONORED_DATA.getPlace = function (placeId) {
  for (const d of window.HONORED_DATA.destinations) {
    const p = d.places.find((pl) => pl.id === placeId);
    if (p) return { ...p, destinationId: d.id, destinationName: d.name };
  }
  return null;
};
