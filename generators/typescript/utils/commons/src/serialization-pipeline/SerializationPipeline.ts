import { PassthroughFormat } from "./formats/PassthroughFormat";
import { ZodFormat } from "./formats/ZodFormat";
import { ZurgFormat } from "./formats/ZurgFormat";
import { SerializationFormat } from "./SerializationFormat";

/**
 * Supported serialization format types
 */
export type SerializationFormatType = "zurg" | "zod" | "none";

/**
 * Configuration for creating a SerializationPipeline
 */
export interface SerializationPipelineConfig extends SerializationFormat.Config {
    /**
     * The serialization format to use.
     * - "zurg": Use Zurg (bundled runtime)
     * - "zod": Use Zod (npm dependency)
     * - "none": No serialization, data passes through unchanged
     */
    format: SerializationFormatType;
}

/**
 * SerializationPipeline is an abstraction around various serialization formats. It provides a unified interface
 * for generating serialization schema AST code regardless of the underlying format being used.
 */
export class SerializationPipeline {
    /**
     * The concrete format implementation.
     */
    private readonly format: SerializationFormat;

    /**
     * The type of the selected serialization format.
     */
    private readonly formatType: SerializationFormatType;

    /**
     * Create a new SerializationPipeline instance.
     * @param config - The configuration for the pipeline.
     */
    constructor(config: SerializationPipelineConfig) {
        this.formatType = config.format;
        this.format = this.createFormat(config);
    }

    /**
     * Given a pipeline configuration, generate the appropriate serialization format.
     */
    private createFormat(config: SerializationPipelineConfig): SerializationFormat {
        switch (config.format) {
            case "zurg":
                return new ZurgFormat(config);

            case "zod":
                return new ZodFormat(config);

            case "none":
                return new PassthroughFormat(config);

            default:
                throw new Error(`Unknown serialization format: ${config.format}`);
        }
    }

    /**
     * Get the active serialization format
     */
    public getFormat(): SerializationFormat {
        return this.format;
    }

    /**
     * Get the format type string
     */
    public getFormatType(): SerializationFormatType {
        return this.formatType;
    }

    /**
     * Check if serialization is enabled i.e. not passthrough.
     */
    public isEnabled(): boolean {
        return this.formatType !== "none";
    }

    /**
     * Check if the serialization format is passthrough.
     */
    public isPassthrough(): boolean {
        return this.formatType === "none";
    }

    /**
     * Get runtime dependencies required by the active format.
     * Note: only used for legacy zurg format until it can be refactored into a npm dependency.
    public getRuntimeDependencies(): Record<string, string> {
        return this.format.getRuntimeDependencies();
    }

    /**
     * Get runtime file patterns for the active format.
     * Used only for legacy zurg format until it can be refactored into a npm dependency.
     */
    public getRuntimeFilePatterns(): { patterns: string[]; ignore?: string[] } | null {
        return this.format.getRuntimeFilePatterns();
    }

    /**
     * Helper to determine the format type from legacy noSerdeLayer config. Helps with backwards compatibility.
     */
    public static resolveFormatType(options: {
        serializationFormat?: SerializationFormatType;
        noSerdeLayer?: boolean;
    }): SerializationFormatType {
        // If explicit format is provided, use it
        if (options.serializationFormat != null) {
            return options.serializationFormat;
        }

        // Fall back to noSerdeLayer logic for backward compatibility
        if (options.noSerdeLayer === true) {
            return "none";
        }

        // Default to Zurg
        return "zurg";
    }
}
