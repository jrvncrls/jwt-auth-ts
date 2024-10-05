import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/userModel';

dotenv.config();
const secret = process.env.ACCESS_TOKEN_SECRET!;
const isProduction = process.env.NODE_ENV === 'production';

export const register = async (req: Request, res: Response) => {
  const { username, password } = req.body;
  try {
    // Check if username is already taken
    const existingUser: IUser | null = await User.findOne({ username });
    if (existingUser) {
      res
        .status(400)
        .json({ isError: true, message: 'Username is already taken' });
      return;
    }

    // Create a new user
    const newUser: IUser = new User({
      username,
      password,
    });

    await newUser.save();

    res
      .status(201)
      .json({ isError: false, message: 'User created successfully' });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    const errorStack =
      error instanceof Error && !isProduction ? error.stack : null;

    res.status(500).json({
      message: 'Error creating user',
      error: {
        message: errorMessage,
        ...(errorStack && { stack: errorStack }), // Include stack only in non-production
      },
    });
  }
};

export const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });

    if (!user) {
      res
        .status(401)
        .json({ isError: true, message: 'Invalid username or password' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      res
        .status(401)
        .json({ isError: true, message: 'Invalid username or password' });
      return;
    }

    // Create a session token
    const token = jwt.sign({ userId: user._id }, secret, {
      expiresIn: '1d',
    });

    // Set the token in a cookie
    res.cookie('jwt_token', token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    });

    res.status(200).json({
      isError: false,
      message: 'Login successful',
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    const errorStack =
      error instanceof Error && !isProduction ? error.stack : null;

    res.status(500).json({
      message: 'Error logging in',
      error: {
        message: errorMessage,
        ...(errorStack && { stack: errorStack }), // Include stack only in non-production
      },
    });
  }
};

export const getUserById = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    const userId = req.body.user.userId;

    const user = await User.findOne({ _id: userId });

    return res.status(200).json({
      isError: false,
      data: {
        username: user?.username,
      },
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    const errorStack =
      error instanceof Error && !isProduction ? error.stack : null;

    res.status(500).json({
      message: 'Error getting users',
      error: {
        message: errorMessage,
        ...(errorStack && { stack: errorStack }), // Include stack only in non-production
      },
    });
  }
};
