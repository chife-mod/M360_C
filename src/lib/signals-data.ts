export type SignalConfig = {
  id: string;
  label: string;
  icon: string;
  color: string;
  compatibleWith: string[];
  descriptionSingle: string;
};

export const ACTIVE_SIGNAL_IDS = [
  "brands",
  "pricing",
  "availability",
  "reviews",
  "media",
];

export const signalConfigs: Record<string, SignalConfig> = {
  brands: {
    id: "brands",
    label: "Brands",
    icon: "brands",
    color: "#46FEC3",
    compatibleWith: ["pricing", "availability", "reviews", "media"],
    descriptionSingle:
      "Analyze brand positioning across channels, visibility, pricing behavior, and consumer perception.",
  },
  pricing: {
    id: "pricing",
    label: "Pricing",
    icon: "pricing",
    color: "#2563EB",
    compatibleWith: ["brands", "availability"],
    descriptionSingle:
      "Monitor price shifts, discount patterns, and competitive pricing dynamics across retailers.",
  },
  availability: {
    id: "availability",
    label: "Availability",
    icon: "availability",
    color: "#FF8000",
    compatibleWith: ["brands", "pricing"],
    descriptionSingle:
      "Track stock levels, product presence, and distribution consistency across markets.",
  },
  reviews: {
    id: "reviews",
    label: "Reviews",
    icon: "reviews",
    color: "#00D4FF",
    compatibleWith: ["brands"],
    descriptionSingle:
      "Measure customer sentiment, rating trends, and review volume to understand perception shifts.",
  },
  media: {
    id: "media",
    label: "Media",
    icon: "media",
    color: "#F43F5E",
    compatibleWith: ["brands"],
    descriptionSingle:
      "Track brand mentions across media, newsletters, and influencer coverage.",
  },
};

function comboKey(ids: string[]): string {
  return [...ids].sort().join("+");
}

const pairDescriptions: Record<string, string> = {
  [comboKey(["brands", "pricing"])]:
    "Understand how pricing strategy impacts brand positioning and competitive standing. Detect discount pressure, premium erosion, and price-led perception shifts.",
  [comboKey(["brands", "availability"])]:
    "Identify how distribution gaps and stockouts influence brand visibility, share of shelf, and market strength.",
  [comboKey(["brands", "reviews"])]:
    "Correlate customer sentiment with brand positioning to uncover reputation drivers and perception risks.",
  [comboKey(["brands", "media"])]:
    "Track how media coverage, influencer mentions, and press exposure shape brand perception, share of voice, and competitive positioning across channels.",
  [comboKey(["pricing", "availability"])]:
    "Detect demand distortion by correlating price changes with stockouts, delayed restocks, and channel withdrawal.",
};

const tripleDescriptions: Record<string, string> = {
  [comboKey(["brands", "pricing", "availability"])]:
    "Reveal how pricing strategy and distribution dynamics together shape brand performance. Detect revenue leakage, demand distortion, competitive pressure, and shelf share erosion in real time.",
};

export function getInsightDescription(selectedIds: string[]): string {
  if (selectedIds.length === 1) {
    return signalConfigs[selectedIds[0]]?.descriptionSingle ?? "";
  }
  if (selectedIds.length === 2) {
    return pairDescriptions[comboKey(selectedIds)] ?? "";
  }
  if (selectedIds.length === 3) {
    return tripleDescriptions[comboKey(selectedIds)] ?? "";
  }
  return "";
}

export function getCompatibleSignals(selectedIds: string[]): string[] {
  if (selectedIds.length === 0) return ACTIVE_SIGNAL_IDS;
  if (selectedIds.length >= 3) return [];

  return ACTIVE_SIGNAL_IDS.filter((id) => {
    if (selectedIds.includes(id)) return false;
    return selectedIds.every((selectedId) => {
      const config = signalConfigs[selectedId];
      return config?.compatibleWith.includes(id) ?? false;
    });
  });
}
