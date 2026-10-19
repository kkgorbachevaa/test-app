import { useEffect, useState } from "react";
import { StyleSheet, Text } from "react-native";

type Props = {
  // Момент последней успешной загрузки данных.
  since: Date;
};

// Подпись «Обновлено N сек назад».
export function UpdatedAgo({ since }: Props) {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const updateSeconds = () => {
      // Вычисляем, сколько полных секунд прошло после загрузки
      const elapsed = Date.now() - since.getTime();
      setSeconds(Math.floor(elapsed / 1000));
    };

    // Сразу пересчитываем время, в том числе после обновления данных
    updateSeconds();

    const intervalId = setInterval(updateSeconds, 1000);

    // Останавливаем старый таймер при смене since или удалении компонента
    return () => clearInterval(intervalId);
  }, [since]);

  return <Text style={styles.text}>Обновлено {seconds} сек назад</Text>;
}

const styles = StyleSheet.create({
  text: {
    fontSize: 13,
    color: "#6b7280",
  },
});
