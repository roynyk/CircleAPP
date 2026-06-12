import { Request, Response } from "express";
import prisma from "../libs/prisma";

// 1. Mengambil detail profil user yang sedang login saat ini
export const getUser = async (req: Request, res: Response) => {
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

// 2. Mengupdate profil (fullName, bio, dan unggah photoProfile)
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { fullName, bio } = req.body;
    // Jika ada file gambar yang diunggah, ambil nama filenya
    const photoProfile = req.file ? req.file.filename : undefined;

    // Siapkan data yang akan diperbarui
    const updateData: any = {};
    if (fullName) updateData.fullName = fullName;
    if (bio !== undefined) updateData.bio = bio;
    if (photoProfile) updateData.photoProfile = photoProfile;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        username: true,
        fullName: true,
        email: true,
        photoProfile: true,
        bio: true,
        _count: {
          select: {
            followers: true,
            following: true,
          },
        },
      },
    });

    return res.status(200).json({
      status: "success",
      message: "Profil berhasil diperbarui",
      data: {
        id: updatedUser.id,
        username: updatedUser.username,
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        photoProfile: updatedUser.photoProfile,
        bio: updatedUser.bio,
        followingCount: updatedUser._count.following,
        followersCount: updatedUser._count.followers,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: `Gagal memperbarui profil: ${error}`,
    });
  }
};

export const getSuggestedUsers = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const followedUsers = await prisma.follow.findMany({
      where: {
        followerId: userId,
      },
      select: {
        followingId: true,
      },
    });

    const followedUserIds = followedUsers.map(
      (followedUser) => followedUser.followingId,
    );

    const suggestions = await prisma.user.findMany({
      where: {
        AND: [{ id: { not: userId } }, { id: { notIn: followedUserIds } }],
      },
      select: {
        id: true,
        username: true,
        fullName: true,
        photoProfile: true,
        bio: true,
      },
      take: 5,
    });

    return res.status(200).json({
      status: "success",
      data: suggestions,
    });
  } catch (error) {
    return res.status(404).json({
      message: `Gagal mengambil suggest user ${error}`,
    });
  }
};

// Mengambil daftar followers atau following
export const getFollows = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id; // Mengambil ID dari JWT token login kita
    const { type } = req.query; // Mengambil 'type' dari query parameter (?type=followers atau ?type=following)

    // Validasi parameter
    if (type !== "followers" && type !== "following") {
      return res.status(400).json({
        message: "Parameter 'type' harus 'followers' atau 'following'",
      });
    }

    if (type === "followers") {
      // 1. Ambil data pengikut (followers)
      const followers = await prisma.follow.findMany({
        where: { followingId: userId },
        include: {
          follower: {
            select: {
              id: true,
              username: true,
              fullName: true,
              photoProfile: true,
              bio: true,
            },
          },
        },
      });

      const data = followers.map((f) => f.follower);
      return res.status(200).json({
        status: "success",
        data,
      });
    } else {
      // 2. Ambil data orang yang diikuti (following)
      const following = await prisma.follow.findMany({
        where: { followerId: userId },
        include: {
          following: {
            select: {
              id: true,
              username: true,
              fullName: true,
              photoProfile: true,
              bio: true,
            },
          },
        },
      });

      // Map data agar outputnya rapi berupa array user
      const data = following.map((f) => f.following);
      return res.status(200).json({
        status: "success",
        data,
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: `Gagal mengambil data follow: ${error}`,
    });
  }
};

// 5. Melakukan Follow ke User Lain
export const followUser = async (req: Request, res: Response) => {
  try {
    const followerId = (req as any).user.id; // ID kita sendiri yang sedang login
    const followingId = parseInt(req.params.id as string); // ID user yang mau kita follow

    if (followerId === followingId) {
      return res
        .status(400)
        .json({ message: "Kamu tidak bisa mem-follow diri sendiri" });
    }

    // Simpan relasi follow baru ke database
    await prisma.follow.create({
      data: {
        followerId,
        followingId,
      },
    });

    return res.status(200).json({
      status: "success",
      message: "Berhasil mengikuti pengguna",
    });
  } catch (error: any) {
    return res.status(500).json({
      message: `Gagal mengikuti pengguna: ${error.message}`,
    });
  }
};

// 6. Melakukan Unfollow (Batal Follow)
export const unfollowUser = async (req: Request, res: Response) => {
  try {
    const followerId = (req as any).user.id;
    const followingId = parseInt(req.params.id as string);

    // Hapus relasi follow dari database
    await prisma.follow.delete({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });

    return res.status(200).json({
      status: "success",
      message: "Berhasil batal mengikuti pengguna",
    });
  } catch (error: any) {
    return res.status(500).json({
      message: `Gagal batal mengikuti pengguna: ${error.message}`,
    });
  }
};

export const searchUser = async (req: Request, res: Response) => {
  try {
    const { q } = req.query;
    const userId = (req as any).user.id;
  } catch (error) {
    return res.status(404).json({
      message: `Gagal memuat data Search User ${error}`,
    });
  }
};
