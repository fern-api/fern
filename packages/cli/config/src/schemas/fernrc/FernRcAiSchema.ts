import { z } from "zod";

export const FernRcAiProviderSchema = z.enum(["anthropic", "openai", "bedrock"]);
export type FernRcAiProvider = z.infer<typeof FernRcAiProviderSchema>;

export const FernRcAiSchema = z.object({
    /**
     * Provider used for AI-powered fixes (`fern check` MDX fix suggestions).
     * Defaults to `anthropic` when unset.
     */
    provider: FernRcAiProviderSchema.optional(),

    /**
     * Anthropic API key. Used when `provider` is `anthropic` (or unset).
     * Can also be supplied via the `ANTHROPIC_API_KEY` environment variable,
     * which takes precedence over this value.
     */
    anthropic_api_key: z.string().optional(),

    /**
     * OpenAI API key. Used when `provider` is `openai`.
     * Can also be supplied via the `OPENAI_API_KEY` environment variable,
     * which takes precedence over this value.
     */
    openai_api_key: z.string().optional()

    // Note: AWS Bedrock authentication is not configured here. When `provider`
    // is `bedrock` we read credentials from the standard AWS environment
    // variables / credentials chain (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`,
    // `AWS_SESSION_TOKEN`, `AWS_REGION`) — same as every other AWS-aware tool.
});

export type FernRcAiSchema = z.infer<typeof FernRcAiSchema>;
