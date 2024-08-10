import { z } from "zod";

/**
 * @example
 * root: proto
 * target: proto/user/v1/user.proto
 * local-generation: true
 */
export const ProtobufDefinitionSchema = z.strictObject({
    root: z.string().describe("The path to the `.proto` directroy root (e.g. `proto`)."),
    target: z
        .string()
        .describe("The path to the target `.proto` file that defines the API (e.g. `proto/user/v1/user.proto`)."),
    overrides: z.optional(z.string()).describe("Path to the overrides configuration"),
    "local-generation": z
        .optional(z.boolean())
        .describe("Whether to compile the `.proto` files locally. By default, we generate remotely.")
});

export type ProtobufDefinitionSchema = z.infer<typeof ProtobufDefinitionSchema>;

/**
 * @example
 * proto:
 *   root: proto
 *   target: proto/user/v1/user.proto
 */
export const ProtobufAPIDefinitionSchema = z.strictObject({
    proto: ProtobufDefinitionSchema
});

export type ProtobufAPIDefinitionSchema = z.infer<typeof ProtobufAPIDefinitionSchema>;