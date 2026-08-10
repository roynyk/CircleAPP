import { Request, Response } from "express";
import prisma from "../libs/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const register = async (req: Request, res: Response) => {
  try {
    const { username, fullName, email, password } = req.body;

    const salt = await bcrypt.genSalt(12);

    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = await prisma.user.create({
      data: {
        username: username,
        fullName: fullName,
        email: email,
        password: hashedPassword,
      },
    });

    const token = jwt.sign(
      {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
      },
      process.env.JWT_SECRET as string,
      { expiresIn: "1d" },
    );

    return res.status(201).json({
      message: "User Berhasil di buat",
      token: token,
      data: {
        id: newUser.id,
        username: newUser.username,
        fullName: newUser.fullName,
        email: newUser.email,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "gagal membuat user",
      error: error,
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { validation, password } = req.body;
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: validation }, { username: validation }],
      },
    });

    if (!user) {
      return res.status(400).json({
        message: "Email/Username/Password salah",
      });
    }

    const isPasswordValid = user
      ? await bcrypt.compare(password, user.password)
      : false;

    if (!isPasswordValid) {
      return res.status(400).json({
        message: "Email/Username/Password salah",
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
      },
      process.env.JWT_SECRET as string,
      { expiresIn: "1d" },
    );

    return res.status(200).json({
      message: "Login Berhasil",
      token: token,
      data: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        photoProfile: user.photoProfile,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Terjadi kesalahan pada server",
      error: error,
    });
  }
};

// 4. Mengambil detail profil user lain berdasarkan ID (untuk Hover Card / Halaman Profil Orang Lain)
export const getUserById = async (req: Request, res: Response) => {
  try {
    const targetUserId = parseInt(req.params.id as string); // ID user yang di-hover/dilihat
    const currentUserId = (req as any).user.id; // ID kita sendiri yang sedang login

    if (isNaN(targetUserId)) {
      return res.status(400).json({ message: "ID user tidak valid" });
    }

    // Ambil data user target beserta jumlah followers/following
    const user = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: {
        id: true,
        username: true,
        fullName: true,
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

    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    // Cek secara dinamis: Apakah kita sudah mem-follow user target ini?
    const isFollowed = await prisma.follow.findFirst({
      where: {
        followerId: currentUserId,
        followingId: targetUserId,
      },
    });

    return res.status(200).json({
      status: "success",
      data: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        photoProfile: user.photoProfile,
        bio: user.bio,
        followingCount: user._count.following,
        followersCount: user._count.followers,
        isFollowed: !!isFollowed, // Bernilai true jika sudah di-follow, false jika belum
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: `Gagal mengambil profil user: ${error}`,
    });
  }
};
