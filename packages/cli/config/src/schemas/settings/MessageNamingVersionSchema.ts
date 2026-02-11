import { z } from "zod";

/**
 * Controls the message naming version for AsyncAPI specs.
 */
export const MessageNamingVersionSchema: z.ZodEnum<{ v1: "v1"; v2: "v2" }> = z.enum(["v1", "v2"]);

export type MessageNamingVersionSchema = z.infer<typeof MessageNamingVersionSchema>;
