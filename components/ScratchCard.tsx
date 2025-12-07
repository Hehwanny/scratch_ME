"use client";

import React, { useEffect, useRef, useState } from "react";
import { drawPrize, PrizeTier } from "@/lib/prizes";

const CARD_WIDTH = 320;
const CARD_HEIGHT = 180;
const BRUSH_RADIUS = 24;
const REVEAL_THRESHOLD = 0.6; // 60%

type CanvasEvent =
  | React.MouseEvent<HTMLCanvasElement>
  | React.TouchEvent<HTMLCanvasElement>;

function getPos(e: CanvasEvent, canvas: HTMLCanvasElement) {
  const rect = canvas.getBoundingClientRect();
  if ("touches" in e) {
    const t = e.touches[0];
    return { x: t.clientX - rect.left, y: t.clientY - rect.top };
  }
  return { x: e.clientX - rect.left, y: e.clientY - rect.top };
}

function clearedRatio(ctx: CanvasRenderingContext2D) {
  const { width, height } = ctx.canvas;
  const data = ctx.getImageData(0, 0, width, height).data;
  let cleared = 0;
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] === 0) cleared++;
  }
  return cleared / (width * height);
}

export const ScratchCard: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [prize, setPrize] = useState<PrizeTier | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [cleared, setCleared] = useState(0);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    setPrize(drawPrize());

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = CARD_WIDTH * dpr;
    canvas.height = CARD_HEIGHT * dpr;
    canvas.style.width = `${CARD_WIDTH}px`;
    canvas.style.height = `${CARD_HEIGHT}px`;
    ctx.scale(dpr, dpr);

    ctx.globalCompositeOperation = "source-over";
    const gradient = ctx.createLinearGradient(0, 0, CARD_WIDTH, CARD_HEIGHT);
    gradient.addColorStop(0, "#9ca3af");
    gradient.addColorStop(1, "#4b5563");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

    ctx.fillStyle = "rgba(255,255,255,0.3)";
    ctx.font = "bold 18px system-ui";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("긁어서 확인!", CARD_WIDTH / 2, CARD_HEIGHT / 2);
  }, []);

  const scratchLine = (from: { x: number; y: number }, to: { x: number; y: number }) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || revealed) return;

    ctx.globalCompositeOperation = "destination-out";
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = BRUSH_RADIUS * 2;

    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();

    const ratio = clearedRatio(ctx);
    setCleared(ratio);
    if (ratio >= REVEAL_THRESHOLD) setRevealed(true);
  };

  const lastPosRef = useRef<{ x: number; y: number } | null>(null);

  const handleStart = (e: CanvasEvent) => {
    e.preventDefault();
    if (revealed) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const pos = getPos(e, canvas);
    lastPosRef.current = pos;
    setIsDrawing(true);
    scratchLine(pos, pos);
  };

  const handleMove = (e: CanvasEvent) => {
    e.preventDefault();
    if (!isDrawing || revealed) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const current = getPos(e, canvas);
    const last = lastPosRef.current ?? current;
    scratchLine(last, current);
    lastPosRef.current = current;
  };

  const handleEnd = () => {
    setIsDrawing(false);
    lastPosRef.current = null;
  };

  const displayName = revealed && prize ? prize.name : "????";
  const displayDesc = revealed && prize ? prize.description : "카드를 긁어 결과를 확인하세요.";
  const displayColor = revealed && prize ? prize.color : "text-slate-200";

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className="relative rounded-xl shadow-xl border border-slate-500 overflow-hidden"
        style={{ width: CARD_WIDTH, height: CARD_HEIGHT }}
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 px-6 py-4 text-center">
          <p className="text-sm text-slate-400 mb-1">오늘의 복권</p>
          <p className={`text-4xl font-bold ${displayColor}`}>{displayName}</p>
          <p className="mt-3 text-sm text-slate-300 text-center max-w-xs">{displayDesc}</p>
        </div>

        <canvas
          ref={canvasRef}
          className={`absolute inset-0 z-10 ${
            revealed ? "opacity-0 transition-opacity duration-500" : "opacity-100"
          }`}
          onMouseDown={handleStart}
          onMouseMove={handleMove}
          onMouseUp={handleEnd}
          onMouseLeave={handleEnd}
          onTouchStart={handleStart}
          onTouchMove={handleMove}
          onTouchEnd={handleEnd}
          onTouchCancel={handleEnd}
        />
      </div>

      <div className="text-xs text-slate-400">
        긁힌 면적: {(cleared * 100).toFixed(0)}%
        {revealed
          ? " · 결과가 모두 공개되었습니다!"
          : " · 60% 이상 긁으면 자동으로 공개됩니다"}
      </div>
    </div>
  );
};
