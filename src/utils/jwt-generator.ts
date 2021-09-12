import jwt from 'jsonwebtoken';

export default function generateJWT() {
  return jwt.sign({}, process.env.JWT_KEY);
}
