import { useQuery } from '@tanstack/react-query';

export interface Contributor {
  id: number;
  name: string;
  handle: string;
  followers: string;
  tweets: number;
  engagement: string;
  verified: boolean;
}

const sampleContributors: Contributor[] = [
  {
    id: 1,
    name: "Vitalik Buterin",
    handle: "@VitalikButerin",
    followers: "5.2M",
    tweets: 127,
    engagement: "8.5%",
    verified: true
  },
  {
    id: 2,
    name: "Balaji Srinivasan",
    handle: "@balajis",
    followers: "1.8M",
    tweets: 89,
    engagement: "12.3%",
    verified: true
  },
  {
    id: 3,
    name: "Andre Cronje",
    handle: "@AndreCronjeTech",
    followers: "892K",
    tweets: 156,
    engagement: "6.7%",
    verified: true
  },
  {
    id: 4,
    name: "Hayden Adams",
    handle: "@HaydenAdams10",
    followers: "456K",
    tweets: 73,
    engagement: "15.2%",
    verified: true
  },
  {
    id: 5,
    name: "Ryan Sean Adams",
    handle: "@RyanSAdams",
    followers: "321K",
    tweets: 198,
    engagement: "9.8%",
    verified: true
  }
];

async function fetchContributors(): Promise<Contributor[]> {
  // Simulate network delay
  await new Promise(res => setTimeout(res, 400));
  return sampleContributors;
}

export function useContributorsQuery() {
  return useQuery({
    queryKey: ['contributors'],
    queryFn: fetchContributors,
    staleTime: 5 * 60 * 1000,
  });
} 