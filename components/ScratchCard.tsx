"use client";

import React, { useEffect, useRef, useState } from "react";
import { drawPrize, PrizeTier } from "@/lib/prizes";

const CARD_WIDTH = 520;
const CARD_HEIGHT = 340;
const BRUSH_RADIUS = 32;
const REVEAL_THRESHOLD = 0.7;

type CanvasEvent =
  | React.MouseEvent<HTMLCanvasElement>
  | React.TouchEvent<HTMLCanvasElement>;

function getCanvasPos(e: CanvasEvent, canvas: HTMLCanvasElement) {
  const rect = canvas.getBoundingClientRect();

  if ("touches" in e) {
    const touch = e.touches[0];
    return {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
    };
  }

  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top,
  };
}

function calculateClearedRatio(ctx: CanvasRenderingContext2D) {
  const { width, height } = ctx.canvas;
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  let cleared = 0;
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
  const [prize, setPrize] = useState<PrizeTier | null>(null);

  const lastPosRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    setPrize(drawPrize());

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { width, height } = canvas.getBoundingClientRect();
    canvas.width = width;
    canvas.height = height;

    ctx.globalCompositeOperation = "source-over";
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, "#cfd3da");
    gradient.addColorStop(1, "#9da2ad");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = "rgba(255,255,255,0.32)";
    ctx.font = "700 20px 'Caveat', 'Segoe UI', system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Scratch to reveal", width / 2, height / 2);
  }, []);

  const startDrawing = (e: CanvasEvent) => {
    e.preventDefault();
    if (revealed) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const pos = getCanvasPos(e, canvas);
    lastPosRef.current = pos;
    setIsDrawing(true);
    scratchLine(canvas, pos, pos);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    lastPosRef.current = null;
  };

  const scratchLine = (
    canvas: HTMLCanvasElement,
    from: { x: number; y: number },
    to: { x: number; y: number }
  ) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.globalCompositeOperation = "destination-out";
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = BRUSH_RADIUS * 2;

    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();

    const ratio = calculateClearedRatio(ctx);
    setClearedRatio(ratio);

    if (ratio >= REVEAL_THRESHOLD && !revealed) {
      setRevealed(true);
    }
  };

  const handleMove = (e: CanvasEvent) => {
    e.preventDefault();
    if (!isDrawing || revealed) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const lastPos = lastPosRef.current;
    const currentPos = getCanvasPos(e, canvas);
    if (!lastPos) {
      lastPosRef.current = currentPos;
      return;
    }

    scratchLine(canvas, lastPos, currentPos);
    lastPosRef.current = currentPos;
  };

  const prizeName = prize ? prize.name : "곧 공개됩니다";
  const prizeDesc = prize
    ? prize.description
    : "긁어서 오늘의 행운을 확인하세요.";
  const prizeColor = prize ? prize.color : "text-purple-900";

  useEffect(() => {
    if (!revealed) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }, [revealed]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#efe4ff] via-[#eef2ff] to-[#e3f2ff] px-4 py-10">
      <div
        className="relative overflow-hidden rounded-2xl border border-white/70 shadow-xl ticket-brush"
        style={{ width: CARD_WIDTH, height: CARD_HEIGHT }}
      >
        <div className="absolute inset-0 flex flex-col justify-between px-8 py-6">
          <div className="flex-1 flex items-start justify-center">
            <p className="handwrite text-5xl text-[#3b2a7a] drop-shadow-sm">
              scratch me
            </p>
          </div>

          <div className="flex-1 flex items-end">
            <div className="w-full">
              <div className="relative rounded-lg border border-dotted border-purple-200/80 bg-[#d8c7ff]/60 p-3 shadow-inner backdrop-blur-sm">
                <div className="pointer-events-none absolute inset-0 z-0 flex flex-col items-center justify-center gap-2 px-6">
                  <p className={`text-3xl font-semibold ${prizeColor}`}>
                    {prizeName}
                  </p>
                  <p className="max-w-md text-center text-sm leading-relaxed text-purple-900/80">
                    {prizeDesc}
                  </p>
                </div>

                <canvas
                  ref={canvasRef}
                  className={`scratch-metal relative z-10 block h-[150px] w-full rounded-[3px] border border-white/60 shadow-md touch-none ${
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
            </div>
          </div>
        </div>
      </div>

      <div className="ml-4 text-xs text-purple-900/70">
        {revealed
          ? "결과가 완전히 공개되었습니다"
          : "아래 은색 영역을 긁어보세요"}{" "}
        ({Math.round(clearedRatio * 100)}% 공개)
      </div>
    </div>
  );
};
