import { z } from "zod";

export const FernRcAiProviderSchema = z.enum(["anthropic", "openai", "bedrock"]);
export type FernRcAiProvider = z.infer<typeof FernRcAiProviderSchema>;

export const FernRcAiSchema = z.object({
    /**
     * Provider used for AI-powered fixes (`fern check` MDX fix suggestions).
     * Defaults to `anthropic` when unset.
     *
     * API keys are stored securely in the OS keyring (macOS Keychain /
     * Linux libsecret / Windows Credential Manager) via `fern config ai set-key`.
     * They are never written to this file.
     */
    provider: FernRcAiProviderSchema.optional()
});

export type FernRcAiSchema = z.infer<typeof FernRcAiSchema>;
