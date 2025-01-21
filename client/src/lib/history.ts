export interface HistoryItem {
  query: string;
  timestamp: number;
  response?: string;
}

const HISTORY_KEY = 'search_history';
const MAX_HISTORY_ITEMS = 50;

export function saveToHistory(query: string, response?: string) {
  const history = getHistory();
  const newItem: HistoryItem = {
    query,
    timestamp: Date.now(),
    response,
  };

  // Add new item at the beginning
  history.unshift(newItem);

  // Remove duplicates based on query
  const uniqueHistory = history.filter(
    (item, index, self) =>
      index === self.findIndex((t) => t.query === item.query)
  );

  // Limit history size
  const limitedHistory = uniqueHistory.slice(0, MAX_HISTORY_ITEMS);

  localStorage.setItem(HISTORY_KEY, JSON.stringify(limitedHistory));
}

export function getHistory(): HistoryItem[] {
  const savedHistory = localStorage.getItem(HISTORY_KEY);
  return savedHistory ? JSON.parse(savedHistory) : [];
}

export function clearHistory() {
  localStorage.removeItem(HISTORY_KEY);
}
