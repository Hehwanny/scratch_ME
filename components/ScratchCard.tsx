// components/ScratchCard.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import { drawPrize, PrizeTier } from "@/lib/prizes";

const CARD_WIDTH = 320;
const CARD_HEIGHT = 180;
const BRUSH_RADIUS = 24;
const REVEAL_THRESHOLD = 0.6; // 60%

function getCanvasPos(
  e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>,
  canvas: HTMLCanvasElement
) {
  const rect = canvas.getBoundingClientRect();

  if ("touches" in e) {
    const touch = e.touches[0];
    return {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
    };
  } else {
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }
}

function calculateClearedRatio(ctx: CanvasRenderingContext2D) {
  const { width, height } = ctx.canvas;
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  let cleared = 0;
  // 알파값만 간단히 확인 (4바이트마다 alpha)
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] === 0) {
      cleared++;
    }
  }

  const totalPixels = width * height;
  return cleared / totalPixels;
}

export const ScratchCard: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [clearedRatio, setClearedRatio] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [prize] = useState<PrizeTier>(() => drawPrize());

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = CARD_WIDTH;
    canvas.height = CARD_HEIGHT;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 스크래치 코팅 초기화
    ctx.globalCompositeOperation = "source-over";
    const gradient = ctx.createLinearGradient(0, 0, CARD_WIDTH, CARD_HEIGHT);
    gradient.addColorStop(0, "#9ca3af");
    gradient.addColorStop(1, "#4b5563");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

    ctx.fillStyle = "rgba(255,255,255,0.3)";
    ctx.font = "bold 20px system-ui";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("긁어서 확인!", CARD_WIDTH / 2, CARD_HEIGHT / 2);
  }, []);

  const startDrawing = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    e.preventDefault();
    if (revealed) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsDrawing(true);
    scratch(e, canvas);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const scratch = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>,
    canvas: HTMLCanvasElement
  ) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { x, y } = getCanvasPos(e, canvas);

    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(x, y, BRUSH_RADIUS, 0, Math.PI * 2);
    ctx.fill();

    // 긁힌 비율 계산
    const ratio = calculateClearedRatio(ctx);
    setClearedRatio(ratio);

    if (ratio >= REVEAL_THRESHOLD && !revealed) {
      setRevealed(true);
    }
  };

  const handleMove = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    e.preventDefault();
    if (!isDrawing || revealed) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    scratch(e, canvas);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        {/* 결과 카드 (밑 레이어) */}
        <div className="absolute inset-0 flex flex-col items-center justify-center rounded-xl bg-slate-900 border border-slate-700 px-6 py-4">
          <p className="text-sm text-slate-400 mb-1">오늘의 복권 결과</p>
          <p className={`text-4xl font-bold ${prize.color}`}>{prize.name}</p>
          <p className="mt-3 text-sm text-slate-300 text-center max-w-xs">
            {prize.description}
          </p>
        </div>

        {/* 스크래치 캔버스 (윗 레이어) */}
        <canvas
          ref={canvasRef}
          className={`block rounded-xl shadow-xl border border-slate-500 touch-none ${
            revealed ? "opacity-0 transition-opacity duration-500" : ""
          }`}
          onMouseDown={startDrawing}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onMouseMove={handleMove}
          onTouchStart={startDrawing}
          onTouchEnd={stopDrawing}
          onTouchCancel={stopDrawing}
          onTouchMove={handleMove}
        />
      </div>

      <div className="text-xs text-slate-400">
        긁힌 정도: {(clearedRatio * 100).toFixed(0)}%
        {revealed ? "  · 결과가 모두 공개됐어!" : "  · 60% 이상 긁으면 자동 공개"}
      </div>
    </div>
  );
};
