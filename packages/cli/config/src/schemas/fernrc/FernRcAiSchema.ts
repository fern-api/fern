import { z } from "zod";

export const FernRcAiSchema = z.object({
    /**
     * Anthropic API key used for AI-powered fixes (e.g. `fern check` MDX fix suggestions).
     * Can also be supplied via the ANTHROPIC_API_KEY environment variable, which takes
     * precedence over this value.
     */
    anthropic_api_key: z.string().optional()
});

export type FernRcAiSchema = z.infer<typeof FernRcAiSchema>;
