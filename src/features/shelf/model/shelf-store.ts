import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Book } from '@entities/book/model/types';
import type { ShelfBook, ShelfStatus } from '@entities/shelf/model/types';

interface ShelfState {
  items: ShelfBook[];
  addBook: (book: Book) => void;
  removeBook: (id: string) => void;
  updateStatus: (id: string, status: ShelfStatus) => void;
  isInShelf: (id: string) => boolean;
}

export const useShelfStore = create<ShelfState>()(
  persist(
    (set, get) => ({
      items: [],
      addBook: (book) => {
        if (get().items.some((item) => item.id === book.id)) return;
        set({
          items: [...get().items, { ...book, status: 'want-to-read', addedAt: new Date().toISOString() }],
        });
      },
      removeBook: (id) => set({ items: get().items.filter((item) => item.id !== id) }),
      updateStatus: (id, status) =>
        set({ items: get().items.map((item) => (item.id === id ? { ...item, status } : item)) }),
      isInShelf: (id) => get().items.some((item) => item.id === id),
    }),
    { name: 'libris-shelf' }
  )
);
