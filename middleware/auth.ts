import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthenticatedRequest extends Request {
  user? : any;
}

const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if(!token) {
    return res.status(401).json({message: 'No token found'});
  }
  try {
    const secret = process.env.JWT_SECRET as string;
    jwt.verify(token, secret, (err, user) => {
      if (err) {
        return res.sendStatus(401);
      }
      req.user = user;
      next();
    });
  } catch(err) {
    console.log(err);
  }
};

export default authenticateToken;