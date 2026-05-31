import React, { useEffect, useMemo, useRef, useState } from "react";
import { toPng } from "html-to-image";

const prologue = [
  { speaker: "나레이션", bg: "library", character: false, text: `오후의 도서관은 조용했다.

창가에 앉은 사람들은 말없이 책장을 넘겼고,
낡은 종이 냄새만이 천천히 공기 속을 떠다녔다.`, button: "다음" },
  { speaker: "나레이션", bg: "library", character: false, text: `{playerName}은 반납하려던 책을 다시 한 번 펼쳤다.

그 순간, 책 사이에 끼어 있던 낡은 책갈피 하나가 바닥으로 조용히 떨어졌다.`, button: "다음" },
  { speaker: "나레이션", bg: "bookmark", character: false, text: `책갈피는 오래된 종이처럼 바랜 색이었다.

뒷면에는 작고 단정한 글씨로
짧은 문장이 적혀 있었다.`, button: "다음" },
  { speaker: "책갈피", bg: "bookmark", character: false, text: `“누군가 내 마음을 읽는다면,
나는 어디로 도망쳐야 할까.”`, button: "다음" },
  { speaker: "나레이션", bg: "library", character: true, text: `문장을 다 읽기도 전에,
등 뒤에서 아주 조용한 발소리가 멈췄다.

돌아보자, 한 여자가 서 있었다.
흰 니트, 차분한 눈빛,
그리고 조금 신비로운 얼굴..`, button: "다음" },
  { speaker: "케이코쨩", bg: "library", character: true, text: `“그 책갈피…”

케이코쨩은 당신의 손끝을 바라보았다.

“{playerName}, 네가 봤어?”`, button: "선택하기" },
];

const initialScores = { affection: 0, trust: 0, pressure: 0, sincerity: 0, cultFlag: 0, monkFlag: 0, escapeFlag: 0 };

const scenes = [
  {
    progress: "장면 1 / 10",
    title: "도서관에서 떨어진 책갈피",
    bg: "library",
    question: `케이코쨩은 당신이 들고 있는 책갈피를 바라보았다.
잠시 침묵하던 그녀가 조용히 물었다.

“그 책갈피… {playerName}, 네가 봤어?”`,
    choices: [
      { id: "A", text: "미안. 문장은 봤지만, 더 읽지는 않았어.", scores: { affection: 1, trust: 2, sincerity: 2 }, reaction: "…솔직하네. 보통은 안 봤다고 거짓말할 텐데." },
      { id: "B", text: "이상하게 타이밍이 맞았네. 꼭 내가 발견해야 했던 것처럼.", scores: { pressure: 1, cultFlag: 1 }, reaction: "그런 식으로 의미를 붙이는구나." },
      { id: "C", text: "아니? 아무것도 안 봤는데?", scores: { trust: -2, sincerity: -2 }, reaction: "그래. 그렇게 말할 줄 알았어." },
      { id: "D", text: "글이 예쁘다고 생각했어. 그런데 네 허락 없이 말하는 건 실례였겠다.", scores: { affection: 1, sincerity: 1, pressure: 1 }, reaction: "…그걸 아는 사람은 많지 않아." },
    ],
  },
  {
    progress: "장면 2 / 10",
    title: "책갈피를 돌려주는 순간",
    bg: "library",
    intro: { speaker: "나레이션", bg: "library", character: false, text: `다음 날, {playerName}은 다시 도서관으로 향했다.

어제 주운 책갈피는 작은 종이 한 장일 뿐인데,
이상하게 쉽게 가방에서 꺼낼 수 없었다.`, button: "책갈피 돌려주기" },
    question: `다음 날, 당신은 케이코쨩에게 책갈피를 돌려준다.
케이코쨩은 책갈피를 받아 들고 잠시 침묵한다.

“이걸… 버리지 않고 가져왔네.”`,
    choices: [
      { id: "A", text: "읽고 싶었지만 참았어. 그러니까 나 꽤 괜찮은 사람이지?", scores: { trust: -1, sincerity: -1, pressure: 2 }, reaction: "그걸 보상처럼 말하면 조금 달라져." },
      { id: "B", text: "사실 조금 궁금하긴 했어. 그래도 네 거니까 더 보진 않았어.", scores: { affection: 1, trust: 1, sincerity: 2 }, reaction: "…궁금했는데 안 봤다는 게 더 이상하네. 좋은 의미로." },
      { id: "C", text: "이 문장, 이상하게 마음이 조용해졌어. 너도 그런 기분으로 쓴 거야?", scores: { sincerity: 1, monkFlag: 1 }, reaction: "마음이 조용해진다… 그런 표현은 조금 알 것 같아." },
      { id: "D", text: "중요한 것 같아서. 네가 직접 가져가는 게 맞다고 생각했어.", scores: { affection: 1, trust: 2, sincerity: 2 }, reaction: "…고마워. 이런 건 별거 아니라고 생각하는 사람도 많아서." },
    ],
  },
  {
    progress: "장면 3 / 10",
    title: "발표를 피하는 케이코쨩",
    bg: "classroom",
    intro: { speaker: "나레이션", bg: "classroom", character: false, text: `문예창작 수업 시간.

교수의 목소리가 조용한 강의실에 울렸다.
케이코쨩의 이름이 불린 순간,
그녀의 손끝이 아주 작게 멈췄다.`, button: "수업 지켜보기" },
    question: `문예창작 수업 시간.
교수가 케이코쨩에게 발표를 권하지만, 케이코쨩은 조용히 고개를 숙인다.

수업이 끝난 뒤, 케이코쨩은 아무 말 없이 도서관 쪽으로 걸어간다.`,
    choices: [
      { id: "A", text: "여기가 너무 버거우면, 잠깐 다른 곳에서 숨 쉬어도 괜찮지 않을까?", scores: { sincerity: 1, escapeFlag: 1 }, reaction: "다른 곳에서 숨 쉰다… 그런 선택지도 있겠네." },
      { id: "B", text: "말하지 않는 것도 네 방식일 수 있잖아. 굳이 모두에게 보여줄 필요는 없다고 생각해.", scores: { trust: 1, sincerity: 1, monkFlag: 1 }, reaction: "보여주지 않아도 된다… 그런 식으로 생각하면 조금 편하네." },
      { id: "C", text: "조용히 따라가되, 말을 걸지 않고 같은 방향으로 걷는다.", scores: { affection: 1, trust: 2, sincerity: 1 }, reaction: "…왜 아무것도 안 물어봐?" },
      { id: "D", text: "발표하기 싫었던 거지? 굳이 말하고 싶지 않으면 안 해도 돼.", scores: { affection: 1, trust: 1, sincerity: 1 }, reaction: "그렇게 단순한 건 아니지만… 나쁘진 않은 말이네." },
    ],
  },
  {
    progress: "장면 4 / 10",
    title: "미나가 알려준 과거 힌트",
    bg: "campus",
    intro: { speaker: "미나", bg: "campus", character: false, text: `“너, 케이코랑 요즘 좀 얘기하지?”

미나는 장난스럽게 웃다가, 곧 목소리를 낮췄다.

“근데 조심해. 걔, 예전 일이 좀 있어.”`, button: "미나의 말 듣기" },
    question: `케이코쨩의 과 동기 미나가 당신에게 말을 건다.

“케이코, 예전엔 글 진짜 잘 썼어. 근데 어느 순간부터 아예 안 쓰더라. 무슨 일 있었던 것 같긴 한데…”

당신은 케이코쨩의 과거가 궁금해진다.`,
    choices: [
      { id: "A", text: "케이코쨩이 직접 말해줄 때까지 기다릴게.", scores: { affection: 1, trust: 2, sincerity: 2 }, reaction: "넌 이상하게… 선을 넘지 않네." },
      { id: "B", text: "가끔 그런 사람 있잖아. 남들이랑 조금 다른 결을 가진 사람. 케이코쨩도 그런 쪽 같아.", scores: { pressure: 1, cultFlag: 2 }, reaction: "다른 결… 그 말은 칭찬 같기도 하고, 조금 이상하기도 해." },
      { id: "C", text: "과거 얘기라면 조심하는 게 좋겠다. 케이코쨩이 꺼내기 전까진 그냥 모른 척할래.", scores: { affection: 1, trust: 2, sincerity: 2 }, reaction: "모른 척해주는 것도 배려일 수 있구나." },
      { id: "D", text: "무슨 일이었는지 궁금하긴 한데, 네가 말해도 되는 얘기만 해줘.", scores: { sincerity: 1, pressure: 1 }, reaction: "내 얘기, 다른 사람한테 들었어?" },
    ],
  },
  {
    progress: "장면 5 / 10",
    title: "비 오는 날 함께 걷기",
    bg: "rainy",
    intro: { speaker: "나레이션", bg: "rainy", character: false, text: `수업이 끝나자 갑자기 비가 쏟아졌다.

도서관 앞 처마 아래,
케이코쨩은 우산 없이 조용히 비를 바라보고 있었다.`, button: "다가가기" },
    question: `갑자기 비가 쏟아진다.
당신은 우산을 들고 있고, 케이코쨩은 우산 없이 도서관 앞에 서 있다.

케이코쨩은 비를 바라보다 작게 말한다.

“비 오는 날은 조용해서 좋아.”`,
    choices: [
      { id: "A", text: "같이 쓰자. 솔직히 이런 상황, 조금 설레긴 하잖아.", scores: { affection: 1, pressure: 2 }, reaction: "…그렇게 바로 말하면 같이 걷기 어려워져." },
      { id: "B", text: "이런 날 우연히 같이 있는 거, 조금 신기하지 않아? 타이밍이 이상하게 맞는 느낌.", scores: { pressure: 1, cultFlag: 1 }, reaction: "우연을 그렇게 생각할 수도 있구나." },
      { id: "C", text: "내 우산 써. 나는 뛰어갈게.", scores: { affection: 1, trust: 1, sincerity: 2 }, reaction: "그렇게까지 안 해도 되는데… 그래도 고마워." },
      { id: "D", text: "같이 쓸래? 말 안 해도 괜찮아.", scores: { affection: 2, trust: 2, sincerity: 1 }, reaction: "…침묵이 불편하지 않은 사람은 오랜만이야." },
    ],
  },
  {
    progress: "장면 6 / 10",
    title: "케이코쨩의 오래된 노트 분실",
    bg: "library",
    intro: { speaker: "나레이션", bg: "library", character: false, text: `도서관 문학 서가 아래.

{playerName}은 누군가 떨어뜨린 낡은 노트 한 권을 발견했다.
표지 안쪽에는 익숙한 이름이 적혀 있었다.`, button: "노트 확인하기" },
    question: `도서관 책상 아래에서 오래된 노트를 발견한다.
표지 안쪽에는 케이코쨩의 이름이 적혀 있다.

노트는 살짝 열려 있고, 안에는 손글씨가 빼곡하다.`,
    choices: [
      { id: "A", text: "걱정돼서 확인했어. 네가 어떤 마음인지 알고 싶었거든.", scores: { trust: -2, sincerity: -1, pressure: 2 }, reaction: "걱정이라는 말로 남의 마음을 열어보면 안 돼." },
      { id: "B", text: "읽지 않고 바로 덮어서 케이코쨩에게 돌려준다.", scores: { affection: 2, trust: 3, sincerity: 2 }, reaction: "…안 읽었어? 고마워. 정말로." },
      { id: "C", text: "이 노트, 네가 너무 오래 혼자 버텼다는 증거 같아. 이제는 아무한테도 설명하지 않아도 되지 않을까.", scores: { sincerity: 1, monkFlag: 2 }, reaction: "아무한테도 설명하지 않아도 된다… 그런 말은 조금 위험하게 편하네." },
      { id: "D", text: "앞부분만 살짝 봤지만, 더 읽지는 않았다고 솔직히 말한다.", scores: { trust: -1, sincerity: 1, pressure: 1 }, reaction: "봤구나. 솔직한 건 알겠는데… 그래도 싫어." },
    ],
  },
  {
    progress: "장면 7 / 10",
    title: "렌의 등장",
    bg: "hallway",
    intro: { speaker: "나레이션", bg: "hallway", character: true, text: `복도 끝에서 케이코쨩의 걸음이 멈췄다.

처음 보는 사람이 그녀를 향해 웃고 있었다.
그 웃음은 반가움이라기보다, 오래된 상처를 건드리는 쪽에 가까웠다.`, button: "렌의 말 듣기" },
    question: `케이코쨩의 과거 친구 렌이 나타난다.
렌은 케이코쨩을 보며 웃는다.

“아직도 글 안 써? 너 그때는 꽤 잘난 척했잖아.”

케이코쨩의 표정이 굳는다.`,
    choices: [
      { id: "A", text: "렌에게 화를 내며 크게 소리친다. “너 뭐야? 케이코한테 사과해!”", scores: { affection: 1, sincerity: 1, pressure: 2 }, reaction: "고마운데… 그렇게 크게 만들고 싶진 않았어." },
      { id: "B", text: "너를 아프게 하는 관계라면, 굳이 계속 붙잡지 않아도 돼.", scores: { trust: 1, sincerity: 1, escapeFlag: 2 }, reaction: "붙잡지 않아도 된다… 그럼 나는 어디까지 놓아도 되는 걸까." },
      { id: "C", text: "케이코쨩 앞을 막아서되, 차분하게 말한다. “그 얘기는 지금 여기서 할 필요 없어.”", scores: { affection: 2, trust: 2, sincerity: 2 }, reaction: "…고마워. 대신 화내주지 않아서." },
      { id: "D", text: "렌도 결국 케이코쨩을 이해받고 싶었던 거 아닐까? 이상하게 셋이 연결된 느낌이 들어.", scores: { affection: -1, trust: -1, sincerity: -1, pressure: 1, cultFlag: 2 }, reaction: "지금 그 사람 마음까지 내가 이해해야 해?" },
    ],
  },
  {
    progress: "장면 8 / 10",
    title: "다시 글을 쓸지 고민하는 밤",
    bg: "night",
    intro: { speaker: "나레이션", bg: "night", character: false, text: `늦은 밤, 휴대폰 화면이 짧게 켜졌다.

보낸 사람은 케이코쨩이었다.
평소 먼저 연락하지 않던 그녀가, 아주 짧은 문장을 보내왔다.`, button: "메시지 확인하기" },
    question: `늦은 저녁, 케이코쨩에게 메시지가 온다.

“나, 다시 써도 될까.”

평소 먼저 연락하지 않던 케이코쨩의 첫 진심 어린 질문이다.`,
    choices: [
      { id: "A", text: "쓰고 싶으면 써. 안 쓰고 싶으면 안 써도 돼. 네 마음이 먼저야.", scores: { affection: 2, trust: 2, sincerity: 3 }, reaction: "그런 대답을 듣고 싶었던 것 같아." },
      { id: "B", text: "다시 쓰는 것보다, 네 마음이 조용해지는 게 먼저 아닐까.", scores: { trust: 1, sincerity: 1, monkFlag: 2 }, reaction: "마음이 조용해지는 것… 그게 나한테 필요했던 걸까." },
      { id: "C", text: "꼭 여기서 답을 찾지 않아도 돼. 가끔은 완전히 다른 곳에서 나를 찾을 수도 있잖아.", scores: { sincerity: 1, escapeFlag: 2 }, reaction: "완전히 다른 곳의 나… 그 말이 계속 남네." },
      { id: "D", text: "네 글을 기다리는 사람도 있을 거야. 하지만 제일 먼저 네가 괜찮아야 해.", scores: { affection: 2, trust: 1, sincerity: 2, pressure: 1 }, reaction: "기다리는 사람… 아직은 무섭지만, 네 말은 이상하게 싫지 않아." },
    ],
  },
  {
    progress: "장면 9 / 10",
    title: "케이코쨩의 수상한 초대",
    bg: "park",
    intro: { speaker: "케이코쨩", bg: "park", character: true, text: `“이번 주말에 시간 있어?”

케이코쨩은 그렇게 말하고는 잠깐 시선을 피했다.
망설임 끝에 꺼낸 말처럼 보였다.`, button: "대답하기" },
    question: `케이코쨩이 조용히 말한다.

“이번 주말에 시간 있어?”

당신이 놀라자 케이코쨩은 살짝 눈을 피한다.

“보여주고 싶은 곳이 있어.”`,
    choices: [
      { id: "A", text: "네가 보여주고 싶은 곳이라면 믿고 갈게. 이유는 묻지 않을게.", scores: { sincerity: 1, cultFlag: 3 }, reaction: "이유를 묻지 않는다… 그런 믿음도 있구나." },
      { id: "B", text: "혹시 데이트야? 이제 나한테 마음이 좀 열린 거라고 봐도 돼?", scores: { affection: 1, sincerity: -1, pressure: 2 }, reaction: "그렇게 빨리 정리하지 마." },
      { id: "C", text: "좋아. 어디든 갈게. 대신 무리해서 나한테 맞추진 않아도 돼.", scores: { affection: 1, trust: 2, sincerity: 2 }, reaction: "응. 무리하지 않을게." },
      { id: "D", text: "좋아. 그런데 네가 불편하면 언제든 취소해도 돼.", scores: { affection: 2, trust: 2, sincerity: 2 }, reaction: "…그렇게 말해주니까 오히려 가고 싶어졌어." },
      { id: "E", text: "혹시 마지막 인사 같은 건 아니지? 네가 편한 쪽이면 말리진 않겠지만.", scores: { sincerity: 1, escapeFlag: 1, monkFlag: 1 }, reaction: "마지막 인사… 이상하게 마음에 남는 말이네." },
    ],
  },
  {
    progress: "장면 10 / 10",
    title: "마지막 질문",
    bg: "park",
    intro: { speaker: "나레이션", bg: "park", character: true, text: `공원 벤치에 앉은 케이코쨩은 한참 동안 말이 없었다.

바람이 지나가고, 나뭇잎이 흔들리고,
그녀는 아주 천천히 {playerName}을 바라보았다.`, button: "마지막 질문 듣기" },
    question: `공원 벤치.
케이코쨩은 한참 동안 아무 말 없이 앉아 있다.

그러다 조용히 묻는다.

“{playerName}. 너는 내가 조용해도 괜찮아?”`,
    choices: [
      { id: "A", text: "괜찮아. 말하지 않아도 마음이 편해지는 쪽이면 됐어.", scores: { trust: 1, sincerity: 1, monkFlag: 2 }, reaction: "마음이 편해지는 쪽… 그게 뭘까 계속 생각하게 돼." },
      { id: "B", text: "응. 네가 말하지 않는 시간까지 너라고 생각해.", scores: { affection: 3, trust: 3, sincerity: 3 }, reaction: "그 대답… 오래 기억할 것 같아." },
      { id: "C", text: "괜찮아. 다만 언젠가 나한테는 조금 말해줬으면 해.", scores: { affection: 2, trust: 1, sincerity: 2, pressure: 2 }, reaction: "솔직하네. 그런데 아직 조금 무서워." },
      { id: "D", text: "괜찮아. 네가 어디에 있든, 지금의 네가 가장 편해지는 쪽이면 나는 응원할게.", scores: { sincerity: 1, escapeFlag: 2 }, reaction: "어디에 있든 괜찮다… 그 말, 조금 자유롭네." },
      { id: "E", text: "괜찮아. 원래 특별한 사람들은 쉽게 설명되지 않잖아.", scores: { pressure: 1, cultFlag: 2 }, reaction: "특별한 사람… 그런 말은 조금 낯설어." },
    ],
  },
];

const endings = {
  trueSmile: { number: "ENDING 01", title: "처음으로 웃던 날", type: "찐 해피엔딩", image: "ending-true-smile.webp", quote: "이상하지. {playerName} 앞에서는… 도망치고 싶지 않아.", desc: `당신은 케이코쨩을 억지로 웃게 만들지 않았습니다.
그녀가 웃지 않아도 괜찮다고 기다려주었습니다.

그리고 마침내 케이코쨩은 처음으로 도망치지 않았습니다.
아주 작지만 분명한 미소로, 당신의 곁에 남았습니다.` },
  monk: { number: "ENDING 02", title: "삭발한 마지막 인사", type: "애매한 실패 엔딩", image: "ending-monk.webp", quote: "고마워, {playerName}. 덕분에 알게 됐어. 사랑보다 더 고요한 길이 있다는 걸.", desc: `케이코쨩은 웃었습니다.
하지만 당신의 연인이 되어서가 아니라, 모든 연애 플래그를 버리고 초월의 길로 떠나며 웃었습니다.

당신은 그녀의 마음을 조금은 열었지만, 열린 문 너머에는 연애가 아니라 수행의 길이 있었습니다.` },
  cult: { number: "ENDING 03", title: "첫 데이트는 사이비교에서", type: "개그 함정 엔딩", image: "ending-cult.webp", quote: "어서 와, {playerName}. 기다리고 있었어.", desc: `케이코쨩은 당신의 마음을 받아준 것처럼 보였습니다.
하지만 그건 연애의 시작이 아니라, 수상한 입단식의 시작이었습니다.

축하합니다.
당신은 케이코쨩의 남자친구가 아니라, 케이코쨩이 데려온 신규 신도가 되었습니다.` },
  escape: { number: "ENDING 04", title: "안녕히 계세요 여러분!", type: "탈주 개그 엔딩", image: "ending-escape.webp", quote: "전 이 세상의 모든 굴레와 속박을 벗어 던지고 제 행복을 찾아 떠납니다!", desc: `케이코쨩은 웃었습니다.
아주 시원하게 웃었습니다. 하지만 그 웃음은 당신을 향한 사랑의 미소가 아닌 자유를 얻은자의 미소였습니다.

그리고 두둥실 떠올라 멀리 자유롭게 날아가버렸습니다.

..그래도 케이코쨩이 행복해졌으니 됐잖아요? ` },
  pressure: { number: "ENDING 05", title: "너무 가까운 거리", type: "부담 실패 엔딩", image: "ending-pressure.webp", quote: "좋아한다는 말이, 상대의 거리를 무시해도 된다는 뜻은 아니야.", desc: `당신의 마음은 진심이었을지 모릅니다.
하지만 진심이라는 이유만으로 상대의 속도를 무시할 수는 없습니다.

케이코쨩에게 필요했던 건 확신이 아니라 배려였고, 당신은 너무 가까이 다가간 나머지 그녀가 숨 쉴 공간을 잃게 했습니다.` },
  closedNote: { number: "ENDING 06", title: "닫힌 노트", type: "완전 배드엔딩", image: "ending-closed-note.webp", quote: "역시… 보여주지 않는 게 맞았어.", desc: `케이코쨩에게 마음을 여는 일은 쉬운 일이 아니었습니다.
그녀가 망설였던 이유는 의심이 아니라 자기방어였습니다.

당신은 그 문 앞에서 기다리는 대신, 문고리를 억지로 돌렸습니다.
결국 노트는 다시 닫혔고, 케이코쨩은 당신의 이야기에서 조용히 사라졌습니다.` },
};

function getEndingId(scores) {
  const { affection = 0, trust = 0, pressure = 0, sincerity = 0, cultFlag = 0, monkFlag = 0, escapeFlag = 0 } = scores;
  if ((trust <= 3 && pressure >= 8) || (sincerity <= 2 && trust <= 4)) return "closedNote";
  if (pressure >= 10 || (pressure >= 8 && trust <= 8)) return "pressure";
  if (cultFlag >= 5) return "cult";
  if (monkFlag >= 6 || (monkFlag >= 5 && escapeFlag <= 3)) return "monk";
  if (escapeFlag >= 5 || (escapeFlag >= 4 && affection <= 10)) return "escape";
  if (affection >= 14 && trust >= 15 && sincerity >= 15 && pressure <= 4 && cultFlag <= 1 && monkFlag <= 1 && escapeFlag <= 1) return "trueSmile";
  const sorted = [
    { id: "cult", value: cultFlag },
    { id: "monk", value: monkFlag },
    { id: "escape", value: escapeFlag },
    { id: "pressure", value: pressure },
  ].sort((a, b) => b.value - a.value);
  if (trust <= 7) return "closedNote";
  if (sorted[0].value > 0) return sorted[0].id;
  return "monk";
}

function n(text, name) {
  return text.replaceAll("{playerName}", name || "너");
}

function addScores(base, delta = {}) {
  const next = { ...base };
  Object.entries(delta).forEach(([k, v]) => {
    next[k] = (next[k] || 0) + v;
  });
  return next;
}

function calculateScores(answers) {
  return answers
    .filter(Boolean)
    .reduce((total, choice) => addScores(total, choice.scores), initialScores);
}

function getReactionImage(scores = {}) {
  const goodScore =
    (scores.affection || 0) +
    (scores.trust || 0) +
    (scores.sincerity || 0);

  const badScore =
    (scores.pressure || 0) +
    (scores.cultFlag || 0) +
    (scores.monkFlag || 0) +
    (scores.escapeFlag || 0) -
    (scores.trust || 0);

  if (badScore >= 2 || scores.trust < 0 || scores.sincerity < 0) {
    return "keiko-bad.webp";
  }

  if (goodScore >= 4) {
    return "keiko-good.webp";
  }

  return "keiko-neutral.webp";
}

function Bg({ type = "library" }) {
  const imageMap = {
    main: "/images/main/main-bg.webp",
    library: "/images/backgrounds/library-bg.webp",
    bookmark: "/images/backgrounds/bookmark-closeup.webp",
    classroom: "/images/backgrounds/classroom.webp",
    campus: "/images/backgrounds/campus.webp",
    rainy: "/images/backgrounds/rainy-campus.webp",
    hallway: "/images/backgrounds/hallway.webp",
    night: "/images/backgrounds/night-room.webp",
    park: "/images/backgrounds/park.webp",
  };

  const fallbackTone = {
    main: "from-[#f4eadf] via-[#faf4ec] to-[#efe3d8]",
    library: "from-[#f4eadf] via-[#faf4ec] to-[#efe3d8]",
    bookmark: "from-[#efe0c8] via-[#fbf2e5] to-[#f2e5d5]",
    classroom: "from-[#efe8df] via-[#f8f3ed] to-[#e9e0d8]",
    campus: "from-[#edf0df] via-[#fbf4ea] to-[#eadfd6]",
    rainy: "from-[#dfe4ea] via-[#f3f1ee] to-[#e4d9d2]",
    hallway: "from-[#e9e2db] via-[#fbf4ed] to-[#ded6d2]",
    night: "from-[#2c2a39] via-[#5d5368] to-[#d8c6dd]",
    park: "from-[#e7eddc] via-[#fbf4ea] to-[#eadfd6]",
  }[type] || "from-[#f4eadf] via-[#faf4ec] to-[#efe3d8]";

  return (
    <div className={`absolute inset-0 bg-gradient-to-b ${fallbackTone}`}>
      <img
        key={type}
        src={imageMap[type]}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        loading="eager"
        decoding="async"
        onError={(event) => {
          event.currentTarget.style.display = "none";
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-white/12 via-transparent to-[#f8f2ea]/55" />
    </div>
  );
}

function ImagePlaceholder({ label = "keiko-main.webp" }) {
  return <div className="flex h-full w-full items-center justify-center rounded-3xl border border-dashed border-[#bda9d9] bg-white/35 p-5 text-center"><div><div className="text-xs font-black tracking-[0.24em] text-[#9d8ac7]">IMAGE AREA</div><div className="mt-3 rounded-2xl bg-white/70 px-4 py-3 text-lg font-black text-[#4a345d] shadow-sm">{label}</div></div></div>;
}

function Phone({ children }) {
  return <div className="mx-auto min-h-screen max-w-[430px] overflow-hidden bg-[#f7f1ea] shadow-2xl">{children}</div>;
}

function BackButton({ onClick }) {
  if (!onClick) return null;

  return (
    <button
      type="button"
      onClick={onClick}
      className="absolute left-4 top-4 z-30 rounded-full bg-white/75 px-4 py-2 text-sm font-bold text-[#6f5d86] shadow-md backdrop-blur-md"
    >
      ‹ 이전
    </button>
  );
}

function DialogueScreen({ item, name, onNext, onBack }) {
  return (
    <Phone>
      <div className="relative min-h-screen overflow-hidden">
        <Bg type={item.bg} />
        <BackButton onClick={onBack} />

        {item.character && (
          <div className="absolute bottom-[260px] right-16 z-10 h-[56%] w-[70%] max-w-[340px]">
            <img
              src="/images/characters/keiko-main.webp"
              alt="케이코쨩"
              className="h-full w-full object-contain drop-shadow-2xl"
            />
          </div>
        )}

        <div className="absolute inset-x-4 bottom-5 z-20 rounded-3xl border border-[#cdbbe4]/70 bg-white/85 p-5 shadow-2xl backdrop-blur-md">
          <div className="mb-3 inline-flex rounded-full bg-[#9d8ac7]/15 px-3 py-1 text-sm font-bold text-[#6f5d86]">
            {item.speaker}
          </div>

          <p className="whitespace-pre-line text-[18px] leading-8 text-[#303039]">
            {n(item.text, name || "너")}
          </p>

          <button
            type="button"
            onClick={onNext}
            className="mt-5 w-full rounded-2xl bg-[#3a3545] px-4 py-3 font-bold text-white"
          >
            {item.button}
          </button>
        </div>
      </div>
    </Phone>
  );
}

export default function App() {
  const resultRef = useRef(null);
  const [screen, setScreen] = useState("main");
  const [name, setName] = useState("");
  const [p, setP] = useState(0);
  const [s, setS] = useState(0);
  const [reaction, setReaction] = useState("");
  const [reactionImage, setReactionImage] = useState("keiko-neutral.webp");
  const [answers, setAnswers] = useState(Array(scenes.length).fill(null));

  useEffect(() => {
    const imageSources = [
      "/images/main/main-bg.webp",
      "/images/backgrounds/library-bg.webp",
      "/images/backgrounds/bookmark-closeup.webp",
      "/images/backgrounds/classroom.webp",
      "/images/backgrounds/campus.webp",
      "/images/backgrounds/rainy-campus.webp",
      "/images/backgrounds/hallway.webp",
      "/images/backgrounds/night-room.webp",
      "/images/backgrounds/park.webp",
      "/images/characters/keiko-main.webp",
    ];
  
    imageSources.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  const scores = useMemo(() => calculateScores(answers), [answers]);
  const ending = useMemo(() => endings[getEndingId(scores)], [scores]);

  const reset = () => {
    setScreen("main");
    setName("");
    setP(0);
    setS(0);
    setReaction("");
    setReactionImage("keiko-neutral.webp");
    setAnswers(Array(scenes.length).fill(null));
  
  };

  const saveResultImage = async () => {
    if (!resultRef.current) return;
  
    try {
      const dataUrl = await toPng(resultRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "#f7f1ea",
      });
  
      const link = document.createElement("a");
      link.download = `keiko-result-${ending.image.replace(".webp", "")}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("결과 이미지 저장 실패:", error);
      alert("이미지 저장에 실패했습니다. 크롬/사파리에서 열거나 화면 캡쳐를 이용해주세요.");
    }
  };

  const goNextAfterReaction = () => { if (s < scenes.length - 1) { const next = s + 1; setS(next); setScreen(scenes[next].intro ? "sceneIntro" : "choice"); } else setScreen("result"); };

  if (screen === "main") return (
    <Phone>
      <div className="relative min-h-screen overflow-hidden px-6 py-9 text-[#2f2f35]">
        <Bg type="main" />
  
        <div className="relative z-10 flex min-h-[calc(100vh-72px)] flex-col">
          <div>
            <div className="text-center text-xs font-bold tracking-[0.22em] text-[#7f6b9e]">
              미소녀 1인 심층 공략 미연시
            </div>
  
            <h1 className="mt-8 whitespace-pre-line text-5xl font-bold leading-tight tracking-[-0.08em] text-[#4a345d]">
              오늘도{`\n`}케이코쨩은{`\n`}웃지 않는다
            </h1>
  
            <div className="mt-4 text-lg italic text-[#806f8f]">
              Can you make Keiko smile?
            </div>
  
            <p className="mt-4 whitespace-pre-line text-[16px] leading-7 text-[#4b4650]">
              쉽게 웃지 않는 그녀, 케이코쨩.{`\n`}
              당신의 선택에 따라 그녀는 마음을 열 수도,{`\n`}
              조용히 떠나버릴 수도 있습니다.
            </p>
          </div>
  
          <div className="mt-auto pb-2">
            <img
              src="/images/ui/keiko-heart-title.png"
              alt="케이코쨩 마음훔치기"
              className="mx-auto mb-3 w-[78%] max-w-[340px]"
            />

            <div className="space-y-4">
              <input
                value={name}
                maxLength={8}
                onChange={(e) => setName(e.target.value)}
                placeholder="이름 입력"
                className="w-full rounded-2xl border border-[#cdbbe4] bg-white/85 px-4 py-4 text-lg outline-none"
              />

              <button
                type="button"
                onClick={() => setScreen("dialogue")}
                className="w-full rounded-2xl bg-[#3a3545] px-5 py-4 text-lg font-bold text-white shadow-lg"
              >
                도서관으로 들어가기
              </button>
            </div>
          </div>
        </div>
      </div>
    </Phone>
  );

  if (screen === "dialogue") return (
    <DialogueScreen
      item={prologue[p]}
      name={name}
      onBack={() => {
        if (p > 0) setP(p - 1);
        else setScreen("main");
      }}
      onNext={() => {
        if (p < prologue.length - 1) setP(p + 1);
        else setScreen("choice");
      }}
    />
  );
  if (screen === "sceneIntro") return (
    <DialogueScreen
      item={scenes[s].intro}
      name={name}
      onBack={() => {
        setS((prev) => {
          const previousScene = Math.max(prev - 1, 0);
          return previousScene;
        });
        setScreen("reaction");
      }}
      onNext={() => setScreen("choice")}
    />
  );
  

  if (screen === "choice") {
    const scene = scenes[s];
    return <Phone><div className="relative min-h-screen overflow-hidden px-5 py-6"><Bg type={scene.bg} /><div className="relative z-10"><div className="mb-4 flex items-center justify-between text-sm font-bold text-[#333333]"><button onClick={() => {
      if (s === 0) {
        setP(prologue.length - 1);
        setScreen("dialogue");
      } else {
        setScreen("sceneIntro");
      }
    }} className="rounded-full bg-white/75 px-3 py-2 shadow-sm">‹ 이전</button><span>{scene.progress}</span></div><div className="rounded-3xl border border-[#d8c9eb] bg-white/88 p-5 shadow-2xl backdrop-blur-md"><div className="mb-3 text-sm font-bold tracking-[0.16em] text-[#9d8ac7]">QUESTION</div><h2 className="text-2xl font-black text-[#3a3545]">{scene.title}</h2><p className="mt-4 whitespace-pre-line text-[17px] leading-7 text-[#48434d]">{n(scene.question, name || "너")}</p></div><div className="mt-4 space-y-3">{scene.choices.map((c) => <button key={c.id}
    onClick={() => {
      setAnswers((prev) => {
        const next = [...prev];
        next[s] = c;
        return next;
      });
    
      setReaction(c.reaction);
      setReactionImage(getReactionImage(c.scores));
      setScreen("reaction");
    }} className="w-full rounded-2xl border border-[#d8c9eb] bg-white/92 px-4 py-4 text-left text-[16px] font-semibold leading-6 text-[#3b3544] shadow-md active:scale-[0.99]"><span className="mr-2 text-[#8b73b6]">{c.id}.</span>{c.text}</button>)}</div></div></div></Phone>;
  }

  const currentAnswer = answers[s];
  const currentReaction = currentAnswer?.reaction || reaction;
  const currentReactionImage = currentAnswer ? getReactionImage(currentAnswer.scores) : reactionImage;

  if (screen === "reaction") return (
    <Phone>
      <div className="relative min-h-screen overflow-hidden px-5 py-8">
        <Bg type={scenes[s].bg} />
        <BackButton onClick={() => setScreen("choice")} />
  
        <div className="relative z-10 flex min-h-[calc(100vh-64px)] flex-col justify-end">
          <div className="mb-[-8px] flex justify-center">
            <img
              src={`/images/reactions/${currentReactionImage}`}
              alt="케이코쨩 반응"
              className="h-[46vh] max-h-[420px] w-auto object-contain drop-shadow-2xl"
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />
          </div>
  
          <div className="rounded-3xl border border-[#d8c9eb] bg-white/90 p-6 text-center shadow-2xl backdrop-blur-md">
            <div className="text-sm font-bold tracking-[0.2em] text-[#9d8ac7]">
              KEIKO RESPONSE
            </div>
  
            <p className="mt-5 whitespace-pre-line text-[22px] font-bold leading-9 text-[#3a3545]">
              “{currentReaction}”
            </p>
  
            <button
              type="button"
              onClick={goNextAfterReaction}
              className="mt-7 w-full rounded-2xl bg-[#3a3545] px-4 py-4 text-lg font-bold text-white"
            >
              다음
            </button>
          </div>
        </div>
      </div>
    </Phone>
  );
  
  return (
    <Phone>
      <div className="relative min-h-screen overflow-y-auto bg-[#f7f1ea] px-5 py-8 text-[#3a3545]">
        <BackButton onClick={() => setScreen("reaction")} />
  
        <div className="relative z-10 pt-12 pb-8">
          <div ref={resultRef} className="bg-[#f7f1ea]">
            {/* 엔딩 이미지 카드 */}
            <div className="relative z-10 overflow-hidden rounded-[30px] bg-white shadow-2xl">
              <img
                src={`/images/endings/${ending.image}`}
                alt={ending.title}
                className="block w-full object-contain"
              />
            </div>
  
            {/* 결과 텍스트 카드 */}
            <div className="relative z-20 -mt-48 rounded-[30px] border border-[#d8c9eb] bg-white/95 p-6 shadow-2xl backdrop-blur-md">
              <div className="text-sm font-bold tracking-[0.32em] text-[#9d8ac7]">
                {ending.number}
              </div>
  
              <h2 className="mt-3 text-3xl font-bold leading-tight text-[#3a3545]">
                {ending.title}
              </h2>
  
              <div className="mt-2 text-sm font-bold text-[#7f6b9e]">
                {ending.type}
              </div>
  
              <p className="mt-6 rounded-2xl bg-[#f7f2ec] p-4 text-lg font-bold leading-8 text-[#4b4650]">
                “{n(ending.quote, name || "너")}”
              </p>
  
              <p className="mt-5 whitespace-pre-line text-[16px] leading-8 text-[#4b4650]">
                {ending.desc}
              </p>
            </div>
          </div>
  
          <p className="mt-6 text-center text-sm font-bold leading-6 text-[#8a7c99]">
            인앱 브라우저에서는 결과저장이 안될 수도 있습니다.
            <br />
            크롬/사파리를 이용해주세요.
          </p>
  
          <button
            type="button"
            onClick={saveResultImage}
            className="mt-3 w-full rounded-2xl border border-[#cdbbe4] bg-white px-4 py-4 text-lg font-bold text-[#4a345d] shadow-md"
          >
            결과 이미지 저장
          </button>
  
          <button
            type="button"
            onClick={reset}
            className="mt-3 w-full rounded-2xl bg-[#3a3545] px-4 py-4 text-lg font-bold text-white"
          >
            다시하기
          </button>
        </div>
      </div>
    </Phone>
  );
  }