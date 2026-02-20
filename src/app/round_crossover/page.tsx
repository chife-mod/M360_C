"use client";

import { useRef, useEffect } from "react";
import circleData from "./sneaker-circles-data.json";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Circle {
    homeX: number;
    homeY: number;
    radius: number;
    color: string;
    // Per-circle animation properties
    delay: number;        // 0–1 normalized entrance delay (position-based)
    springFreq: number;   // individual spring frequency for organic variation
    spreadY: number;      // vertical scatter amount during stream
}

// ─── Animation timing ─────────────────────────────────────────────────────────

const STREAM_DURATION = 2200;     // ms – circles stream in from right
const SETTLE_DURATION = 1200;     // ms – circles bounce/settle into final positions
const PAUSE_DURATION = 2000;      // ms – hold still
const EXIT_DURATION = 1000;       // ms – slide out left
const LOOP_GAP = 800;             // ms – gap before restarting

const TOTAL_CYCLE =
    STREAM_DURATION + SETTLE_DURATION + PAUSE_DURATION + EXIT_DURATION + LOOP_GAP;

// ─── Easing functions ─────────────────────────────────────────────────────────

function easeOutQuart(t: number): number {
    return 1 - Math.pow(1 - t, 4);
}

function easeInCubic(t: number): number {
    return t * t * t;
}

/** Underdamped spring: overshoots then settles to 1 */
function springSettle(t: number, freq: number): number {
    if (t <= 0) return 0;
    if (t >= 1) return 1;
    const damping = 4.0; // lower = more bouncy
    return 1 - Math.exp(-damping * t) * Math.cos(freq * t * Math.PI * 2);
}

// ─── Build circles from extracted data ────────────────────────────────────────

function buildCircles(canvasW: number, canvasH: number): Circle[] {
    const { imageWidth, imageHeight, circles: raw } = circleData;

    const scaleX = canvasW / imageWidth;
    const scaleY = canvasH / imageHeight;
    const scale = Math.min(scaleX, scaleY);

    const offsetX = (canvasW - imageWidth * scale) / 2;
    const offsetY = (canvasH - imageHeight * scale) / 2;

    // Deterministic pseudo-random per circle
    const seededRandom = (i: number) => {
        const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
        return x - Math.floor(x);
    };

    // Find bounding box for normalizing delays by position
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

        // Position-based delay: circles on the RIGHT of the sneaker arrive FIRST
        // (since they enter from the right), left-side circles arrive LAST
        // This creates the "swipe" effect – a wave sweeping left to right
        const positionFactor = 1 - (cx - minHomeX) / rangeX; // 0 = right (early), 1 = left (late)

        // Add randomness to prevent perfectly uniform wave
        const delay = positionFactor * 0.7 + rand * 0.3; // 0–1

        // Each circle gets its own spring frequency for organic feel
        const springFreq = 1.5 + rand2 * 1.2; // 1.5–2.7 cycles

        // Vertical scatter: circles spread vertically during stream
        const spreadY = (rand3 - 0.5) * 2 * (80 + r * 3); // larger circles spread more

        return {
            homeX: cx,
            homeY: cy,
            radius: r,
            color,
            delay,
            springFreq,
            spreadY,
        };
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

function CircleSneaker() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const circlesRef = useRef<Circle[]>([]);
    const mouseRef = useRef<{ x: number; y: number; active: boolean }>({
        x: -9999,
        y: -9999,
        active: false,
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
                x: c.homeX,
                y: c.homeY,
                vx: 0,
                vy: 0,
            }));
            startTimeRef.current = performance.now();
        };

        resize();
        window.addEventListener("resize", resize);

        // Mouse handling
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

        // ─── Animation loop ──────────────────────────────────────────────

        const animate = (now: number) => {
            const circles = circlesRef.current;
            const physics = physicsRef.current;
            const mouse = mouseRef.current;
            const w = canvas.width / dpr;
            const h = canvas.height / dpr;

            ctx.clearRect(0, 0, w, h);

            const elapsed = (now - startTimeRef.current) % TOTAL_CYCLE;
            const slideDistance = w * 1.1;

            // Phase boundaries
            const streamEnd = STREAM_DURATION;
            const settleEnd = streamEnd + SETTLE_DURATION;
            const pauseEnd = settleEnd + PAUSE_DURATION;
            const exitEnd = pauseEnd + EXIT_DURATION;

            let phase: "stream" | "settle" | "pause" | "exit" | "gap";
            let phaseT: number;

            if (elapsed < streamEnd) {
                phase = "stream";
                phaseT = elapsed / STREAM_DURATION;
            } else if (elapsed < settleEnd) {
                phase = "settle";
                phaseT = (elapsed - streamEnd) / SETTLE_DURATION;
            } else if (elapsed < pauseEnd) {
                phase = "pause";
                phaseT = (elapsed - settleEnd) / PAUSE_DURATION;
            } else if (elapsed < exitEnd) {
                phase = "exit";
                phaseT = (elapsed - pauseEnd) / EXIT_DURATION;
            } else {
                phase = "gap";
                phaseT = 0;
            }

            // Reset physics when entering pause
            if (phase === "pause" && phaseT < 0.02) {
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

                if (phase === "gap") {
                    continue;

                } else if (phase === "stream") {
                    // ── STREAM: circles flow in from the right as a dynamic swipe ──
                    // Each circle has its own timing based on delay
                    // The "window" for each circle is a portion of the total stream time
                    const circleWindow = 0.45; // each circle's animation takes 45% of stream time
                    const circleStart = c.delay * (1 - circleWindow);
                    const circleEnd = circleStart + circleWindow;

                    if (phaseT < circleStart) {
                        // Haven't entered yet — offscreen right
                        drawX = w + slideDistance * 0.3 + c.homeX * 0.5;
                        drawY = c.homeY + c.spreadY * 0.6;
                    } else if (phaseT > circleEnd) {
                        // Already at target — but with residual scatter for settle phase
                        drawX = c.homeX;
                        drawY = c.homeY;
                    } else {
                        // Animating in
                        const localT = (phaseT - circleStart) / circleWindow;
                        const eased = easeOutQuart(localT);

                        // Start position: far right + vertical scatter
                        const startX = w + slideDistance * 0.3 + c.homeX * 0.3;
                        const startY = c.homeY + c.spreadY * 0.6;

                        drawX = startX + (c.homeX - startX) * eased;
                        drawY = startY + (c.homeY - startY) * eased;
                    }

                } else if (phase === "settle") {
                    // ── SETTLE: circles that just arrived bounce into exact position ──
                    // Circles that arrived early are already settled
                    // Late circles still have residual energy and spring into place
                    const settleProgress = springSettle(phaseT, c.springFreq);

                    // Residual offset: late circles (high delay) have more residual motion
                    const residualAmount = c.delay * 18; // up to 18px overshoot for latest circles
                    const residualX = residualAmount * (1 - settleProgress);
                    const residualY = c.spreadY * 0.08 * (1 - settleProgress);

                    drawX = c.homeX + residualX;
                    drawY = c.homeY + residualY;

                } else if (phase === "pause") {
                    // ── PAUSE: cursor interaction ──
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
                        p.x = c.homeX;
                        p.y = c.homeY;
                        p.vx = 0;
                        p.vy = 0;
                    }

                    drawX = p.x;
                    drawY = p.y;

                } else {
                    // ── EXIT: all slide left together ──
                    const eased = easeInCubic(phaseT);
                    drawX = c.homeX - slideDistance * eased;
                    drawY = c.homeY;
                }

                // Draw
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
    }, []);

    return (
        <div className="relative w-full h-full flex items-center justify-center">
            <div
                className="relative"
                style={{ width: "700px", height: "700px" }}
            >
                <canvas
                    ref={canvasRef}
                    className="block cursor-default"
                    style={{ width: "700px", height: "700px" }}
                />
            </div>
        </div>
    );
}

export default function RoundCrossoverPage() {
    return (
        <main className="min-h-screen flex items-center justify-center bg-white">
            <CircleSneaker />
        </main>
    );
}
