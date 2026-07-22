// Shard assignment is a stable protocol: changing this hash reshuffles files across generator versions.
function hash(value: string): number {
    let result = 2166136261;
    for (const character of value) {
        result ^= character.charCodeAt(0);
        result = Math.imul(result, 16777619);
    }
    return result >>> 0;
}

export function shardOwnsFile(filepath: string, count: number, index: number): boolean {
    if (count <= 1) {
        return true;
    }
    if (index < 0 || index >= count) {
        return false;
    }
    const sourcePath = filepath.replace(/^\/[^/]+(?=\/api\/|\/serialization\/)/, "/src");
    const isApiLeaf =
        /^\/src\/api\/(?:types|errors)\/[^/]+\.ts$/.test(sourcePath) ||
        /^\/src\/api\/resources\/.+\/(?:types|errors)\/[^/]+\.ts$/.test(sourcePath);
    const isSharedApiLeaf = isApiLeaf && !filepath.endsWith("/index.ts") && !filepath.endsWith("/exports.ts");
    const isSerdeLeaf =
        /^\/src\/serialization\/.+\.ts$/.test(sourcePath) &&
        !filepath.endsWith("/index.ts") &&
        !filepath.endsWith("/exports.ts");
    if (isSharedApiLeaf || isSerdeLeaf) {
        return hash(`leaf:${sourcePath}`) % count === index;
    }
    const resource = sourcePath.match(/^\/src\/api\/resources\/([^/]+)\//)?.[1];
    if (resource != null) {
        return hash(`resource:${resource}`) % count === index;
    }
    return index === 0;
}

export interface GenerationShard {
    count: number;
    index: number;
}

export function validateGenerationShard({ count, index }: GenerationShard): GenerationShard {
    if (!Number.isSafeInteger(count) || count < 1) {
        throw new Error("Shard count must be a positive integer.");
    }
    if (!Number.isSafeInteger(index) || index < 0 || index >= count) {
        throw new Error("Shard index must be in [0, count).");
    }
    return { count, index };
}
