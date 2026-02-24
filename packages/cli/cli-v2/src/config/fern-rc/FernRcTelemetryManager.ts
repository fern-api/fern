import type { FernRcSchema } from "@fern-api/config";
import { FernRcSchemaLoader } from "./FernRcSchemaLoader.js";

/**
 * Manages the telemetry settings in the ~/.fernrc configuration file.
 */
export class FernRcTelemetryManager {
    private readonly loader: FernRcSchemaLoader;

    constructor({ loader }: { loader: FernRcSchemaLoader }) {
        this.loader = loader;
    }

    /**
     * Returns whether telemetry is enabled.
     *
     * Defaults to true when not explicitly configured.
     */
    public async isEnabled(): Promise<boolean> {
        const { data: config } = await this.loader.load();
        return config.telemetry?.enabled !== false;
    }

    /**
     * Sets telemetry.enabled in ~/.fernrc.
     */
    public async setEnabled(enabled: boolean): Promise<void> {
        const { data: config } = await this.loader.load();
        const updated: FernRcSchema = {
            ...config,
            telemetry: { ...config.telemetry, enabled }
        };
        await this.loader.save(updated);
    }
}
