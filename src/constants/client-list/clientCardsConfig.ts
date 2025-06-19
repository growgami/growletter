import { Client } from './clients';

export interface ClientCardConfig {
  // Defines the order of clients to display
  displayOrder: string[]; // Array of client titles in desired order
  
  // Defines which clients are disabled (grayed out and non-clickable)
  disabledClients: string[]; // Array of client titles to disable
  
  // Optional: Future configurations can be added here
  // featuredClients?: string[];
  // comingSoonClients?: string[];
}

export const clientCardsConfig: ClientCardConfig = {
  // Display order: First item appears first, second item appears second, etc.
  displayOrder: [
    "Polygon",    // 1st position
    "Near",       // 2nd position  
    "Plasma",     // 3rd position
    "USDT0",      // 4th position
    "Tether",     // 5th position
    "Arbitrum"    // 6th position
  ],
  
  // Disabled clients (grayed out and non-clickable)
  disabledClients: [
    "Plasma",
    "USDT0", 
    "Tether",
    "Arbitrum",
  ]
};

// Helper function to arrange clients based on config
export const arrangeClients = (clients: Client[]): Client[] => {
  const { displayOrder } = clientCardsConfig;
  
  // Create a map for quick lookup
  const clientMap = new Map(clients.map(client => [client.title, client]));
  
  // Arrange clients according to displayOrder
  const arrangedClients: Client[] = [];
  
  // First, add clients in the specified order
  for (const title of displayOrder) {
    const client = clientMap.get(title);
    if (client) {
      arrangedClients.push(client);
      clientMap.delete(title); // Remove from map to avoid duplicates
    }
  }
  
  // Then add any remaining clients that weren't in displayOrder
  const remainingClients = Array.from(clientMap.values());
  arrangedClients.push(...remainingClients);
  
  return arrangedClients;
};

// Helper function to check if a client is disabled
export const isClientDisabled = (clientTitle: string): boolean => {
  return clientCardsConfig.disabledClients.includes(clientTitle);
}; 