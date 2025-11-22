import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { getUserByEmail, saveUser, getUserById, getMentor } from './db'
import { User } from './db'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): { userId: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
    return decoded
  } catch {
    return null
  }
}

export async function createUser(email: string, password: string, mentorId?: string): Promise<User> {
  const existingUser = getUserByEmail(email)
  if (existingUser) {
    throw new Error('User already exists')
  }

  const hashedPassword = await hashPassword(password)
  const user: User = {
    id: `user_${Date.now()}`,
    email,
    password: hashedPassword,
    role: 'mentor',
    mentorId,
    createdAt: new Date().toISOString(),
  }

  saveUser(user)
  return user
}

export async function authenticateUser(email: string, password: string): Promise<User | null> {
  const user = getUserByEmail(email)
  if (!user) {
    return null
  }

  const isValid = await verifyPassword(password, user.password)
  if (!isValid) {
    return null
  }

  return user
}

export function getCurrentUser(token: string | null): User | null {
  if (!token) return null
  const decoded = verifyToken(token)
  if (!decoded) return null
  return getUserById(decoded.userId)
}

