import prisma from "../libs/prisma";
import { Request, Response } from "express";

function calculateGrowth(current: number, previous: number) {
  if (previous === 0) {
    return current > 0 ? "100.0" : "0.0";
  }
  const growth = ((current - previous) / previous) * 100;
  return growth.toFixed(1);
}

export const getUserMobile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        fullName: true,
        email: true,
        photoProfile: true,
        bio: true,
        _count: {
          select: {
            followers: true, // Menghitung jumlah follower secara dinamis
            following: true, // Menghitung jumlah following secara dinamis
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    return res.status(200).json({
      status: "success",
      data: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        photoProfile: user.photoProfile,
        bio: user.bio,
        followingCount: user._count.following,
        followersCount: user._count.followers,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: `Gagal mengambil profil user: ${error}`,
    });
  }
};

export const getMetriksHome = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const totalThreads = await prisma.thread.count({
      where: { createdById: userId },
    });
    const week1ThreadsCount = await prisma.thread.count({
      where: {
        createdById: userId,
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
    });

    const week2ThreadsCount = await prisma.thread.count({
      where: {
        createdById: userId,
        createdAt: {
          gte: fourteenDaysAgo,
          lt: sevenDaysAgo,
        },
      },
    });
    const threadsGrowth = calculateGrowth(week1ThreadsCount, week2ThreadsCount);

    const totalFollowers = await prisma.follow.count({
      where: { followingId: userId },
    });
    const week1Followers = await prisma.follow.count({
      where: { followingId: userId, createdAt: { gte: sevenDaysAgo } },
    });
    const week2Followers = await prisma.follow.count({
      where: {
        followingId: userId,
        createdAt: {
          gte: fourteenDaysAgo,
          lt: sevenDaysAgo,
        },
      },
    });
    const followersGrowth = calculateGrowth(week1Followers, week2Followers);

    const totalLikes = await prisma.like.count({
      where: {
        thread: { createdById: userId },
      },
    });

    const week1TotalLikes = await prisma.like.count({
      where: {
        thread: { createdById: userId },
        createdAt: { gte: sevenDaysAgo },
      },
    });
    const week2TotalLikes = await prisma.like.count({
      where: {
        thread: {
          createdById: userId,
        },
        createdAt: {
          gte: fourteenDaysAgo,
          lt: sevenDaysAgo,
        },
      },
    });

    const likesGrowth = calculateGrowth(week1TotalLikes, week2TotalLikes);

    const totalReplies = await prisma.reply.count({
      where: { thread: { createdById: userId } },
    });

    const week1TotalReplies = await prisma.reply.count({
      where: {
        thread: { createdById: userId },
        createdAt: { gte: sevenDaysAgo },
      },
    });

    const week2TotalReplies = await prisma.reply.count({
      where: {
        thread: { createdById: userId },
        createdAt: {
          gte: fourteenDaysAgo,
          lt: sevenDaysAgo,
        },
      },
    });

    const repliesGrowth = calculateGrowth(week1TotalReplies, week2TotalReplies);

    return res.status(200).json({
      status: "success",
      data: {
        followers: { total: totalFollowers, growth: followersGrowth },
        threads: { total: totalThreads, growth: threadsGrowth },
        likes: { total: totalLikes, growth: likesGrowth },
        replies: { total: totalReplies, growth: repliesGrowth },
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: `Failed to fetch data Metriks ${error}`,
    });
  }
};

export const getTopThreadsMobile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const range = parseInt(req.query.range as string);
    const queryWhere: any = {
      createdById: userId,
    };

    if (range === 7 || range === 30) {
      const limitDate = new Date(Date.now() - range * 24 * 60 * 60 * 1000);
      queryWhere.createdAt = {
        gte: limitDate,
      };
    }

    // kalau menggunakan findMany itu udh termasuk dengan data yang di dalamnya, dalam kasus di bawah ini kan aku menggunakan threads, brrti data yang ada di dalam threads udh masuk, jadi di bawah ini kita hanya mengambil data yang berelasi dengan threads
    const threads = await prisma.thread.findMany({
      where: queryWhere,
      // include itu untuk menghubungan relasi antar table yang udh kita buat tadi
      include: {
        _count: {
          select: {
            likes: true,
            replies: true,
          },
        },
      },
    });

    const formattedThreads = threads.map((thread) => {
      const likesCount = thread._count.likes;
      const repliesCount = thread._count.replies;

      return {
        id: thread.id,
        content: thread.content,
        image: thread.image,
        created_at: thread.createdAt,
        likes: likesCount,
        replies: repliesCount,
        engagement: likesCount + repliesCount,
      };
    });

    //#region
    //b - a : Mengurutkan Descending (dari Terbesar ke Terkecil). Ini yang kita pakai agar thread terbaik naik ke atas.
    //a - b : Mengurutkan Ascending (dari Terkecil ke Terbesar).
    //#endregion

    const sortedThreads = formattedThreads.sort(
      (a, b) => b.engagement - a.engagement,
    );

    return res.status(200).json({
      status: "success",
      message: "Threads load succesfully",
      // jadi return nya nnti bukan cuman data:{} tapi data:{threads:{}}
      data: {
        threads: sortedThreads,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: `failed to load threads ${error}`,
    });
  }
};

export const getRecentActivityMobile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const myFollowing = await prisma.follow.findMany({
      where: {
        followerId: userId,
      },
      select: {
        followingId: true,
      },
    });

    //#region
    // Apa itu new Set?
    // Di JavaScript/TypeScript, Set adalah struktur data bawaan yang digunakan untuk menyimpan kumpulan nilai-nilai unik (tidak boleh ada duplikasi).

    // Di kasus ini, kita mengubah array [12, 45, 99] menjadi objek Set:

    // typescript

    // const myFollowingIds = new Set([12, 45, 99]);
    // Kenapa kita memakai Set daripada Array biasa?
    // Alasannya adalah Kecepatan Performa (Pencarian Instan / O(1)):

    // Jika menggunakan Array biasa: Untuk mengecek apakah ID 45 ada di dalam array, JavaScript harus mengecek satu per satu indeks array dari depan ke belakang (array.includes(45)). Jika data followings kamu ada 1000 orang, proses ini bisa lambat.
    // Jika menggunakan Set: Kita bisa menggunakan fungsi bawaan myFollowingIds.has(45). Proses pencariannya bersifat instant (O(1)) karena Set bekerja menggunakan sistem tabel hash di memori. JavaScript langsung tahu dalam sekejap tanpa perlu menelusuri data satu per satu.
    // Sehingga, ketika kita memformat data aktivitas follows di bawahnya:

    // typescript

    // isFollowingBack: myFollowingIds.has(follow.follower.id)
    // Proses pengecekan apakah kita sudah mem-follow back dia berjalan dengan sangat cepat dan efisien.
    //#endregion
    //#region
    // Kenapa harus di-mapping lagi (.map)?
    // Meskipun query myFollowing mencari ID user yang kita ikuti, Prisma selalu mengembalikan data dalam bentuk array of objects (kumpulan objek), bukan array angka biasa.

    // Hasil dari query Prisma ini:

    // typescript

    // const myFollowing = await prisma.follow.findMany({
    //   where: { followerId: loggedInUserId },
    //   select: { followingId: true }
    // });
    // Bentuk datanya di memori adalah seperti ini:

    // json

    // [
    //   { "followingId": 12 },
    //   { "followingId": 45 },
    //   { "followingId": 99 }
    // ]
    // Datanya dibungkus objek { followingId: ... }.

    // Agar kita bisa menggunakannya dengan mudah untuk mencocokkan ID, kita lakukan .map((f) => f.followingId) untuk mengekstrak angkanya saja. Hasil setelah di-mapping berubah menjadi array angka datar:

    // javascript

    // [12, 45, 99]
    //#endregion
    const myFollowingIds = new Set(myFollowing.map((f) => f.followingId));

    // Query Join Likes: Ambil riwayat likes pada thread milik userId
    const likes = await prisma.like.findMany({
      where: {
        thread: {
          createdById: userId,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            fullName: true,
            photoProfile: true,
          },
        },
        thread: {
          select: {
            id: true,
            content: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Query Join Replies: Ambil riwayat komentar pada thread milik userId
    const replies = await prisma.reply.findMany({
      where: {
        thread: {
          createdById: userId,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            fullName: true,
            photoProfile: true,
          },
        },
        thread: {
          select: {
            id: true,
            content: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Query Join Follows: Ambil daftar orang yang mem-follow userId
    const follows = await prisma.follow.findMany({
      where: {
        followingId: userId,
      },
      include: {
        follower: {
          select: {
            id: true,
            username: true,
            fullName: true,
            photoProfile: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Format ulang ketiga jenis data agar memiliki struktur objek yang seragam (Activity Feed Format)
    const formattedLikes = likes.map((like) => ({
      id: `like-${like.id}`,
      type: "like",
      createdAt: like.createdAt,
      user: {
        id: like.user.id,
        username: like.user.username,
        fullName: like.user.fullName,
        photoProfile: like.user.photoProfile,
      },
      thread: {
        id: like.thread.id,
        content: like.thread.content,
      },
    }));

    const formattedReplies = replies.map((reply) => ({
      id: `reply-${reply.id}`,
      type: "reply",
      createdAt: reply.createdAt,
      content: reply.content,
      user: {
        id: reply.user.id,
        username: reply.user.username,
        fullName: reply.user.fullName,
        photoProfile: reply.user.photoProfile,
      },
      thread: {
        id: reply.thread.id,
        content: reply.thread.content,
      },
    }));

    const formattedFollows = follows.map((follow) => ({
      id: `follow-${follow.id}`,
      type: "follow",
      createdAt: follow.createdAt,
      user: {
        id: follow.follower.id,
        username: follow.follower.username,
        fullName: follow.follower.fullName,
        photoProfile: follow.follower.photoProfile,
        isFollowingBack: myFollowingIds.has(follow.follower.id),
      },
    }));

    // Gabungkan semua tipe aktivitas, lalu sort berdasarkan tanggal terbaru
    const allActivities = [
      ...formattedLikes,
      ...formattedReplies,
      ...formattedFollows,
    ].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    return res.status(200).json({
      status: "success",
      message: "Activities loaded successfully",
      data: allActivities,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Failed to load activity feed: ${error}`,
    });
  }
};
