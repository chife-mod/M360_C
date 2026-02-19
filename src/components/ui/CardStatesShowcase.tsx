"use client";

import { DataCard } from "@/components/ui/DataCard";
import type { CardState } from "@/components/ui/DataCard";
import { sourcesGrid } from "@/lib/sources-data";

const LABELS: Record<CardState, string> = {
  disabled: "Disabled",
  default: "Default",
  hover: "Default Hover",
  active: "Active",
  activeHover: "Active Hover",
  selected: "Selected",
  selectedHover: "Selected Hover",
};

const ORDER: CardState[] = [
  "disabled",
  "default",
  "hover",
  "selected",
  "selectedHover",
  "active",
  "activeHover",
];

const source = sourcesGrid[0][0]; // Brands

export function CardStatesShowcase() {
  return (
    <section className="relative w-full py-16 px-6 border-b border-white/10">
      <div className="max-w-[240px] mx-auto">
        <h3 className="text-sm font-medium text-white/60 mb-6 text-center">
          Card states (Figma order)
        </h3>
        <div className="flex flex-col gap-4">
          {ORDER.map((forceState, idx) => (
            <div key={forceState} className="flex flex-col gap-2">
              <span className="text-xs text-white/50">{LABELS[forceState]}</span>
              <DataCard
                source={source}
                index={idx}
                state={forceState}
                isDisabled={forceState === "disabled"}
                isSelected={forceState === "selected" || forceState === "selectedHover"}
                isHovered={forceState === "hover" || forceState === "selectedHover" || forceState === "activeHover"}
                isActive={forceState === "active" || forceState === "activeHover"}
                hasSelectedCard={false}
                onClick={() => {}}
                onMouseEnter={() => {}}
                onMouseLeave={() => {}}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
