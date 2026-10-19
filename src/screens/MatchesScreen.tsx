import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useState, useEffect, useCallback } from "react";
import type { Match, MatchesResponse } from "../types";
import { MATCHES_URL } from "../config";

// Доступные варианты фильтра
type MatchFilter = "all" | "scheduled" | "finished";

// Русские названия статусов из ответа сервера
const statusLabels = {
  scheduled: "Предстоящий",
  finished: "Завершен",
  live: "Идет сейчас",
  postponed: "Перенесен",
};

// Цвет подписи для каждого статуса матча
const statusColors = {
  scheduled: "#15803d",
  finished: "#b91c1c",
  live: "#1d4ed8",
  postponed: "#92400e",
};

// Показываем дату и время в часовом поясе устройства
function formatMatchDate(startsAt: string | null): string {
  if (startsAt === null) {
    return "Дата уточняется";
  }

  return new Date(startsAt).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Экран «Матчи тура» — задание в README.md, часть 1.
export function MatchesScreen() {
  // Матчи, полученные с сервера
  const [matches, setMatches] = useState<Match[]>([]);

  // Показываем загрузку до завершения запроса
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Текст ошибки для пользователя, null - ошибки нет
  const [error, setError] = useState<string | null>(null);

  // По умолчанию показываем все матчи
  const [filter, setFilter] = useState<MatchFilter>("all");

  // Загружаем матчи и обновляем состояние экрана
  const loadMatches = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(MATCHES_URL);

      // fetch не выбрасывает ошибку при HTTP-статусах вроде 404
      if (!response.ok) {
        throw new Error("Не удалось загрузить матчи");
      }

      const data: MatchesResponse = await response.json();
      setMatches(data.matches);
    } catch {
      // Показываем сообщение при ошибке запроса или чтения JSON
      setError("Не удалось загрузить матчи. Попробуйте еще раз.");
    } finally {
      // Завершаем загрузку независимо от результата запроса
      setIsLoading(false);
    }
  }, []);

  // Загружаем матчи при открытии экрана
  useEffect(() => {
    loadMatches();
  }, [loadMatches]);

  // Отбираем матчи для выбранного фильтра
  const filteredMatches = matches.filter((match) => {
    if (filter === "all") {
      return true;
    }

    return match.status === filter;
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Матчи тура</Text>

      {/* Переключаем категорию отображаемых матчей. */}
      <View style={styles.filters}>
        <Pressable
          onPress={() => setFilter("all")}
          style={[styles.filterButton, filter === "all" && styles.activeFilter]}
          accessibilityRole="button"
          accessibilityState={{ selected: filter === "all" }}
        >
          <Text>Все</Text>
        </Pressable>

        <Pressable
          onPress={() => setFilter("scheduled")}
          style={[
            styles.filterButton,
            filter === "scheduled" && styles.activeFilter,
          ]}
          accessibilityRole="button"
          accessibilityState={{ selected: filter === "scheduled" }}
        >
          <Text>Предстоящие</Text>
        </Pressable>

        <Pressable
          onPress={() => setFilter("finished")}
          style={[
            styles.filterButton,
            filter === "finished" && styles.activeFilter,
          ]}
          accessibilityRole="button"
          accessibilityState={{ selected: filter === "finished" }}
        >
          <Text>Завершенные</Text>
        </Pressable>
      </View>

      {/* Показываем загрузку, пока выполняется запрос */}
      {isLoading && <Text>Загружаем матчи...</Text>}

      {/* После ошибки даем возможность повторить запрос */}
      {!isLoading && error !== null && (
        <View>
          <Text>{error}</Text>
          <Pressable onPress={loadMatches} accessibilityRole="button">
            <Text>Повторить</Text>
          </Pressable>
        </View>
      )}

      {/* Пустой список показываем только после успешной загрузки */}
      {!isLoading && error === null && filteredMatches.length === 0 && (
        <Text>Нет матчей для выбранного фильтра.</Text>
      )}

      {/* Показываем матчи после успешной загрузки */}
      {!isLoading && error === null && filteredMatches.length > 0 && (
        <FlatList
          data={filteredMatches}
          keyExtractor={(match) => match.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.teams}>
                {item.home.name} — {item.away.name}
              </Text>

              {/* Проверяем наличие объекта счета, чтобы не потерять 0:0 */}
              <Text>
                {item.score !== null
                  ? `${item.score.home}:${item.score.away}`
                  : "Счет пока отсутствует"}
              </Text>
              <Text>{formatMatchDate(item.startsAt)}</Text>
              <Text
                style={[styles.status, { color: statusColors[item.status] }]}
              >
                {statusLabels[item.status]}
              </Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
  },
  card: {
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
  },
  teams: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  status: {
    marginTop: 6,
    fontWeight: "600",
  },
  filters: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginVertical: 16,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#f3f4f6",
  },
  activeFilter: {
    backgroundColor: "#bfdbfe",
  },
});
