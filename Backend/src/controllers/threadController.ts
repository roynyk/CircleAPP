import { Request, Response } from "express";
import prisma from "../libs/prisma";
import { broadcast } from "../libs/socket";

export const createThread = async (req: Request, res: Response) => {
  try {
    const { content } = req.body;
    const userId = (req as any).user.id;
    const image = req.file ? req.file.filename : null;
    if (!content) {
      return res.status(400).json({
        message: "Konten thread tidak boleh kosong",
      });
    }
    // 2. Simpan thread baru lengkap dengan merelasikan creator-nya
    const newThread = await prisma.thread.create({
      data: {
        content: content,
        image: image,
        createdById: userId,
      },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            fullName: true,
            photoProfile: true,
          },
        },
      },
    });
    // 3. Format data thread baru agar sesuai spesifikasi Frontend
    const formattedThread = {
      id: newThread.id,
      content: newThread.content,
      image: newThread.image,
      user: {
        id: newThread.creator.id,
        username: newThread.creator.username,
        name: newThread.creator.fullName,
        profile_picture: newThread.creator.photoProfile,
      },
      created_at: newThread.createdAt,
      likes: 0,
      reply: 0,
      isLiked: false,
    };
    // 4. Siarkan (broadcast) thread baru ke seluruh client aktif
    broadcast("NEW_THREAD", formattedThread);
    return res.status(201).json({
      message: "Thread berhasil di buat",
      data: formattedThread,
    });
  } catch (error) {
    return res.status(500).json({
      message: `failed to create a thread ${error}`,
    });
  }
};

export const getThreads = async (req: Request, res: Response) => {
  try {
    const loggedInUserId = (req as any).user?.id;
    const limit = req.query.limit
      ? parseInt(req.query.limit as string, 10)
      : 25;
    // kalau menggunakan findMany itu udh termasuk dengan data yang di dalamnya, dalam kasus di bawah ini kan aku menggunakan threads, brrti data yang ada di dalam threads udh masuk, jadi di bawah ini kita hanya mengambil data yang berelasi dengan threads
    const threads = await prisma.thread.findMany({
      // include itu untuk menghubungan relasi antar table yang udh kita buat tadi
      take: limit,
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            fullName: true,
            photoProfile: true,
          },
        },
        likes: {
          select: {
            userId: true,
          },
        },
        replies: {
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const formattedThreads = threads.map((thread) => {
      // Fungsi .some() adalah metode bawaan JavaScript yang digunakan untuk memeriksa apakah minimal ada satu data di dalam Array yang memenuhi kriteria tertentu. Hasil dari .some() akan selalu berupa nilai boolean: true (jika ada yang cocok) atau false (jika tidak ada satu pun yang cocok).
      const isLiked = loggedInUserId
        ? thread.likes.some((like) => like.userId === loggedInUserId)
        : false;

      return {
        id: thread.id,
        content: thread.content,
        image: thread.image,
        user: {
          id: thread.creator.id,
          username: thread.creator.username,
          name: thread.creator.fullName,
          profile_picture: thread.creator.photoProfile,
        },
        created_at: thread.createdAt,
        likes: thread.likes.length,
        reply: thread.replies.length,
        isLiked: isLiked,
      };
    });

    return res.status(200).json({
      message: "Threads load succesfully",
      // jadi return nya nnti bukan cuman data:{} tapi data:{threads:{}}
      data: {
        threads: formattedThreads,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: `failed to load threads ${error}`,
    });
  }
};

export const toggleLike = async (req: Request, res: Response) => {
  try {
    const threadId = parseInt(req.params.threadId, 10);
    const userId = (req as any).user.id;
    if (isNaN(threadId)) {
      return res.status(400).json({ message: "ID Thread tidak valid" });
    }

    // 1. Periksa apakah thread yang ingin di-like memang ada
    const thread = await prisma.thread.findUnique({
      where: { id: threadId },
    });
    if (!thread) {
      return res.status(404).json({ message: "Thread tidak ditemukan" });
    }
    // 2. Periksa apakah user sudah memberikan Like pada thread ini sebelumnya
    const existingLike = await prisma.like.findUnique({
      where: {
        // userId_threadId adalah nama index unik gabungan (Compound Unique Constraint) yang dibuat secara otomatis oleh Prisma Client.
        userId_threadId: {
          userId: userId,
          threadId: threadId,
        },
      },
    });
    if (existingLike) {
      // JIKA SUDAH DI-LIKE: Hapus data Like (Dislike)
      await prisma.like.delete({
        where: {
          userId_threadId: {
            userId: userId,
            threadId: threadId,
          },
        },
      });
      return res.status(200).json({
        message: "Thread berhasil tidak disukai (disliked)",
        isLiked: false,
      });
    } else {
      // JIKA BELUM DI-LIKE: Tambahkan data Like ke database
      await prisma.like.create({
        data: {
          userId: userId,
          threadId: threadId,
        },
      });
      return res.status(200).json({
        message: "Thread berhasil disukai (liked)",
        isLiked: true,
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: `Gagal memperbarui status like: ${error}`,
    });
  }
};
