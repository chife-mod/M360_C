"use client";

import { useState } from "react";
import { Toggle } from "@/components/ui/Toggle";

const DEMO_STATES = [
  { key: "on", label: "On", demoState: "on" as const },
  { key: "onHover", label: "On Hover", demoState: "onHover" as const },
  { key: "off", label: "Off", demoState: "off" as const },
  { key: "offHover", label: "Off Hover", demoState: "offHover" as const },
];

export default function ToggleDemoPage() {
  const [checked, setChecked] = useState(false);

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#111539",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 80,
        padding: 40,
      }}
    >
      {/* Left: interactive toggle */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 24,
        }}
      >
        <span
          style={{
            fontSize: 14,
            color: "rgba(255,255,255,0.6)",
            fontFamily: "var(--font-inter), Inter, system-ui, sans-serif",
          }}
        >
          Interactive
        </span>
        <Toggle
          checked={checked}
          onChange={setChecked}
          label={checked ? "On" : "Off"}
        />
        <span
          style={{
            fontSize: 12,
            color: "rgba(255,255,255,0.4)",
            fontFamily: "var(--font-inter), Inter, system-ui, sans-serif",
          }}
        >
          Click to toggle
        </span>
      </div>

      {/* Right: all states */}
      <div
        style={{
          display: "flex",
          gap: 48,
          alignItems: "flex-start",
          flexWrap: "wrap",
        }}
      >
        {DEMO_STATES.map(({ key, label, demoState }) => (
          <div
            key={key}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 12,
            }}
          >
            <span
              style={{
                fontSize: 12,
                color: "rgba(255,255,255,0.5)",
                fontFamily: "var(--font-inter), Inter, system-ui, sans-serif",
              }}
            >
              {label}
            </span>
            <Toggle checked={true} demoState={demoState} />
          </div>
        ))}
      </div>
    </div>
  );
}
