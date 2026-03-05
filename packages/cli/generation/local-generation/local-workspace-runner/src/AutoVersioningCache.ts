import crypto from "crypto";
import type { AutoVersionResult } from "./AutoVersioningService.js";

export class AutoVersioningCache {
    private readonly cache = new Map<string, AutoVersionResult | null>();

    public key(cleanedDiff: string): string {
        return crypto.createHash("sha256").update(cleanedDiff).digest("hex");
    }

    public get(key: string): AutoVersionResult | null | undefined {
        return this.cache.get(key);
    }

    public set(key: string, result: AutoVersionResult | null): void {
        this.cache.set(key, result);
    }
}
