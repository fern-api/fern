import { createEmptyFernRcSchema, FernRcSchema } from "@fern-api/config";
import { AbsoluteFilePath, doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";
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
        const yamlContent = yaml.dump(toSerialize, {
            indent: 2,
            lineWidth: 120,
            noRefs: true
        });
        await writeFile(this.absoluteFilePath, yamlContent, "utf-8");
    }
}
