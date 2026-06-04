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
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Terjadi kesalahan pada server",
      error: error,
    });
  }
};
