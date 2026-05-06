import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getStringHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

export function getDeterministicNumber(str: string, min: number, max: number, decimals: number = 0): number {
  const hash = getStringHash(str);
  const range = max - min;
  const val = min + (hash % (range * Math.pow(10, decimals) + 1)) / Math.pow(10, decimals);
  return parseFloat(val.toFixed(decimals));
}
