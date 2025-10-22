import { FernWorkspace } from "@fern-api/api-workspace-commons";
import { IntermediateRepresentation } from "@fern-api/ir-sdk";
import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/path-utils";
import { TaskContext } from "@fern-api/task-context";
import * as crypto from "crypto";
import * as fs from "fs";
import * as path from "path";

export interface CacheEntry<T> {
    hash: string;
    timestamp: number;
    value: T;
}

export interface CacheConfig {
    cacheDir?: string;
    enabled?: boolean;
    ttl?: number; // time to live in milliseconds
}

export interface IRCacheKey {
    workspace: FernWorkspace;
    generationLanguage?: string;
    keywords: Set<string> | undefined;
    smartCasing: boolean;
    audiences: Set<string> | undefined;
    disableExamples?: boolean;
}

export interface ApiRegistrationCacheKey {
    orgId: string;
    apiId: string;
    apiDefinitionHash: string;
    sourcesHash?: string;
}

export interface ApiRegistrationCacheValue {
    apiDefinitionId: string;
    sourceUploads?: any; // FDR source upload response
}

export class CacheManager {
    private readonly config: Required<CacheConfig>;
    private readonly cacheDir: AbsoluteFilePath;
    private readonly context: TaskContext;

    constructor(config: CacheConfig = {}, context: TaskContext) {
        this.config = {
            cacheDir: config.cacheDir ?? path.join(process.env.HOME ?? "/tmp", ".fern", "cache"),
            enabled: config.enabled ?? true,
            ttl: config.ttl ?? 24 * 60 * 60 * 1000 // 24 hours default
        };
        this.cacheDir = AbsoluteFilePath.of(this.config.cacheDir);
        this.context = context;
        this.ensureCacheDirectory();
    }

    private ensureCacheDirectory(): void {
        if (!this.config.enabled) return;

        try {
            fs.mkdirSync(this.cacheDir, { recursive: true });
        } catch (error) {
            this.context.logger.debug(`Failed to create cache directory: ${error}`);
            // Disable caching if we can't create the directory
            (this.config as any).enabled = false;
        }
    }

    private getCacheFilePath(namespace: string, hash: string): AbsoluteFilePath {
        return join(this.cacheDir, RelativeFilePath.of(`${namespace}_${hash}.json`));
    }

    private hashInputs(inputs: any): string {
        const hash = crypto.createHash("sha256");
        hash.update(JSON.stringify(inputs, this.jsonReplacer));
        return hash.digest("hex");
    }

    private jsonReplacer(key: string, value: any): any {
        if (value instanceof Set) {
            return Array.from(value).sort();
        }
        if (value instanceof Map) {
            return Object.fromEntries(Array.from(value.entries()).sort());
        }
        return value;
    }

    private isValidCacheEntry<T>(entry: CacheEntry<T>): boolean {
        const now = Date.now();
        return now - entry.timestamp < this.config.ttl;
    }

    /**
     * Generate cache key for IR generation
     */
    public generateIRCacheKey(inputs: IRCacheKey): string {
        // Hash workspace files for change detection
        const workspaceHash = this.hashWorkspaceFiles(inputs.workspace);

        const keyInputs = {
            workspace: workspaceHash,
            generationLanguage: inputs.generationLanguage,
            keywords: inputs.keywords,
            smartCasing: inputs.smartCasing,
            audiences: inputs.audiences,
            disableExamples: inputs.disableExamples
        };

        return this.hashInputs(keyInputs);
    }

    /**
     * Generate cache key for API registration
     */
    public generateApiRegistrationCacheKey(inputs: ApiRegistrationCacheKey): string {
        return this.hashInputs(inputs);
    }

    /**
     * Hash all relevant files in the workspace
     */
    private hashWorkspaceFiles(workspace: FernWorkspace): string {
        const hash = crypto.createHash("sha256");

        // Hash all definition files
        const allFiles = workspace.definition.namedDefinitionFiles.flatMap((file) => [
            { path: file.absoluteFilepath, contents: JSON.stringify(file.contents) }
        ]);

        // Add root API file
        allFiles.push({
            path: workspace.definition.rootApiFile.absoluteFilepath,
            contents: JSON.stringify(workspace.definition.rootApiFile.contents)
        });

        // Add package markers
        workspace.definition.packageMarkers.forEach((marker) => {
            allFiles.push({
                path: marker.absoluteFilepath,
                contents: JSON.stringify(marker.contents)
            });
        });

        // Sort by path for consistent hashing
        allFiles.sort((a, b) => a.path.localeCompare(b.path));

        for (const file of allFiles) {
            hash.update(file.path);
            hash.update(file.contents);
        }

        return hash.digest("hex");
    }

    /**
     * Get cached IR if available
     */
    public getCachedIR(inputs: IRCacheKey): IntermediateRepresentation | undefined {
        if (!this.config.enabled) return undefined;

        try {
            const cacheKey = this.generateIRCacheKey(inputs);
            const cacheFile = this.getCacheFilePath("ir", cacheKey);

            if (!fs.existsSync(cacheFile)) {
                return undefined;
            }

            const cacheContent = fs.readFileSync(cacheFile, "utf8");
            const cacheEntry: CacheEntry<IntermediateRepresentation> = JSON.parse(cacheContent);

            if (!this.isValidCacheEntry(cacheEntry)) {
                // Remove expired entry
                fs.unlinkSync(cacheFile);
                return undefined;
            }

            this.context.logger.debug(`Cache hit for IR generation (${cacheKey.substring(0, 8)}...)`);
            return cacheEntry.value;
        } catch (error) {
            this.context.logger.debug(`Failed to read IR cache: ${error}`);
            return undefined;
        }
    }

    /**
     * Cache generated IR
     */
    public setCachedIR(inputs: IRCacheKey, ir: IntermediateRepresentation): void {
        if (!this.config.enabled) return;

        try {
            const cacheKey = this.generateIRCacheKey(inputs);
            const cacheFile = this.getCacheFilePath("ir", cacheKey);

            const cacheEntry: CacheEntry<IntermediateRepresentation> = {
                hash: cacheKey,
                timestamp: Date.now(),
                value: ir
            };

            fs.writeFileSync(cacheFile, JSON.stringify(cacheEntry, null, 2));
            this.context.logger.debug(`Cached IR generation (${cacheKey.substring(0, 8)}...)`);
        } catch (error) {
            this.context.logger.debug(`Failed to cache IR: ${error}`);
        }
    }

    /**
     * Get cached API registration if available
     */
    public getCachedApiRegistration(inputs: ApiRegistrationCacheKey): ApiRegistrationCacheValue | undefined {
        if (!this.config.enabled) return undefined;

        try {
            const cacheKey = this.generateApiRegistrationCacheKey(inputs);
            const cacheFile = this.getCacheFilePath("api_reg", cacheKey);

            if (!fs.existsSync(cacheFile)) {
                return undefined;
            }

            const cacheContent = fs.readFileSync(cacheFile, "utf8");
            const cacheEntry: CacheEntry<ApiRegistrationCacheValue> = JSON.parse(cacheContent);

            if (!this.isValidCacheEntry(cacheEntry)) {
                // Remove expired entry
                fs.unlinkSync(cacheFile);
                return undefined;
            }

            this.context.logger.debug(`Cache hit for API registration (${cacheKey.substring(0, 8)}...)`);
            return cacheEntry.value;
        } catch (error) {
            this.context.logger.debug(`Failed to read API registration cache: ${error}`);
            return undefined;
        }
    }

    /**
     * Cache API registration result
     */
    public setCachedApiRegistration(inputs: ApiRegistrationCacheKey, result: ApiRegistrationCacheValue): void {
        if (!this.config.enabled) return;

        try {
            const cacheKey = this.generateApiRegistrationCacheKey(inputs);
            const cacheFile = this.getCacheFilePath("api_reg", cacheKey);

            const cacheEntry: CacheEntry<ApiRegistrationCacheValue> = {
                hash: cacheKey,
                timestamp: Date.now(),
                value: result
            };

            fs.writeFileSync(cacheFile, JSON.stringify(cacheEntry, null, 2));
            this.context.logger.debug(`Cached API registration (${cacheKey.substring(0, 8)}...)`);
        } catch (error) {
            this.context.logger.debug(`Failed to cache API registration: ${error}`);
        }
    }

    /**
     * Clear all cached entries
     */
    public async clearCache(): Promise<void> {
        if (!this.config.enabled) return;

        try {
            const files = fs.readdirSync(this.cacheDir);
            for (const file of files) {
                if (file.endsWith(".json")) {
                    fs.unlinkSync(join(this.cacheDir, RelativeFilePath.of(file)));
                }
            }
            this.context.logger.info("Cache cleared successfully");
        } catch (error) {
            this.context.logger.warn(`Failed to clear cache: ${error}`);
        }
    }

    /**
     * Get cache statistics
     */
    public async getCacheStats(): Promise<{ irEntries: number; apiRegEntries: number; totalSize: string }> {
        if (!this.config.enabled) {
            return { irEntries: 0, apiRegEntries: 0, totalSize: "0 B" };
        }

        try {
            const files = fs.readdirSync(this.cacheDir);
            let irEntries = 0;
            let apiRegEntries = 0;
            let totalSize = 0;

            for (const file of files) {
                if (file.startsWith("ir_")) irEntries++;
                if (file.startsWith("api_reg_")) apiRegEntries++;

                const filePath = join(this.cacheDir, RelativeFilePath.of(file));
                const stats = fs.statSync(filePath);
                totalSize += stats.size;
            }

            return {
                irEntries,
                apiRegEntries,
                totalSize: this.formatBytes(totalSize)
            };
        } catch (error) {
            this.context.logger.debug(`Failed to get cache stats: ${error}`);
            return { irEntries: 0, apiRegEntries: 0, totalSize: "0 B" };
        }
    }

    private formatBytes(bytes: number): string {
        if (bytes === 0) return "0 B";
        const k = 1024;
        const sizes = ["B", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    }
}
