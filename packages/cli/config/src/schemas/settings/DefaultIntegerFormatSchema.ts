import { z } from "zod";

/**
 * The default format to use for integer types when no format is specified in the OpenAPI schema.
 */
export const DefaultIntegerFormatSchema: z.ZodEnum<{
    int32: "int32";
    int64: "int64";
    uint32: "uint32";
    uint64: "uint64";
}> = z.enum(["int32", "int64", "uint32", "uint64"]);

export type DefaultIntegerFormatSchema = z.infer<typeof DefaultIntegerFormatSchema>;
