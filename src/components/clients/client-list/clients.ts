export interface Client {
  id: number;
  title: string;
  category: string;
  icon: string;
}

export const clients: Client[] = [
  {
    id: 1,
    title: "Arb",
    category: "Polygon",
    icon: "/assets/logos/arb.svg"
  },
  {
    id: 2,
    title: "Plasma",
    category: "plasma",
    icon: "/assets/logos/Plasma.jpg"
  },
  {
    id: 3,
    title: "USDT0",
    category: "usdt",
    icon: "/assets/logos/usdt0.jpg"
  },
  {
    id: 4,
    title: "Tether",
    category: "tether",
    icon: "/assets/logos/Tether.png"
  }
];

// Helper function to get client by ID
export const getClientById = (id: number): Client | undefined => {
  return clients.find(client => client.id === id);
};

// Helper function to get category by client ID
export const getCategoryByClientId = (id: number): string | undefined => {
  const client = getClientById(id);
  return client?.category;
};
