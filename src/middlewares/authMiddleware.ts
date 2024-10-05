import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

const secret = process.env.ACCESS_TOKEN_SECRET!;

interface UserPayload extends JwtPayload {
  username: string;
  password: string;
}

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  console.log(req.cookies);
  const token = req.cookies.jwt_token;
  console.log(token);

  if (!token) {
    res
      .status(401)
      .json({ isError: true, message: 'Access denied. No token provided.' });
    return;
  }

  try {
    jwt.verify(token, secret, (err: Error | null, user: any) => {
      console.log(user);
      if (err) {
        return res
          .status(403)
          .json({ isError: true, message: 'Token provided is incorrect.' });
      }
      req.body.user = user;
      next();
    });
  } catch (error) {
    res.status(401).json({ isError: true, message: 'Invalid token.' });
  }
};
