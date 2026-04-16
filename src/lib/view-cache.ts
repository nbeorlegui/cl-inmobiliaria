"use client";

const CACHE_VERSION = "v1";

function buildKey(key: string) {
  return `cl-cache:${CACHE_VERSION}:${key}`;
}

export function getCachedData<T>(key: string): T | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(buildKey(key));
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function setCachedData<T>(key: string, value: T) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(buildKey(key), JSON.stringify(value));
  } catch {
    // no-op
  }
}

export function removeCachedData(key: string) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.removeItem(buildKey(key));
  } catch {
    // no-op
  }
}