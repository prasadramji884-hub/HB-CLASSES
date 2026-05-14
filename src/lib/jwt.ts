import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'hb-classes-jwt-secret-key-2024!!'
);

export async function createToken(payload: object, expiresIn: string = '1h'): Promise<string> {
  return new SignJWT(payload as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<any> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      clockTolerance: 60,
    });
    return payload;
  } catch (error) {
    return null;
  }
}

export async function createVideoToken(videoId: string, userId: string): Promise<string> {
  return createToken({ videoId, userId, type: 'video_access' }, '2h');
}

export async function verifyVideoToken(token: string): Promise<{ videoId: string; userId: string } | null> {
  const payload = await verifyToken(token);
  if (!payload || payload.type !== 'video_access') return null;
  return { videoId: payload.videoId, userId: payload.userId };
}