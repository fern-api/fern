import crypto from "crypto";

/**
 * Fields to exclude from IR hashing for deterministic results.
 * These fields contain metadata that doesn't affect the semantic content.
 */
const EXCLUDED_FIELDS = new Set(["fdrApiDefinitionId"]);

/**
 * Computes deterministic SHA-256 hashes of IR content.
 *
 * The hasher excludes certain metadata fields to ensure that
 * semantically identical IRs produce the same hash, even if
 * they have different generation timestamps or other metadata.
 */
export class IrHasher {
    /**
     * Compute a SHA-256 hash of IR content.
     */
    public hash(content: unknown): string {
        const normalized = this.normalize(content);
        const json = JSON.stringify(normalized);
        return crypto.createHash("sha256").update(json, "utf8").digest("hex");
    }

    /**
     * Compute a SHA-256 hash from a JSON string.
     * Parses the JSON, normalizes it, and returns the hash.
     */
    public hashFromJSON(json: string): string {
        const content = JSON.parse(json) as unknown;
        return this.hash(content);
    }

    /**
     * Normalize content for deterministic hashing.
     *  - Sorts object keys alphabetically
     *  - Removes excluded metadata fields
     *  - Recursively processes nested objects and arrays
     */
    private normalize(value: unknown): unknown {
        if (value == null) {
            return value;
        }

        if (Array.isArray(value)) {
            return value.map((item) => this.normalize(item));
        }

        if (typeof value === "object") {
            const normalized: Record<string, unknown> = {};

            const obj = value as Record<string, unknown>;
            for (const key of Object.keys(obj).sort()) {
                // Skip excluded metadata fields.
                if (EXCLUDED_FIELDS.has(key)) {
                    continue;
                }
                normalized[key] = this.normalize(obj[key]);
            }

            return normalized;
        }

        // All other values (i.e. string, number, boolean) pass through unchanged.
        return value;
    }
}
