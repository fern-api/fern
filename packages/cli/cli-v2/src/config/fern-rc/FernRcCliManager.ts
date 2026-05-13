import type { FernRcCliSchema, FernRcSchema } from "@fern-api/config";
import { FernRcSchemaLoader } from "./FernRcSchemaLoader.js";

/**
 * Manages the CLI version-management settings in ~/.fernrc.
 *
 * Tracks the active CLI version and the set of versions installed locally
 * via `fern update`.
 */
export class FernRcCliManager {
    private readonly loader: FernRcSchemaLoader;

    constructor({ loader }: { loader: FernRcSchemaLoader }) {
        this.loader = loader;
    }

    /**
     * Returns the currently active CLI version, or undefined when no version
     * has been installed via `fern update` (i.e. the bundled binary is used).
     */
    public async getActiveVersion(): Promise<string | undefined> {
        const { data: config } = await this.loader.load();
        return config.cli?.active_version;
    }

    /**
     * Returns all CLI versions installed via `fern update`.
     */
    public async getInstalledVersions(): Promise<string[]> {
        const { data: config } = await this.loader.load();
        return config.cli?.installed_versions ?? [];
    }

    /**
     * Records a version as installed (idempotent).
     */
    public async addInstalledVersion(version: string): Promise<void> {
        const { data: config } = await this.loader.load();
        const cli = this.normalizeCli(config.cli);
        if (!cli.installed_versions.includes(version)) {
            cli.installed_versions = [...cli.installed_versions, version];
        }
        await this.loader.save({ ...config, cli });
    }

    /**
     * Removes a version from the installed set. If it was the active version,
     * clears the active pointer.
     */
    public async removeInstalledVersion(version: string): Promise<void> {
        const { data: config } = await this.loader.load();
        const cli = this.normalizeCli(config.cli);
        cli.installed_versions = cli.installed_versions.filter((v) => v !== version);
        if (cli.active_version === version) {
            cli.active_version = undefined;
        }
        await this.loader.save({ ...config, cli });
    }

    /**
     * Sets the active CLI version. Pass `undefined` to clear it.
     */
    public async setActiveVersion(version: string | undefined): Promise<void> {
        const { data: config } = await this.loader.load();
        const cli = this.normalizeCli(config.cli);
        cli.active_version = version;
        await this.loader.save({ ...config, cli });
    }

    /**
     * Returns the full CLI section, normalized to defaults when absent.
     */
    public async getCliConfig(): Promise<FernRcCliSchema> {
        const { data: config } = await this.loader.load();
        return this.normalizeCli(config.cli);
    }

    private normalizeCli(cli: FernRcSchema["cli"]): FernRcCliSchema {
        return {
            active_version: cli?.active_version,
            installed_versions: cli?.installed_versions ?? []
        };
    }
}
