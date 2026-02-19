"use client";

import { motion } from "framer-motion";
import { sourcesGrid } from "@/lib/sources-data";
import { SourceCard } from "@/components/ui/SourceCard";
import { DetailPanel } from "@/components/ui/DetailPanel";
import { SourcesBadgeIcon } from "@/lib/icons";

export function SourcesSection() {
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
              <div className="flex items-center gap-2 text-[var(--accent-green)]">
                <SourcesBadgeIcon size={18} />
                <span className="text-sm font-medium tracking-wide">Sources</span>
              </div>
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

            {/* Available in AI chats */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.25 }}
              className="flex items-center gap-2.5 mt-2"
            >
              <div className="w-3 h-3 rounded-full bg-[var(--accent-pink)] shadow-[0_0_10px_var(--accent-pink)]" />
              <span className="text-sm text-[var(--text-secondary)]">Available in AI chats</span>
            </motion.div>
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
          {/* Sources Grid */}
          <div className="flex-1">
            <div className="grid grid-cols-4 gap-3">
              {sourcesGrid.map((row, rowIndex) =>
                row.map((source) => {
                  const idx = cardIndex++;
                  return <SourceCard key={source.id} source={source} index={idx} />;
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
