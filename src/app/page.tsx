"use client";

import { useState, useCallback, useMemo } from "react";
import { sourcesGrid } from "@/lib/sources-data";
import {
  ACTIVE_SIGNAL_IDS,
  signalConfigs,
  getCompatibleSignals,
} from "@/lib/signals-data";
import { DataCard } from "@/components/ui/DataCard";
import { InsightPanel } from "@/components/ui/InsightPanel";

export default function Home() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const compatibleIds = useMemo(
    () => getCompatibleSignals(selectedIds),
    [selectedIds]
  );

  const toggleSignal = useCallback((id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 3) return prev;
      if (!ACTIVE_SIGNAL_IDS.includes(id)) return prev;
      const compatible = getCompatibleSignals(prev);
      if (!compatible.includes(id)) return prev;
      return [...prev, id];
    });
  }, []);

  const selectedSignals = useMemo(
    () =>
      selectedIds
        .map((id) => signalConfigs[id])
        .filter((c): c is NonNullable<typeof c> => Boolean(c)),
    [selectedIds]
  );

  let cardIndex = 0;

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#111539",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "stretch",
          gap: 5,
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 191px)",
            gap: "4px",
          }}
        >
          {sourcesGrid.map((row) =>
            row.map((source) => {
              const isSelected = selectedIds.includes(source.id);
              const isHovered = hoveredCard === source.id;
              const isActiveSignal = ACTIVE_SIGNAL_IDS.includes(source.id);

              let isActive = false;
              let isDisabled = false;

              if (!isActiveSignal) {
                isDisabled = true;
              } else if (selectedIds.length === 0) {
                isDisabled = false;
                isActive = false;
              } else if (isSelected) {
                // keep defaults
              } else if (compatibleIds.includes(source.id)) {
                isActive = true;
              } else {
                isDisabled = true;
              }

              return (
                <DataCard
                  key={source.id}
                  source={source}
                  index={cardIndex++}
                  isSelected={isSelected}
                  isHovered={isHovered}
                  isActive={isActive}
                  isDisabled={isDisabled}
                  onClick={() => toggleSignal(source.id)}
                  onMouseEnter={() => setHoveredCard(source.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                />
              );
            })
          )}
        </div>

        <InsightPanel selectedSignals={selectedSignals} />
      </div>
    </main>
  );
}
