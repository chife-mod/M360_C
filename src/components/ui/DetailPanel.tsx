"use client";

import { motion } from "framer-motion";
import { getAssetPath } from "@/lib/utils";

export function DetailPanel() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.6, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="
        rounded-[18px] border border-[var(--border-subtle)]
        bg-[var(--bg-card)] p-7
        flex flex-col gap-5
      "
    >
      {/* Icons */}
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[rgba(0,212,255,0.15)] to-[rgba(0,212,255,0.03)] border border-[rgba(0,212,255,0.2)] flex items-center justify-center">
          <img src={getAssetPath("/assets/icons/pricing.svg")} alt="Pricing" className="w-5 h-5" style={{ filter: 'brightness(0) saturate(100%) invert(67%) sepia(100%) saturate(7500%) hue-rotate(160deg) brightness(101%) contrast(101%)' }} />
        </div>
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[rgba(0,229,155,0.15)] to-[rgba(0,229,155,0.03)] border border-[rgba(0,229,155,0.2)] flex items-center justify-center">
          <img src={getAssetPath("/assets/icons/availability.svg")} alt="Availability" className="w-5 h-5" style={{ filter: 'brightness(0) saturate(100%) invert(67%) sepia(100%) saturate(7500%) hue-rotate(120deg) brightness(101%) contrast(101%)' }} />
        </div>
      </div>

      {/* Title */}
      <h3 className="text-2xl font-semibold tracking-tight leading-tight">
        <span className="text-[var(--accent-cyan)]">Pricing</span>
        <span className="text-[var(--text-secondary)]"> + </span>
        <span className="text-[var(--accent-green)]">Availability</span>
      </h3>

      {/* Description */}
      <p className="text-[15px] leading-relaxed text-[var(--text-secondary)] max-w-sm">
        Correlate real-time pricing dynamics with product availability across retailers and channels
        to uncover demand distortions, stockout impact, and revenue leakage — and act before market
        shifts turn into lost share.
      </p>

      {/* CTA */}
      <div className="pt-1">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="
            px-6 py-2.5 rounded-lg text-sm font-medium
            border border-[var(--border-medium)] text-[var(--text-primary)]
            bg-transparent hover:bg-[rgba(255,255,255,0.04)]
            transition-colors duration-200 cursor-pointer
          "
        >
          Analyze
        </motion.button>
      </div>

      {/* Bar chart visualization */}
      <div className="mt-3 flex items-end gap-[3px] h-16 opacity-80">
        {[
          { h: 20, color: "from-purple-900 to-purple-700" },
          { h: 30, color: "from-purple-800 to-purple-600" },
          { h: 25, color: "from-purple-700 to-fuchsia-600" },
          { h: 45, color: "from-fuchsia-700 to-fuchsia-500" },
          { h: 35, color: "from-fuchsia-600 to-pink-500" },
          { h: 50, color: "from-pink-600 to-pink-400" },
          { h: 40, color: "from-pink-500 to-rose-400" },
          { h: 55, color: "from-rose-500 to-rose-400" },
          { h: 60, color: "from-rose-500 to-orange-400" },
          { h: 48, color: "from-orange-500 to-amber-400" },
          { h: 64, color: "from-amber-500 to-yellow-400" },
        ].map((bar, i) => (
          <motion.div
            key={i}
            initial={{ height: 0 }}
            whileInView={{ height: bar.h }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.5 + i * 0.05, ease: "easeOut" }}
            className={`w-3 rounded-t-sm bg-gradient-to-t ${bar.color}`}
          />
        ))}
      </div>
    </motion.div>
  );
}
