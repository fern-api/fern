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
    } catch {
        // ignore errors (e.g. permissions)
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
    } catch {
        // cache miss or corrupted
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
        fs.writeFileSync(getCachePath(key), JSON.stringify(entry), "utf-8");
    } catch {
        // ignore write errors
    }
}
