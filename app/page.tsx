import { ScratchCard } from "@/components/ScratchCard";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-100 text-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-2xl flex flex-col items-center gap-6">
        <header className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            스크래치 복권
          </h1>
          <p className="text-sm md:text-base text-slate-600">
            카드를 긁어서 오늘의 결과를 확인하세요. 60% 이상 긁으면 자동으로 전체 공개됩니다.
          </p>
        </header>

        <ScratchCard />

        <footer className="text-xs text-slate-500 text-center">
          마우스 또는 터치로 긁을 수 있습니다.
        </footer>
      </div>
    </main>
  );
}
