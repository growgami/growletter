// Telegram newsletter links mapped to client IDs
export interface TelegramLink {
  clientId: number;
  url: string;
  title: string;
}

export const telegramLinks: TelegramLink[] = [
  {
    clientId: 1, // Polygon
    url: "https://t.me/polkadotalpha",
    title: "Polkadot Alpha"
  },
  {
    clientId: 6, // Near
    url: "https://t.me/nearalphahub", 
    title: "Near Alpha Hub"
  },
  {
    clientId: 5, // Arbitrum
    url: "https://t.me/arbitrumainews",
    title: "Arbitrum AI News"
  },
  {
    clientId: 2, // Plasma (using growgami as fallback)
    url: "https://t.me/growgamiresearch",
    title: "Growgami Research"
  }
];

// Helper function to get telegram link by client ID
export const getTelegramLinkByClientId = (clientId: number): TelegramLink | undefined => {
  return telegramLinks.find(link => link.clientId === clientId);
};