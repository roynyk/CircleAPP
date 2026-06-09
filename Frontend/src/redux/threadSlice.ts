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
      state.threads = [action.payload, ...state.threads];
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
  },
});
export const { setThreads, addThread, toggleLikeRedux, incrementReplyCount } =
  threadSlice.actions;
export default threadSlice.reducer;
