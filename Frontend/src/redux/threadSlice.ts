import { Thread } from "@/types/thread";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ThreadState {
  threads: Thread[];
}

const initialState: ThreadState = {
  threads: [],
};

const threadSlice = createSlice({
  name: "threads",
  initialState,
  reducers: {
    // Menyimpan data thread yang di-load dari API ke Redux
    setThreads: (state, action: PayloadAction<Thread[]>) => {
      state.threads = action.payload;
    },
    // Menambahkan thread baru di Redux saat user memposting
    addThread: (state, action: PayloadAction<Thread>) => {
      const isExist = state.threads.some((t) => t.id === action.payload.id);
      if (!isExist) {
        state.threads = [action.payload, ...state.threads];
      }
    },
    // Mengupdate status like (isLiked & jumlah likes) secara instan di Redux
    toggleLikeRedux: (state, action: PayloadAction<number>) => {
      const threadId = action.payload;
      const thread = state.threads.find((t) => t.id === threadId);
      if (thread) {
        const isCurrentlyLiked = thread.isLiked;
        thread.isLiked = !isCurrentlyLiked;
        thread.likes = isCurrentlyLiked ? thread.likes - 1 : thread.likes + 1;
      }
    },
    incrementReplyCount: (state, action: PayloadAction<number>) => {
      const threadId = action.payload;
      const thread = state.threads.find((t) => t.id === threadId);
      if (thread) {
        thread.reply = (thread.reply || 0) + 1;
      }
    },
    updateThread: (state, action: PayloadAction<Thread>) => {
      const updateThread = action.payload;
      const index = state.threads.findIndex(
        (thread) => thread.id === updateThread.id,
      );
      //#region
      //Di dalam bahasa pemrograman JavaScript/TypeScript, fungsi .findIndex() memiliki aturan baku:
      // Jika data yang dicari ditemukan, ia akan mengembalikan posisi indeksnya (0, 1, 2, dst).
      // Jika data yang dicari TIDAK ditemukan (misal karena ID-nya tidak cocok dengan semua data di array), ia akan mengembalikan angka -1.
      // Timpa data thread lama dengan data baru dari backend
      //#endregion
      if (index !== -1) {
        state.threads[index] = {
          ...state.threads[index],
          ...updateThread,
        };
      }
    },
  },
});
export const {
  setThreads,
  addThread,
  toggleLikeRedux,
  incrementReplyCount,
  updateThread,
} = threadSlice.actions;
export default threadSlice.reducer;
