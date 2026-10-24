import { Request, Response } from "express";
import prisma from "../lib/prisma";
import bcrypt from "bcrypt";
import { signupSchema, loginSchema } from "../validators/authValidators";
import { Prisma } from "@prisma/client";
import jwt from "jsonwebtoken";

//signup controller
export const signup = async (req: Request, res: Response) => {
  try {
    const result = signupSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        message: "Invalid signup data",
      });
    }
    const { username, email, password } = result.data;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
      },
    });
    await prisma.creditLedger.create({
      data: {
        userId: user.id,
        amount: 10,
        type: "free_signup",
      },
    });
    return res.status(201).json({
      message: "User signed up successfully",
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return res.status(409).json({
          message: "Email already exists",
        });
      }
    }
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

//login controller
export const login = async (req: Request, res: Response) => {
  const result = loginSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      message: "Invalid login data",
    });
  }
  const { email, password } = result.data;
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });
  if (!user) {
    return res.status(401).json({
      message: "Invalid email or password",
    });
  }
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({
      message: "Invalid email or password",
    });
  }
  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
    expiresIn: "7d",
  });
  return res.status(200).json({
    message: "Login successful",
    token,
  });
};
