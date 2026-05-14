import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'hb-classes-encryption-key-2024!!';

export function encrypt(text: string): string {
  return CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString();
}

export function decrypt(encryptedText: string): string {
  const bytes = CryptoJS.AES.decrypt(encryptedText, ENCRYPTION_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
}

export function hashFingerprint(fingerprint: string): string {
  return CryptoJS.SHA256(fingerprint + ENCRYPTION_KEY).toString();
}

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function generateToken(): string {
  return CryptoJS.lib.WordArray.random(32).toString();
}