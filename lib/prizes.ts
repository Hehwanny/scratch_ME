export type PrizeTier = {
  name: string;
  description: string;
  weight: number;
  color: string; // Tailwind text color class
};

export const prizeTiers: PrizeTier[] = [
  { name: "1등", description: "오늘의 대박 행운!", weight: 1, color: "text-amber-400" },
  { name: "2등", description: "아주 큰 행운이 다가옵니다", weight: 2, color: "text-orange-400" },
  { name: "3등", description: "좋은 소식이 곧 찾아올 거예요", weight: 4, color: "text-lime-400" },
  { name: "4등", description: "기분 좋은 하루가 될 거예요", weight: 6, color: "text-green-400" },
  { name: "5등", description: "작은 행운이 함께합니다", weight: 10, color: "text-teal-400" },
  { name: "6등", description: "잔잔한 행복이 깃들어요", weight: 14, color: "text-cyan-400" },
  { name: "7등", description: "무난하지만 편안한 하루", weight: 18, color: "text-sky-400" },
  { name: "8등", description: "평온한 하루가 이어집니다", weight: 22, color: "text-blue-400" },
  { name: "9등", description: "아직 기회는 많아요", weight: 26, color: "text-indigo-400" },
  { name: "10등", description: "다시 도전해 보세요!", weight: 32, color: "text-slate-400" },
];

export function drawPrize(): PrizeTier {
  const totalWeight = prizeTiers.reduce((sum, tier) => sum + tier.weight, 0);
  const target = Math.random() * totalWeight;

  let acc = 0;
  for (const tier of prizeTiers) {
    acc += tier.weight;
    if (target <= acc) {
      return tier;
    }
  }

  return prizeTiers[prizeTiers.length - 1];
}
