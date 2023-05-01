import { UserRes } from '@/mappers/users';
import { corsMiddleware } from '@/middlewares/cors.middleware';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import Cors from 'cors';
import jwt from 'jsonwebtoken';
import { NextApiRequest, NextApiResponse } from 'next';
import * as yup from 'yup';

const cors = corsMiddleware(Cors({ methods: ['POST'] }));

const prisma = new PrismaClient();

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await cors(req, res);

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await yup
      .object()
      .shape({
        email: yup.string().email().required(),
        password: yup.string().required(),
      })
      .validate(req.body);
  } catch ({ message }: any) {
    res.status(400).json({ message });
    return;
  }

  const { email, password } = req.body;

  const userFound = await prisma.user.findFirst({ where: { email } });

  if (!userFound) {
    return res.status(401).json({ message: 'Email ou senha invalida!' });
  }

  const passwordMatch = await bcrypt.compare(password, userFound.password);

  if (!passwordMatch) {
    return res.status(401).json({ message: 'Email ou senha invalida!' });
  }

  const token = jwt.sign({ type: userFound.email }, process.env.SECRET_KEY!, {
    subject: userFound.id.toString(),
    expiresIn: '24h',
  });

  const user = UserRes.handle(userFound);

  res.status(200).json({ token, user });
}
