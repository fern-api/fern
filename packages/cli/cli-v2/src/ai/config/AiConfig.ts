import type { AiProvider } from "./AiProvider";

/**
 * AI configuration for Fern features (e.g. example generation).
 */
export interface AiConfig {
    /** The AI provider to use */
    provider: AiProvider;
    /** The model name to use */
    model: string;
}
