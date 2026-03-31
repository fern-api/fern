import { createEmptyFernRcSchema, FernRcSchema } from "@fern-api/config";
import { AbsoluteFilePath, doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";
import { existsSync, readFileSync } from "fs";
import { readFile, writeFile } from "fs/promises";
import yaml from "js-yaml";
import { homedir } from "os";

const FILENAME = ".fernrc";

export namespace FernRcSchemaLoader {
    export interface Result {
        /** The validated config data */
        data: FernRcSchema;
        /** The absolute path to the config file */
        absoluteFilePath: AbsoluteFilePath;
    }
}

/**
 * Loads and saves the ~/.fernrc configuration file.
 */
export class FernRcSchemaLoader {
    public readonly absoluteFilePath: AbsoluteFilePath;

    constructor() {
        this.absoluteFilePath = join(AbsoluteFilePath.of(homedir()), RelativeFilePath.of(FILENAME));
    }

    /**
     * Loads the configuration from ~/.fernrc.
     */
    public async load(): Promise<FernRcSchemaLoader.Result> {
        if (!(await doesPathExist(this.absoluteFilePath))) {
            return {
                data: createEmptyFernRcSchema(),
                absoluteFilePath: this.absoluteFilePath
            };
        }

        const contents = await readFile(this.absoluteFilePath, "utf-8");
        if (contents.trim().length === 0) {
            return {
                data: createEmptyFernRcSchema(),
                absoluteFilePath: this.absoluteFilePath
            };
        }

        const result = FernRcSchema.safeParse(yaml.load(contents));
        if (!result.success) {
            // If validation fails, return empty config. The file might
            // be corrupted, but we don't want to fail the CLI if
            // that's the case.
            return {
                data: createEmptyFernRcSchema(),
                absoluteFilePath: this.absoluteFilePath
            };
        }

        return {
            data: result.data,
            absoluteFilePath: this.absoluteFilePath
        };
    }

    /**
     * Synchronously loads only the cache path from ~/.fernrc.
     *
     * @returns The cache path string if configured, or undefined.
     */
    public loadCachePathSync(): string | undefined {
        try {
            if (!existsSync(this.absoluteFilePath)) {
                return undefined;
            }
            const contents = readFileSync(this.absoluteFilePath, "utf-8");
            if (contents.trim().length === 0) {
                return undefined;
            }
            const result = FernRcSchema.safeParse(yaml.load(contents));
            if (!result.success) {
                return undefined;
            }
            return result.data.cache?.path;
        } catch {
            return undefined;
        }
    }

    /**
     * Synchronously loads the telemetry enabled setting from ~/.fernrc.
     *
     * @returns The enabled boolean if explicitly configured, or undefined (meaning enabled).
     */
    public loadTelemetryEnabledSync(): boolean | undefined {
        try {
            if (!existsSync(this.absoluteFilePath)) {
                return undefined;
            }
            const contents = readFileSync(this.absoluteFilePath, "utf-8");
            if (contents.trim().length === 0) {
                return undefined;
            }
            const result = FernRcSchema.safeParse(yaml.load(contents));
            if (!result.success) {
                return undefined;
            }
            return result.data.telemetry?.enabled;
        } catch {
            return undefined;
        }
    }

    /**
     * Saves the configuration to ~/.fernrc.
     */
    public async save(config: FernRcSchema): Promise<void> {
        const toSerialize: Record<string, unknown> = {
            version: config.version,
            auth: {
                active: config.auth.active,
                accounts: config.auth.accounts.map((account) => ({
                    user: account.user
                }))
            }
        };
        if (config.auth.active == null) {
            delete (toSerialize.auth as Record<string, unknown>).active;
        }
        if (config.cache != null) {
            toSerialize.cache = config.cache;
        }
        if (config.telemetry != null) {
            toSerialize.telemetry = config.telemetry;
        }
        const yamlContent = yaml.dump(toSerialize, {
            indent: 2,
            lineWidth: 120,
            noRefs: true
        });
        await writeFile(this.absoluteFilePath, yamlContent, "utf-8");
    }
}
