import { NoneFormat } from "./formats/NoneFormat";
import { ZodFormat } from "./formats/ZodFormat";
import { ZurgFormat } from "./formats/ZurgFormat";
import { SerializationFormat, SerializationFormatConfig } from "./SerializationFormat";

/**
 * Supported serialization format types
 */
export type SerializationFormatType = "default" | "zod" | "none";

/**
 * Configuration for creating a SerializationPipeline
 */
export interface SerializationPipelineConfig extends SerializationFormatConfig {
    
    /**
     * The serialization format to use.
     * - "default": Use Zurg (legacy implementation)
     * - "zod": Use Zod.
     * - "none": No serialization, equivalent to noSerdeLayer: true.
     */
    format: SerializationFormatType;
}

/**
 * SerializationPipeline manages the creation and configuration of serialization formats.
 * It provides a unified interface for generating schema AST code regardless of the
 * underlying format being used.
 */
export class SerializationPipeline {
    private readonly format: SerializationFormat;
    private readonly formatType: SerializationFormatType;

    constructor(config: SerializationPipelineConfig) {
        this.formatType = config.format;
        this.format = this.createFormat(config);
    }

    /**
     * Create the appropriate serialization format based on configuration
     */
    private createFormat(config: SerializationPipelineConfig): SerializationFormat {
        switch (config.format) {
            case "default":
                return new ZurgFormat(config);

            case "zod":
                return new ZodFormat(config);

            case "none":
                return new NoneFormat(config);

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
     * Check if serialization is enabled
     */
    public isEnabled(): boolean {
        return this.formatType !== "none";
    }

    /**
     * Get runtime dependencies required by the active format
     */
    public getRuntimeDependencies(): Record<string, string> {
        return this.format.getRuntimeDependencies();
    }

    /**
     * Get runtime file patterns for the active format
     * Returns null if the format uses npm dependencies instead of bundled files
     */
    public getRuntimeFilePatterns(): { patterns: string[]; ignore?: string[] } | null {
        return this.format.getRuntimeFilePatterns();
    }

    /**
     * Helper to determine the format type from legacy noSerdeLayer config
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
        return "default";
    }
}
