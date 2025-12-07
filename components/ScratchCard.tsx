"use client";

import React, { useEffect, useRef, useState } from "react";
import { drawPrize, PrizeTier } from "@/lib/prizes";

const CARD_WIDTH = 480;
const CARD_HEIGHT = 280;
const BRUSH_RADIUS = 28;
const REVEAL_THRESHOLD = 0.6;

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

function calcClearedRatio(ctx: CanvasRenderingContext2D) {
  const { width, height } = ctx.canvas;
  const data = ctx.getImageData(0, 0, width, height).data;
  let cleared = 0;
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] === 0) cleared++;
  }
  return cleared / (width * height);
}

export function ScratchCard() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [prize, setPrize] = useState<PrizeTier | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [clearedRatio, setClearedRatio] = useState(0);
  const drawingRef = useRef(false);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);

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
    gradient.addColorStop(1, "#6b7280");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);
  }, []);

  useEffect(() => {
    if (!revealed) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }, [revealed]);

  const scratch = (from: { x: number; y: number }, to: { x: number; y: number }) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || revealed) return;

    ctx.globalCompositeOperation = "destination-out";
    ctx.lineWidth = BRUSH_RADIUS * 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();

    const ratio = calcClearedRatio(ctx);
    setClearedRatio(ratio);
    if (ratio >= REVEAL_THRESHOLD) {
      setRevealed(true);
    }
  };

  const handleStart = (e: CanvasEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas || revealed) return;
    const pos = getPos(e, canvas);
    drawingRef.current = true;
    lastPosRef.current = pos;
    scratch(pos, pos);
  };

  const handleMove = (e: CanvasEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas || !drawingRef.current || revealed) return;
    const current = getPos(e, canvas);
    const last = lastPosRef.current ?? current;
    scratch(last, current);
    lastPosRef.current = current;
  };

  const handleEnd = () => {
    drawingRef.current = false;
    lastPosRef.current = null;
  };

  const prizeName = prize?.name ?? "결과 대기 중";
  const prizeDesc = prize?.description ?? "긁어서 결과를 확인하세요.";
  const prizeColor = prize?.color ?? "text-slate-700";

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative rounded-2xl bg-white shadow-md border border-slate-200 p-4">
        <div className="w-[480px]">
          <div className="relative flex flex-col items-center gap-3 rounded-xl bg-white p-4">
            <div className="text-center space-y-1">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                Scratch &amp; Reveal
              </p>
              <p className="text-2xl font-semibold text-slate-800">scratch me</p>
            </div>

            <div className="relative w-full overflow-hidden rounded-lg bg-slate-50 border border-slate-200 p-4">
              <div className="pointer-events-none absolute inset-0 z-0 flex flex-col items-center justify-center gap-2 px-4 text-center">
                <p className={`text-2xl font-semibold ${prizeColor}`}>{prizeName}</p>
                <p className="text-sm text-slate-600">{prizeDesc}</p>
              </div>

              <canvas
                ref={canvasRef}
                className={`relative z-10 h-[180px] w-full rounded-[4px] border border-slate-300 shadow-sm touch-none ${
                  revealed ? "opacity-0 transition-opacity duration-300" : "opacity-100"
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
          </div>
        </div>
      </div>

      <div className="text-xs text-slate-600">
        {Math.round(clearedRatio * 100)}% 공개됨 · 60% 이상 긁으면 자동 공개
      </div>
    </div>
  );
}
