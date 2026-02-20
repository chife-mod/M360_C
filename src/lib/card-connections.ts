/**
 * Определяет связи между карточками
 * Когда выбирается карточка, связанные карточки подсвечиваются (максимум 3)
 */

export type CardId = string;

export interface CardConnection {
  from: CardId;
  to: CardId[];
}

/**
 * Маппинг связей между карточками
 * Когда выбирается карточка `from`, карточки `to` подсвечиваются
 */
export const cardConnections: CardConnection[] = [
  // Пример: когда выбирается Pricing, подсвечиваются Availability, Products, Reviews
  { from: "pricing", to: ["availability", "products", "reviews"] },
  { from: "availability", to: ["pricing", "products", "retailers"] },
  { from: "products", to: ["pricing", "availability", "categories"] },
  { from: "brands", to: ["categories", "products", "media"] },
  { from: "categories", to: ["brands", "products", "pricing"] },
  { from: "media", to: ["brands", "social", "newsletters"] },
  { from: "social", to: ["media", "influencers", "ads"] },
  { from: "influencers", to: ["social", "ads", "evisibility"] },
  { from: "ads", to: ["social", "influencers", "evisibility"] },
  { from: "novelties", to: ["products", "support-chats", "categories"] },
  { from: "newsletters", to: ["media", "social", "evisibility"] },
  { from: "evisibility", to: ["social", "influencers", "seo"] },
  { from: "retailers", to: ["availability", "pricing", "products"] },
  { from: "reviews", to: ["products", "retailers", "seo"] },
  { from: "seo", to: ["reviews", "evisibility", "support-chats"] },
  { from: "support-chats", to: ["seo", "novelties", "products"] },
];

/**
 * Получает список связанных карточек для выбранной карточки
 * @param selectedCardId ID выбранной карточки
 * @returns Массив ID связанных карточек (максимум 3)
 */
export function getConnectedCards(selectedCardId: CardId | null): CardId[] {
  if (!selectedCardId) return [];
  
  const connection = cardConnections.find(conn => conn.from === selectedCardId);
  if (!connection) return [];
  
  // Возвращаем максимум 3 связанные карточки
  return connection.to.slice(0, 3);
}
