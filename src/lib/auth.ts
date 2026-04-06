import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { User, UserPayload, UserRole } from '@/types/user';
import { listRecords } from './airtable';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('Missing JWT_SECRET environment variable');
}

const secret = new TextEncoder().encode(JWT_SECRET);

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Compare a password with a hash
 */
export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Sign a JWT token
 */
export async function signToken(payload: UserPayload): Promise<string> {
  const token = await new SignJWT({
    userId: payload.userId,
    username: payload.username,
    role: payload.role,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d') // 7 days
    .sign(secret);

  return token;
}

/**
 * Verify a JWT token
 */
export async function verifyToken(token: string): Promise<UserPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);

    const userPayload: UserPayload = {
      userId: payload.userId as string,
      username: payload.username as string,
      role: payload.role as UserRole,
    };

    return userPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Get user from Airtable by username
 */
export async function getUserByUsername(username: string): Promise<User | null> {
  try {
    const result = await listRecords<User>('Users', {
      filterByFormula: `{username} = '${username}'`,
      maxRecords: 1,
    });

    if (result.records.length === 0) {
      return null;
    }

    return result.records[0];
  } catch (error) {
    throw new Error(`Failed to get user by username: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
