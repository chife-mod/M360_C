"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

const STATES = [
  "Default",
  "Hover",
  "Active",
  "Active Hover",
  "Selected",
  "Selected Hover",
  "Disable",
] as const;

type CardState = (typeof STATES)[number];

const GREEN = "rgba(70, 254, 195, 1)";

const stateFileMap: Record<CardState, string> = {
  Default: "default",
  Hover: "hover",
  Active: "active",
  "Active Hover": "active-hover",
  Selected: "selected",
  "Selected Hover": "selected-hover",
  Disable: "disable",
};

type S = {
  bg: string;
  borderType: "gradient" | "solid" | "none";
  borderStyle?: "solid" | "dashed" | "dotted";
  borderColor?: string;
  gradientStops?: string;
  borderWidth: number;
  shadow: string;
  glowOpacity: number;
  glowColor: string;
  showCornerGlow: boolean;
  iconOpacity: number;
  iconColor: string;
  iconStrokeWidth: number;
  textOpacity: number;
  textColor: string;
  dotFill: string;
};

const cardStyles: Record<CardState, S> = {
  Default: {
    bg: "rgba(17, 21, 57, 1)",
    borderType: "gradient",
    gradientStops: "rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.1) 100%",
    borderWidth: 1,
    shadow: "none",
    glowOpacity: 0,
    glowColor: GREEN,
    showCornerGlow: true,
    iconOpacity: 0.4,
    iconColor: "rgba(255, 255, 255, 1)",
    iconStrokeWidth: 2,
    textOpacity: 0.7,
    textColor: "rgba(255, 255, 255, 1)",
    dotFill: "transparent",
  },
  Hover: {
    bg: "rgba(17, 21, 57, 1)",
    borderType: "gradient",
    gradientStops: "rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.2) 100%",
    borderWidth: 1,
    shadow: "none",
    glowOpacity: 0,
    glowColor: GREEN,
    showCornerGlow: true,
    iconOpacity: 0.4,
    iconColor: "rgba(255, 255, 255, 1)",
    iconStrokeWidth: 2,
    textOpacity: 0.7,
    textColor: "rgba(255, 255, 255, 1)",
    dotFill: "transparent",
  },
  Active: {
    bg: "rgba(17, 21, 57, 1)",
    borderType: "solid",
    borderColor: "rgba(100, 110, 202, 1)",
    borderWidth: 1,
    shadow: "inset 0 -2px 20px rgba(100, 110, 202, 0.86)",
    glowOpacity: 0,
    glowColor: GREEN,
    showCornerGlow: true,
    iconOpacity: 0.4,
    iconColor: "rgba(255, 255, 255, 1)",
    iconStrokeWidth: 2,
    textOpacity: 0.7,
    textColor: "rgba(255, 255, 255, 1)",
    dotFill: "transparent",
  },
  "Active Hover": {
    bg: "rgba(17, 21, 57, 1)",
    borderType: "solid",
    borderColor: "rgba(159, 169, 255, 1)",
    borderWidth: 1,
    shadow: "inset 0 -2px 20px rgba(100, 110, 202, 0.86)",
    glowOpacity: 0,
    glowColor: GREEN,
    showCornerGlow: true,
    iconOpacity: 0.4,
    iconColor: "rgba(255, 255, 255, 1)",
    iconStrokeWidth: 2,
    textOpacity: 0.7,
    textColor: "rgba(255, 255, 255, 1)",
    dotFill: "transparent",
  },
  Selected: {
    bg: "rgba(17, 21, 57, 1)",
    borderType: "solid",
    borderColor: "rgba(100, 110, 202, 1)",
    borderWidth: 1,
    shadow: "inset 0 -2px 20px rgba(100, 110, 202, 0.86)",
    glowOpacity: 0.8,
    glowColor: GREEN,
    showCornerGlow: true,
    iconOpacity: 1,
    iconColor: GREEN,
    iconStrokeWidth: 2,
    textOpacity: 1,
    textColor: GREEN,
    dotFill: GREEN,
  },
  "Selected Hover": {
    bg: "rgba(17, 21, 57, 1)",
    borderType: "solid",
    borderColor: "rgba(159, 169, 255, 1)",
    borderWidth: 1,
    shadow: "inset 0 -2px 20px rgba(100, 110, 202, 0.86)",
    glowOpacity: 0.8,
    glowColor: GREEN,
    showCornerGlow: true,
    iconOpacity: 1,
    iconColor: GREEN,
    iconStrokeWidth: 2,
    textOpacity: 1,
    textColor: GREEN,
    dotFill: GREEN,
  },
  Disable: {
    bg: "transparent",
    borderType: "solid",
    borderStyle: "dotted",
    borderColor: "rgba(58, 64, 120, 1)",
    borderWidth: 2,
    shadow: "none",
    glowOpacity: 0,
    glowColor: GREEN,
    showCornerGlow: false,
    iconOpacity: 0.2,
    iconColor: "rgba(255, 255, 255, 1)",
    iconStrokeWidth: 1,
    textOpacity: 0.2,
    textColor: "rgba(255, 255, 255, 1)",
    dotFill: "transparent",
  },
};

export default function CardDemoPage() {
  const [iconSvg, setIconSvg] = useState("");
  const [activeState, setActiveState] = useState<CardState>("Default");
  const [showRef, setShowRef] = useState(true);

  useEffect(() => {
    fetch("/assets/icons/brands.svg")
      .then((r) => r.text())
      .then(setIconSvg);
  }, []);

  const s = cardStyles[activeState];

  const processedIcon = iconSvg
    ? iconSvg.replace(/stroke-width="[^"]+"/g, `stroke-width="${s.iconStrokeWidth ?? 2}"`)
    : "";

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#111539",
        display: "flex",
        fontFamily: "var(--font-inter), Inter, system-ui, sans-serif",
      }}
    >
      {/* Switcher */}
      <div
        style={{
          position: "fixed",
          top: "24px",
          left: "24px",
          display: "flex",
          flexDirection: "column",
          gap: "6px",
          zIndex: 100,
        }}
      >
        <span
          style={{
            color: "rgba(255,255,255,0.4)",
            fontSize: "11px",
            textTransform: "uppercase",
            letterSpacing: "1px",
            marginBottom: "4px",
          }}
        >
          Card State
        </span>
        {STATES.map((state) => (
          <button
            key={state}
            onClick={() => setActiveState(state)}
            style={{
              padding: "6px 14px",
              borderRadius: "6px",
              border:
                activeState === state
                  ? "1px solid rgba(100, 110, 202, 1)"
                  : "1px solid rgba(255,255,255,0.08)",
              backgroundColor:
                activeState === state
                  ? "rgba(100, 110, 202, 0.2)"
                  : "rgba(255,255,255,0.03)",
              color:
                activeState === state
                  ? "rgba(159, 169, 255, 1)"
                  : "rgba(255,255,255,0.5)",
              fontSize: "13px",
              fontWeight: activeState === state ? 500 : 400,
              cursor: "pointer",
              textAlign: "left",
              fontFamily: "inherit",
            }}
          >
            {state}
          </button>
        ))}

        <button
          onClick={() => setShowRef(!showRef)}
          style={{
            marginTop: "16px",
            padding: "6px 14px",
            borderRadius: "6px",
            border: "1px solid rgba(255,255,255,0.08)",
            backgroundColor: showRef
              ? "rgba(70, 254, 195, 0.1)"
              : "rgba(255,255,255,0.03)",
            color: showRef ? GREEN : "rgba(255,255,255,0.4)",
            fontSize: "11px",
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          {showRef ? "Hide" : "Show"} Figma ref
        </button>
      </div>

      {/* Cards */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "48px",
        }}
      >
        {/* CSS Card */}
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              position: "relative",
              width: "191px",
              height: "130px",
              backgroundColor: s.bg,
              borderRadius: "12px",
              border:
                s.borderType === "solid"
                  ? `${s.borderWidth}px ${s.borderStyle ?? "solid"} ${s.borderColor}`
                  : "none",
              boxShadow: s.shadow === "none" ? undefined : s.shadow,
              overflow: "hidden",
              transition: "all 0.15s ease",
            }}
          >
            {/* Gradient border */}
            {s.borderType === "gradient" && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "12px",
                  padding: `${s.borderWidth}px`,
                  background: `linear-gradient(180deg, ${s.gradientStops})`,
                  WebkitMask:
                    "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                  WebkitMaskComposite: "xor",
                  maskComposite: "exclude",
                  pointerEvents: "none",
                  zIndex: 20,
                }}
              />
            )}

            {/* Ellipse 850 — top-left */}
            {s.showCornerGlow && (
              <div
                style={{
                  position: "absolute",
                  left: "-46px",
                  top: "-46px",
                  width: "92px",
                  height: "92px",
                  borderRadius: "50%",
                  backgroundColor: "rgba(255, 255, 255, 0.14)",
                  filter: "blur(40px)",
                  pointerEvents: "none",
                  transform: "translate3d(0,0,0)",
                }}
              />
            )}

            {/* Ellipse 851 — bottom-right */}
            {s.showCornerGlow && (
              <div
                style={{
                  position: "absolute",
                  right: "-46px",
                  bottom: "-46px",
                  width: "92px",
                  height: "92px",
                  borderRadius: "50%",
                  backgroundColor: "rgba(255, 255, 255, 0.14)",
                  filter: "blur(40px)",
                  pointerEvents: "none",
                  transform: "translate3d(0,0,0)",
                }}
              />
            )}

            {/* Ellipse 849 — bottom-center green */}
            <div
              style={{
                position: "absolute",
                left: "32px",
                top: "102px",
                width: "128px",
                height: "128px",
                borderRadius: "50%",
                backgroundColor: s.iconColor,
                filter: "blur(40px)",
                opacity: s.glowOpacity,
                pointerEvents: "none",
                transform: "translate3d(0,0,0)",
                transition: "opacity 0.2s ease",
              }}
            />

            {/* Content */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "24px",
                gap: "12px",
                zIndex: 10,
              }}
            >
              {processedIcon && (
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    opacity: s.iconOpacity,
                    color: s.iconColor,
                    flexShrink: 0,
                    transition: "all 0.15s ease",
                  }}
                  dangerouslySetInnerHTML={{ __html: processedIcon }}
                />
              )}

              <span
                style={{
                  fontSize: "14px",
                  fontWeight: 400,
                  lineHeight: "19.6px",
                  letterSpacing: "0px",
                  textAlign: "center",
                  color: s.textColor,
                  opacity: s.textOpacity,
                  whiteSpace: "nowrap",
                  transition: "all 0.15s ease",
                }}
              >
                Brands
              </span>
            </div>

            {/* Dot */}
            <div
              style={{
                position: "absolute",
                right: "8px",
                top: "8px",
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                backgroundColor: s.dotFill,
                border: "1px solid rgba(255, 255, 255, 0.2)",
                zIndex: 10,
                pointerEvents: "none",
                transition: "all 0.15s ease",
              }}
            />
          </div>
          <span
            style={{
              display: "block",
              marginTop: "12px",
              fontSize: "11px",
              color: "rgba(255,255,255,0.3)",
            }}
          >
            CSS
          </span>
        </div>

        {/* Figma reference */}
        {showRef && (
          <div style={{ textAlign: "center" }}>
            <Image
              src={`/assets/card-states/${stateFileMap[activeState]}.png`}
              alt={activeState}
              width={191}
              height={130}
              style={{ borderRadius: "12px" }}
              unoptimized
            />
            <span
              style={{
                display: "block",
                marginTop: "12px",
                fontSize: "11px",
                color: "rgba(255,255,255,0.3)",
              }}
            >
              Figma
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
