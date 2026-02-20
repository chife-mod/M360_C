"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import circleData from "./sneaker-circles-data.json";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Circle {
    homeX: number;
    homeY: number;
    radius: number;
    color: string;
    delay: number;
    springFreq: number;
    spreadY: number;
}

// ─── Animation timing ─────────────────────────────────────────────────────────

const STREAM_DURATION = 2200;
const SETTLE_DURATION = 1200;
// After stream + settle, stays interactive forever

// ─── Easing functions ─────────────────────────────────────────────────────────

function easeOutQuart(t: number): number {
    return 1 - Math.pow(1 - t, 4);
}

function springSettle(t: number, freq: number): number {
    if (t <= 0) return 0;
    if (t >= 1) return 1;
    const damping = 4.0;
    return 1 - Math.exp(-damping * t) * Math.cos(freq * t * Math.PI * 2);
}

// ─── Build circles ────────────────────────────────────────────────────────────

function buildCircles(canvasW: number, canvasH: number): Circle[] {
    const { imageWidth, imageHeight, circles: raw } = circleData;

    const scaleX = canvasW / imageWidth;
    const scaleY = canvasH / imageHeight;
    const scale = Math.min(scaleX, scaleY);

    const offsetX = (canvasW - imageWidth * scale) / 2;
    const offsetY = (canvasH - imageHeight * scale) / 2;

    const seededRandom = (i: number) => {
        const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
        return x - Math.floor(x);
    };

    let minHomeX = Infinity, maxHomeX = -Infinity;
    const mapped = raw.map((c: { x: number; y: number; r: number; c: string }, i: number) => {
        const cx = c.x * scale + offsetX;
        const cy = c.y * scale + offsetY;
        const r = c.r * scale;
        if (cx < minHomeX) minHomeX = cx;
        if (cx > maxHomeX) maxHomeX = cx;
        return { cx, cy, r, color: c.c, i };
    });

    const rangeX = maxHomeX - minHomeX || 1;

    return mapped.map(({ cx, cy, r, color, i }) => {
        const rand = seededRandom(i);
        const rand2 = seededRandom(i + 500);
        const rand3 = seededRandom(i + 1000);

        const positionFactor = 1 - (cx - minHomeX) / rangeX;
        const delay = positionFactor * 0.7 + rand * 0.3;
        const springFreq = 1.5 + rand2 * 1.2;
        const spreadY = (rand3 - 0.5) * 2 * (80 + r * 3);

        return { homeX: cx, homeY: cy, radius: r, color, delay, springFreq, spreadY };
    });
}

// ─── Cursor interaction constants ─────────────────────────────────────────────

const CURSOR_RADIUS = 100;
const REPEL_STRENGTH = 6000;
const SPRING_STIFFNESS = 0.06;
const DAMPING_CURSOR = 0.84;
const MAX_DISPLACEMENT = 45;
const VELOCITY_THRESHOLD = 0.01;

// ─── Component ────────────────────────────────────────────────────────────────

function CircleSneaker({ replayKey }: { replayKey: number }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const circlesRef = useRef<Circle[]>([]);
    const mouseRef = useRef<{ x: number; y: number; active: boolean }>({
        x: -9999, y: -9999, active: false,
    });
    const rafRef = useRef<number>(0);
    const dprRef = useRef<number>(1);
    const startTimeRef = useRef<number>(0);
    const physicsRef = useRef<{ x: number; y: number; vx: number; vy: number }[]>([]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        dprRef.current = dpr;

        const resize = () => {
            const parent = canvas.parentElement;
            if (!parent) return;
            const rect = parent.getBoundingClientRect();
            const w = rect.width;
            const h = rect.height;
            canvas.width = w * dpr;
            canvas.height = h * dpr;
            canvas.style.width = `${w}px`;
            canvas.style.height = `${h}px`;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            circlesRef.current = buildCircles(w, h);
            physicsRef.current = circlesRef.current.map((c) => ({
                x: c.homeX, y: c.homeY, vx: 0, vy: 0,
            }));
        };

        resize();
        startTimeRef.current = performance.now();
        window.addEventListener("resize", resize);

        const onMouseMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            mouseRef.current.x = e.clientX - rect.left;
            mouseRef.current.y = e.clientY - rect.top;
            mouseRef.current.active = true;
        };
        const onMouseLeave = () => {
            mouseRef.current.active = false;
            mouseRef.current.x = -9999;
            mouseRef.current.y = -9999;
        };
        canvas.addEventListener("mousemove", onMouseMove);
        canvas.addEventListener("mouseleave", onMouseLeave);

        const animate = (now: number) => {
            const circles = circlesRef.current;
            const physics = physicsRef.current;
            const mouse = mouseRef.current;
            const w = canvas.width / dpr;
            const h = canvas.height / dpr;

            ctx.clearRect(0, 0, w, h);

            const elapsed = now - startTimeRef.current;
            const slideDistance = w * 1.1;

            const streamEnd = STREAM_DURATION;
            const settleEnd = streamEnd + SETTLE_DURATION;

            let phase: "stream" | "settle" | "interactive";
            let phaseT: number;

            if (elapsed < streamEnd) {
                phase = "stream";
                phaseT = elapsed / STREAM_DURATION;
            } else if (elapsed < settleEnd) {
                phase = "settle";
                phaseT = (elapsed - streamEnd) / SETTLE_DURATION;
            } else {
                phase = "interactive";
                phaseT = 0;
            }

            // Snap physics to home when first entering interactive
            if (phase === "interactive" && elapsed - settleEnd < 32) {
                for (let i = 0; i < physics.length; i++) {
                    physics[i].x = circles[i].homeX;
                    physics[i].y = circles[i].homeY;
                    physics[i].vx = 0;
                    physics[i].vy = 0;
                }
            }

            for (let i = 0; i < circles.length; i++) {
                const c = circles[i];
                let drawX: number;
                let drawY: number;

                if (phase === "stream") {
                    const circleWindow = 0.45;
                    const circleStart = c.delay * (1 - circleWindow);
                    const circleEnd = circleStart + circleWindow;

                    if (phaseT < circleStart) {
                        drawX = w + slideDistance * 0.3 + c.homeX * 0.5;
                        drawY = c.homeY + c.spreadY * 0.6;
                    } else if (phaseT > circleEnd) {
                        drawX = c.homeX;
                        drawY = c.homeY;
                    } else {
                        const localT = (phaseT - circleStart) / circleWindow;
                        const eased = easeOutQuart(localT);
                        const startX = w + slideDistance * 0.3 + c.homeX * 0.3;
                        const startY = c.homeY + c.spreadY * 0.6;
                        drawX = startX + (c.homeX - startX) * eased;
                        drawY = startY + (c.homeY - startY) * eased;
                    }

                } else if (phase === "settle") {
                    const settleProgress = springSettle(phaseT, c.springFreq);
                    const residualAmount = c.delay * 18;
                    drawX = c.homeX + residualAmount * (1 - settleProgress);
                    drawY = c.homeY + c.spreadY * 0.08 * (1 - settleProgress);

                } else {
                    // Interactive — cursor repulsion + spring back to home
                    const p = physics[i];
                    const dhx = c.homeX - p.x;
                    const dhy = c.homeY - p.y;
                    let fx = dhx * SPRING_STIFFNESS;
                    let fy = dhy * SPRING_STIFFNESS;

                    if (mouse.active) {
                        const dmx = p.x - mouse.x;
                        const dmy = p.y - mouse.y;
                        const dist = Math.sqrt(dmx * dmx + dmy * dmy);
                        if (dist < CURSOR_RADIUS && dist > 0.1) {
                            const falloff = 1 - dist / CURSOR_RADIUS;
                            const force = (REPEL_STRENGTH * falloff * falloff) / dist;
                            fx += (dmx / dist) * force * 0.016;
                            fy += (dmy / dist) * force * 0.016;
                        }
                    }

                    p.vx = (p.vx + fx) * DAMPING_CURSOR;
                    p.vy = (p.vy + fy) * DAMPING_CURSOR;
                    p.x += p.vx;
                    p.y += p.vy;

                    const ddx = p.x - c.homeX;
                    const ddy = p.y - c.homeY;
                    const dd = Math.sqrt(ddx * ddx + ddy * ddy);
                    if (dd > MAX_DISPLACEMENT) {
                        p.x = c.homeX + (ddx / dd) * MAX_DISPLACEMENT;
                        p.y = c.homeY + (ddy / dd) * MAX_DISPLACEMENT;
                    }
                    if (!mouse.active && Math.abs(p.vx) < VELOCITY_THRESHOLD &&
                        Math.abs(p.vy) < VELOCITY_THRESHOLD && dd < 0.5) {
                        p.x = c.homeX; p.y = c.homeY; p.vx = 0; p.vy = 0;
                    }

                    drawX = p.x;
                    drawY = p.y;
                }

                ctx.beginPath();
                ctx.arc(drawX, drawY, c.radius, 0, Math.PI * 2);
                ctx.fillStyle = c.color;
                ctx.fill();
            }

            rafRef.current = requestAnimationFrame(animate);
        };

        rafRef.current = requestAnimationFrame(animate);

        return () => {
            cancelAnimationFrame(rafRef.current);
            window.removeEventListener("resize", resize);
            canvas.removeEventListener("mousemove", onMouseMove);
            canvas.removeEventListener("mouseleave", onMouseLeave);
        };
    }, [replayKey]);

    return (
        <div className="relative w-full h-full flex items-center justify-center">
            <div style={{ width: "700px", height: "700px", position: "relative" }}>
                <canvas
                    ref={canvasRef}
                    style={{ display: "block", width: "700px", height: "700px", cursor: "default" }}
                />
            </div>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function RoundCrossoverPage() {
    const [replayKey, setReplayKey] = useState(0);
    const [hovered, setHovered] = useState(false);

    const replay = useCallback(() => {
        setReplayKey((k) => k + 1);
    }, []);

    return (
        <main style={{ minHeight: "100vh", backgroundColor: "#111539", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-inter), Inter, system-ui, sans-serif" }}>
            <CircleSneaker replayKey={replayKey} />

            {/* Replay button */}
            <button
                onClick={replay}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                style={{
                    marginTop: 24,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    padding: "8px 16px",
                    borderRadius: 8,
                    color: hovered ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.3)",
                    fontSize: 13,
                    transition: "color 0.15s ease",
                    outline: "none",
                }}
            >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ opacity: hovered ? 0.7 : 0.3, transition: "opacity 0.15s ease" }}>
                    <path d="M1.5 7A5.5 5.5 0 1 0 3.2 3.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M1.5 2v1.5H3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Replay
            </button>
        </main>
    );
}
