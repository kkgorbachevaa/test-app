// Данные команды
export type Team = {
  id: string;
  name: string;
  city: string;
};

// Счет хозяев и гостей
export type Score = {
  home: number;
  away: number;
};

// Данные матча. Дата и счет могут отсутствовать
export type Match = {
  id: string;
  startsAt: string | null;
  status: "scheduled" | "finished" | "live" | "postponed";
  home: Team;
  away: Team;
  score: Score | null;
  minute?: number;
};

// Ответ сервера - номер тура и список матчей
export type MatchesResponse = {
  round: number;
  matches: Match[];
};
