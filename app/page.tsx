// app/page.tsx
import { ScratchCard } from "@/components/ScratchCard";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#efe4ff] via-[#eef2ff] to-[#e3f2ff] text-slate-800 flex items-center justify-center px-4">
      <div className="w-full max-w-3xl flex flex-col items-center gap-8">
        <header className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[#3b2a7a]">
            오늘의 스크래치 복권
          </h1>
          <p className="text-sm md:text-base text-slate-600">
            아래 은색 영역을 긁어 오늘의 행운을 확인하세요. 60% 이상 긁으면 자동으로
            전체 공개됩니다.
          </p>
        </header>

        <ScratchCard />

        <footer className="text-[12px] text-slate-500 text-center mt-4">
          긁은 면적 비율이 60%를 넘으면 결과가 완전히 드러납니다.
        </footer>
      </div>
    </main>
  );
}
