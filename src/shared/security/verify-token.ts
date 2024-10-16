 
import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { jwtSecret } from '../../../config/config.json';
import Knex from '../../shared/knex';
import { Tables } from '../knex/knex';
import { ValidationMessages } from '../constant-helper';

const { secretKey } = jwtSecret;
const { users } = Tables;
const { NOT_AUTHORIZED } = ValidationMessages;

type RequestWithUser = {
  user?: User;
} & Request

type User = {
  email: string;
}

const validateToken = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<Response | void> => {
  const token = req.headers.authorization ? req.headers.authorization.split(' ')[1] : '';
  if (!token) {
    return res.status(401).json({ success: false, result: NOT_AUTHORIZED });
  }

  try {
    const decodedToken = jwt.verify(token, secretKey) as JwtPayload;
    const userDetails = await Knex.generateKnexQuery({
      table: users,
      where: { email: decodedToken.email },
    });

    req.user = userDetails[0]; 
    next();
  } catch (err) {
    return res.status(400).json({
      success: false,
      error: err,
    });
  }
};

export default validateToken;
