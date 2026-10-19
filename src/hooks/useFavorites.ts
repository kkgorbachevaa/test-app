import { useState } from "react";

// Избранные матчи (по id). Хранятся только в памяти, пока открыто приложение.
export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);

  // Проверяем, есть ли id матча в списке избранного
  const isFavorite = (id: string) => favorites.includes(id);

  const toggle = (id: string) => {
    setFavorites((currentFavorites) => {
      // Если матч уже в избранном, создаем список без него
      if (currentFavorites.includes(id)) {
        return currentFavorites.filter((favoriteId) => favoriteId !== id);
      }

      // Иначе создаем новый список и добавляем id матча
      return [...currentFavorites, id];
    });
  };

  return { favorites, isFavorite, toggle };
}
