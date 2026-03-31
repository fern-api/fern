import { z } from "zod";

/**
 * Auth schemes names mapped to their configuration objects. The values
 * support oauth, bearer, basic, and header auth schemes.
 *
 * For now, we use z.unknown() for the scheme values since they have
 * complex nested structures that are validated by the legacy workspace
 * system.
 *
 * Plus, these configurations might change over time, so we don't want
 * to lock ourselves into a specific schema.
 */
export const AuthSchemesSchema = z.record(z.string(), z.unknown());

export type AuthSchemesSchema = z.infer<typeof AuthSchemesSchema>;
