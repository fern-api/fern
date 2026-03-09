import crypto from "crypto";
import fs from "fs";
import { homedir } from "os";
import path from "path";

interface CacheEntry<T> {
    value: T;
    timestamp: number;
}

function getFernCacheDir(): string {
    return path.join(homedir(), ".fern");
}

function ensureCacheDir(): void {
    try {
        fs.mkdirSync(getFernCacheDir(), { recursive: true });
    } catch {
        // Best-effort: silently ignore permission/filesystem errors
    }
}

function getCachePath(key: string): string {
    return path.join(getFernCacheDir(), `${key}.json`);
}

export function readCache<T>(key: string, ttlMs: number): T | undefined {
    try {
        const cachePath = getCachePath(key);
        const raw = fs.readFileSync(cachePath, "utf-8");
        const entry: CacheEntry<T> = JSON.parse(raw);
        if (Date.now() - entry.timestamp < ttlMs) {
            return entry.value;
        }
    } catch {
        // Best-effort: cache miss, corrupted, or missing file
    }
    return undefined;
}

export function writeCache<T>(key: string, value: T): void {
    try {
        ensureCacheDir();
        const entry: CacheEntry<T> = {
            value,
            timestamp: Date.now()
        };
        const cachePath = getCachePath(key);
        const data = JSON.stringify(entry);
        // Atomic write: write to temp file then rename to avoid partial reads
        const tmpPath = `${cachePath}.${crypto.randomBytes(4).toString("hex")}.tmp`;
        fs.writeFileSync(tmpPath, data, "utf-8");
        fs.renameSync(tmpPath, cachePath);
    } catch {
        // Best-effort: silently ignore write errors
    }
}
