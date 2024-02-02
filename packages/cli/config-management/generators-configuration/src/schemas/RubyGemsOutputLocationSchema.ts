import { z } from "zod";

// It is worth noting that RubyGems API keys need to have the "Push rubygem" permission.
// Ideally it is also permissioned with index and yank rubygem permissions.
// Additionally if the creator of the API key has MFA enabled, they must be sure to update their MFA
// settings to not require MFA for API key usage ("UI and gem signin").
export const RubyGemsOutputLocationSchema = z.strictObject({
    location: z.literal("rubygems"),
    url: z.optional(z.string()),
    "package-name": z.string(),
    "api-key": z.optional(z.string())
});

export type RubyGemsOutputLocationSchema = z.infer<typeof RubyGemsOutputLocationSchema>;
