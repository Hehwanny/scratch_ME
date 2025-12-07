// lib/prizes.ts

export type PrizeTier = {
  id: number;          // 1 ~ 10
  name: string;        // "1등", "2등" ...
  description: string; // 표시용 문구
  weight: number;      // 확률 가중치
  color: string;       // Tailwind 색상 클래스용
};

export const prizeTiers: PrizeTier[] = [
  {
    id: 1,
    name: "1등",
    description: "오늘은 진짜 미쳤다. 뭘 해도 되는 날.",
    weight: 10,
    color: "text-yellow-300",
  },
  {
    id: 2,
    name: "2등",
    description: "강하게 밀어붙여도 되는 운세.",
    weight: 20,
    color: "text-amber-300",
  },
  {
    id: 3,
    name: "3등",
    description: "분위기 좋다. 새 시도 한 번 해볼 만해.",
    weight: 40,
    color: "text-orange-300",
  },
  {
    id: 4,
    name: "4등",
    description: "기대 안 했던 곳에서 좋은 소식이 올지도?",
    weight: 80,
    color: "text-emerald-300",
  },
  {
    id: 5,
    name: "5등",
    description: "무난하지만, 작은 운은 따라주는 날.",
    weight: 200,
    color: "text-sky-300",
  },
  {
    id: 6,
    name: "6등",
    description: "실수만 조심하면 나쁘지 않다.",
    weight: 500,
    color: "text-blue-300",
  },
  {
    id: 7,
    name: "7등",
    description: "조금 굴곡은 있어도 버틸 수 있는 날.",
    weight: 1000,
    color: "text-indigo-300",
  },
  {
    id: 8,
    name: "8등",
    description: "컨디션 관리만 잘 해두자.",
    weight: 1800,
    color: "text-purple-300",
  },
  {
    id: 9,
    name: "9등",
    description: "별일 없으면 그게 좋은 거지 뭐.",
    weight: 3000,
    color: "text-pink-300",
  },
  {
    id: 10,
    name: "10등",
    description: "그래도 꽝은 아니잖아. 한 번 웃고 가자.",
    weight: 4350,
    color: "text-neutral-300",
  },
];

export function drawPrize(): PrizeTier {
  const totalWeight = prizeTiers.reduce((sum, tier) => sum + tier.weight, 0);
  const rnd = Math.random() * totalWeight;

  let acc = 0;
  for (const tier of prizeTiers) {
    acc += tier.weight;
    if (rnd <= acc) {
      return tier;
    }
  }

  // 이론상 여기 안 오는데, 타입 안전을 위해 마지막 등수 반환
  return prizeTiers[prizeTiers.length - 1];
}
