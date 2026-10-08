import crypto from "crypto";
import { cookies } from "next/headers";

const SESSION_COOKIE = "aerospace_session";

const SESSION_SECRET =
  process.env.SESSION_SECRET || "CHANGE_THIS_IN_RENDER";

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");

  const hash = crypto
    .scryptSync(password, salt, 64)
    .toString("hex");

  return `${salt}:${hash}`;
}

function verifyPassword(password: string, storedHash: string): boolean {
  const [salt, originalHash] = storedHash.split(":");

  if (!salt || !originalHash) {
    return false;
  }

  const hash = crypto
    .scryptSync(password, salt, 64)
    .toString("hex");

  return crypto.timingSafeEqual(
    Buffer.from(hash, "hex"),
    Buffer.from(originalHash, "hex")
  );
}

function signSession(payload: string): string {
  return crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(payload)
    .digest("hex");
}

export function createPasswordHash(password: string): string {
  return hashPassword(password);
}

export function checkPassword(
  password: string,
  storedHash: string
): boolean {
  return verifyPassword(password, storedHash);
}

export function createSessionToken(userId: string, role: string): string {
  const payload = `${userId}:${role}:${Date.now()}`;
  const signature = signSession(payload);

  return Buffer.from(`${payload}:${signature}`).toString("base64url");
}

export function verifySessionToken(token: string) {
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf8");

    const parts = decoded.split(":");

    if (parts.length !== 4) {
      return null;
    }

    const [userId, role, timestamp, signature] = parts;

    const payload = `${userId}:${role}:${timestamp}`;

    const expectedSignature = signSession(payload);

    if (
      !crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
      )
    ) {
      return null;
    }

    const sessionAge = Date.now() - Number(timestamp);

    // Session expires after 7 days
    if (sessionAge > 7 * 24 * 60 * 60 * 1000) {
      return null;
    }

    return {
      userId,
      role,
    };
  } catch {
    return null;
  }
}

export async function setSessionCookie(
  userId: string,
  role: string
) {
  const token = createSessionToken(userId, role);

  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  });
}

export async function getCurrentSession() {
  const cookieStore = await cookies();

  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  return verifySessionToken(token);
}

export async function clearSession() {
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
