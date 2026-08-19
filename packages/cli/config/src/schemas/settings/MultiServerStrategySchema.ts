import { z } from "zod";

/**
 * Controls how multiple top-level OpenAPI servers map to environments in the generated Fern definition.
 */
export const MultiServerStrategySchema = z.enum(["environmentPerServer", "urlsPerEnvironment"]);

export type MultiServerStrategySchema = z.infer<typeof MultiServerStrategySchema>;
