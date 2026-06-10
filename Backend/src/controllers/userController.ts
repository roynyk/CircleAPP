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
