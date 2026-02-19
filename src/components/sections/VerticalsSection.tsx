"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { sourcesGrid } from "@/lib/sources-data";
import { getConnectedCards } from "@/lib/card-connections";
import { DataCard, type CardState } from "@/components/ui/DataCard";
import { DetailPanel } from "@/components/ui/DetailPanel";

export function VerticalsSection() {
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [activeCard, setActiveCard] = useState<string | null>(null);

  let cardIndex = 0;

  return (
    <section className="relative w-full py-24 px-6 md:px-12 lg:px-20 overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(0,212,255,0.04)_0%,transparent_70%)]" />
        <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(0,229,155,0.03)_0%,transparent_70%)]" />
      </div>

      <div className="relative max-w-[1280px] mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8 mb-14">
          <div className="flex flex-col gap-5">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="flex items-center gap-2"
            >
              <span className="text-sm font-medium tracking-wide text-[var(--accent-green)]">
                Verticals
              </span>
            </motion.div>

            {/* Heading */}
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-[40px] md:text-[48px] lg:text-[52px] font-semibold leading-[1.1] tracking-tight max-w-xl"
            >
              Where product signals
              <br />
              come from.
            </motion.h2>
          </div>

          {/* Description text */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="text-[15px] md:text-base leading-relaxed text-[var(--text-secondary)] max-w-md lg:pt-10"
          >
            Track how products appear, move, change, and disappear across retailers, media,
            newsletters, fairs, and influencers — all captured continuously and updated in real
            time.
          </motion.p>
        </div>

        {/* Grid + Detail Panel */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Cards Grid */}
          <div className="flex-1">
            <div className="grid grid-cols-4" style={{ gridTemplateColumns: 'repeat(4, 191px)', gap: '4px' }}>
              {sourcesGrid.map((row) =>
                row.map((source) => {
                  const idx = cardIndex++;
                  const isSelected = selectedCard === source.id;
                  const isHovered = hoveredCard === source.id;
                  const isActive = activeCard === source.id || source.active === true;
                  const hasSelectedCard = selectedCard !== null;
                  
                  // Получаем связанные карточки для подсветки (максимум 3)
                  const connectedCards = getConnectedCards(selectedCard);
                  const isConnected = connectedCards.includes(source.id);
                  
                  return (
                    <DataCard
                      key={source.id}
                      source={source}
                      index={idx}
                      isSelected={isSelected}
                      isHovered={isHovered}
                      isActive={isActive}
                      isDisabled={false}
                      hasSelectedCard={hasSelectedCard}
                      isConnected={isConnected}
                      onClick={() => {
                        setSelectedCard(isSelected ? null : source.id);
                        setActiveCard(isSelected ? null : source.id);
                      }}
                      onMouseEnter={() => setHoveredCard(source.id)}
                      onMouseLeave={() => setHoveredCard(null)}
                    />
                  );
                })
              )}
            </div>
          </div>

          {/* Detail Panel */}
          <div className="lg:w-[380px] xl:w-[420px]">
            <DetailPanel />
          </div>
        </div>
      </div>
    </section>
  );
}
