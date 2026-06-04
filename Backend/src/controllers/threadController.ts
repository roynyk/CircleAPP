import { Request, Response } from "express";
import prisma from "../libs/prisma";

export const createThread = async (req: Request, res: Response) => {
  try {
    const { content, image } = req.body;
    const userId = (req as any).user.id;

    if (!content) {
      return res.status(400).json({
        message: "Konten thread tidak boleh kosong",
      });
    }
    const newThread = await prisma.thread.create({
      data: {
        content: content,
        image: image || null,
        createdById: userId,
      },
    });

    return res.status(201).json({
      message: "Thread berhasil di buat",
      data: newThread,
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
