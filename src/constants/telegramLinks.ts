// Telegram newsletter links mapped to client IDs
export interface TelegramLink {
  clientId: number;
  url: string;
  title: string;
}

export const telegramLinks: TelegramLink[] = [
  {
    clientId: 1, // Polygon
    url: "https://t.me/polygonainews",
    title: "Polygon AI News"
  },
  {
    clientId: 2, // Plasma
    url: "https://web.telegram.org/a/#-1002346994912",
    title: "Plasma AI News"
  },
  {
    clientId: 3, // USDT0
    url: "https://t.me/usdt0ainews",
    title: "USDT0 AI News"
  },
  {
    clientId: 4, // Tether
    url: "https://t.me/usdt0ainews",
    title: "Tether AI News"
  },
  {
    clientId: 5, // Arbitrum
    url: "https://t.me/arbitrumainews",
    title: "Arbitrum AI News"
  },
  {
    clientId: 6, // Near
    url: "https://t.me/nearalphahub", 
    title: "Near Alpha Hub"
  }
];

// Helper function to get telegram link by client ID
export const getTelegramLinkByClientId = (clientId: number): TelegramLink | undefined => {
  return telegramLinks.find(link => link.clientId === clientId);
};