// app/page.tsx
import { ScratchCard } from "@/components/ScratchCard";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-xl flex flex-col items-center gap-8">
        <header className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            오늘의 운을 긁어볼까?
          </h1>
          <p className="text-sm md:text-base text-slate-400">
            매일 한 번, 아무 것도 걸지 않고 그냥 오늘의 운을 시험해보는 복권.
            <br />
            카드를 천천히 긁어보면서, 실루엣이 드러나는 그 순간을 즐겨봐.
          </p>
        </header>

        <ScratchCard />

        <footer className="text-[11px] text-slate-500 text-center mt-4">
          이 사이트는 실제 금전 거래나 당첨금을 제공하지 않는, 순수 엔터테인먼트용
          복권 경험입니다.
        </footer>
      </div>
    </main>
  );
}
