import crypto from "crypto";
import fs from "fs";
import { homedir } from "os";
import path from "path";

const FERN_CACHE_DIR = path.join(homedir(), ".fern");

interface CacheEntry<T> {
    value: T;
    timestamp: number;
}

function ensureCacheDir(): void {
    try {
        fs.mkdirSync(FERN_CACHE_DIR, { recursive: true });
    } catch (error) {
        // biome-ignore lint/suspicious/noConsole: cache utility has no logger access
        console.debug("Failed to create fern cache directory", error);
    }
}

function getCachePath(key: string): string {
    return path.join(FERN_CACHE_DIR, `${key}.json`);
}

export function readCache<T>(key: string, ttlMs: number): T | undefined {
    try {
        const cachePath = getCachePath(key);
        const raw = fs.readFileSync(cachePath, "utf-8");
        const entry: CacheEntry<T> = JSON.parse(raw);
        if (Date.now() - entry.timestamp < ttlMs) {
            return entry.value;
        }
    } catch (error) {
        // biome-ignore lint/suspicious/noConsole: cache utility has no logger access
        console.debug(`Cache miss or corrupted for key "${key}"`, error);
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
    } catch (error) {
        // biome-ignore lint/suspicious/noConsole: cache utility has no logger access
        console.debug(`Failed to write cache for key "${key}"`, error);
    }
}
