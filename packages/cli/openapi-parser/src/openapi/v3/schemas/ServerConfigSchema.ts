import { z } from "zod";

export const ServerConfigSchema = z.object({
    name: z.optional(z.string()),
    environment: z.string()
});

export type ServerConfigSchema = z.infer<typeof ServerConfigSchema>;
