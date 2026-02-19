"use client";

import { motion } from "framer-motion";
import type { SourceItem } from "@/lib/sources-data";

export type CardState = "default" | "hover" | "active" | "activeHover" | "selected" | "selectedHover" | "disabled";

type Props = {
  source: SourceItem;
  index: number;
  state?: CardState;
  isSelected?: boolean;
  hasSelectedCard?: boolean;
  onClick?: () => void;
};

const stateStyles: Record<CardState, {
  border: string;
  borderWidth: number;
  innerShadow?: string;
  opacity?: number;
  cursor: string;
}> = {
  default: {
    border: "rgba(255, 255, 255, 0.1)",
    borderWidth: 0.5,
    cursor: "pointer",
  },
  hover: {
    border: "rgba(255, 255, 255, 0.1)",
    borderWidth: 0.5,
    cursor: "pointer",
  },
  active: {
    border: "rgba(100, 110, 202, 1)",
    borderWidth: 1,
    innerShadow: "inset 0 -2px 20px rgba(100, 110, 202, 1)",
    cursor: "pointer",
  },
  activeHover: {
    border: "rgba(100, 110, 202, 1)",
    borderWidth: 1,
    innerShadow: "inset 0 -2px 20px rgba(100, 110, 202, 1)",
    cursor: "pointer",
  },
  selected: {
    border: "rgba(100, 110, 202, 1)",
    borderWidth: 1,
    innerShadow: "inset 0 -2px 20px rgba(100, 110, 202, 1)",
    cursor: "pointer",
  },
  selectedHover: {
    border: "rgba(100, 110, 202, 1)",
    borderWidth: 1,
    innerShadow: "inset 0 -2px 20px rgba(100, 110, 202, 1)",
    cursor: "pointer",
  },
  disabled: {
    border: "rgba(58, 64, 120, 1)",
    borderWidth: 2,
    opacity: 0.5,
    cursor: "not-allowed",
  },
};

export function SourceCard({ 
  source, 
  index, 
  state = "default",
  isSelected = false,
  hasSelectedCard = false,
  onClick 
}: Props) {
  const glow = source.glow ? {
    cyan: {
      border: "rgba(0, 212, 255, 0.3)",
      bg: "rgba(0, 212, 255, 0.15)",
      shadow: "0 0 30px rgba(0, 212, 255, 0.12)",
      text: "#00d4ff",
    },
    green: {
      border: "rgba(0, 229, 155, 0.3)",
      bg: "rgba(0, 229, 155, 0.15)",
      shadow: "0 0 30px rgba(0, 229, 155, 0.12)",
      text: "#00e59b",
    },
    purple: {
      border: "rgba(139, 92, 246, 0.3)",
      bg: "rgba(139, 92, 246, 0.15)",
      shadow: "0 0 30px rgba(139, 92, 246, 0.12)",
      text: "#8b5cf6",
    },
  }[source.glow] : null;

  const currentState = state === "disabled" 
    ? "disabled" 
    : isSelected 
      ? state === "hover" || state === "activeHover" 
        ? "selectedHover" 
        : "selected"
      : state === "hover" || state === "activeHover"
        ? "hover"
        : state === "active"
          ? "active"
          : "default";

  const styles = stateStyles[currentState];
  const iconPath = `/assets/icons/${source.icon}.svg`;

  // Если есть выбранная карточка и эта не выбрана, подсвечиваем цветом
  const highlightColor = hasSelectedCard && !isSelected && glow ? glow.border : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{
        duration: 0.4,
        delay: index * 0.04,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      whileHover={state !== "disabled" ? { scale: 1.03, y: -2 } : {}}
      className="relative"
      onClick={state !== "disabled" ? onClick : undefined}
    >
      <div
        className={`
          relative flex flex-col items-center justify-center gap-3
          rounded-[12px] px-6 py-6
          transition-all duration-300
          min-h-[130px]
          ${state === "disabled" ? "opacity-50" : ""}
          ${glow && isSelected ? `${glow.bg} ${glow.shadow}` : "bg-[#111539]"}
        `}
        style={{
          width: '191px',
          height: '130px',
          border: `${styles.borderWidth}px solid ${highlightColor || styles.border}`,
          borderRadius: '12px',
          boxShadow: styles.innerShadow,
          cursor: styles.cursor,
          opacity: styles.opacity,
        }}
      >
        {/* Светящиеся элементы (glow effects) */}
        <div
          className="absolute pointer-events-none"
          style={{
            left: '-30px',
            top: '-30px',
            width: '92px',
            height: '92px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.14)',
            filter: 'blur(100px)',
          }}
        />
        <div
          className="absolute pointer-events-none"
          style={{
            right: '-50px',
            bottom: '-50px',
            width: '128px',
            height: '128px',
            borderRadius: '50%',
            backgroundColor: '#46fec3',
            opacity: 0.14,
            filter: 'blur(100px)',
          }}
        />

        {/* Connection dots */}
        {source.connectionDots?.includes("top") && (
          <div className="absolute -top-[5px] left-1/2 -translate-x-1/2 w-[8px] h-[8px] rounded-full bg-[var(--accent-cyan)] shadow-[0_0_8px_var(--accent-cyan)] z-20" />
        )}
        {source.connectionDots?.includes("right") && (
          <div className="absolute top-1/2 -right-[5px] -translate-y-1/2 w-[8px] h-[8px] rounded-full bg-[var(--accent-cyan)] shadow-[0_0_8px_var(--accent-cyan)] z-20" />
        )}

        {/* Иконка */}
        <div className={`relative flex items-center justify-center z-10 ${glow && isSelected ? "" : "opacity-40"}`}>
          <img
            src={iconPath}
            alt={source.label}
            style={{
              width: '32px',
              height: '32px',
              objectFit: 'contain',
              filter: glow && isSelected 
                ? 'none' 
                : 'brightness(0) saturate(100%) invert(55%) sepia(8%) saturate(1000%) hue-rotate(210deg) brightness(95%) contrast(85%)',
            }}
          />
        </div>

        {/* Текст */}
        <span
          className="text-center font-medium leading-tight z-10"
          style={{
            fontFamily: 'var(--font-inter), Inter, system-ui, sans-serif',
            fontSize: '13px',
            color: glow && isSelected ? '#ffffff' : '#8b8ba7',
            letterSpacing: '0',
            lineHeight: '1.2',
            fontWeight: 500,
          }}
        >
          {source.label}
        </span>

        {/* Маленький круг в правом верхнем углу - 8px от правого края */}
        <div
          className="absolute pointer-events-none z-10"
          style={{
            right: '8px',
            top: '8px',
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          }}
        />
      </div>
    </motion.div>
  );
}
