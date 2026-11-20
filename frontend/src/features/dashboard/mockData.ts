export interface LeaderboardEntry {
  rank: number;
  name: string;
  initials: string;
  points: number;
  tone: "lime" | "blue" | "orange";
}

// Visual-only sample data. This is not fetched from an API.
export const leaderboardPreview: LeaderboardEntry[] = [
  { rank: 1, name: "Maya Chen", initials: "MC", points: 240, tone: "lime" },
  { rank: 2, name: "Sam Okafor", initials: "SO", points: 195, tone: "blue" },
  { rank: 3, name: "Jules Park", initials: "JP", points: 170, tone: "orange" },
];
