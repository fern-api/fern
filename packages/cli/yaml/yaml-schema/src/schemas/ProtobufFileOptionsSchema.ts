import { z } from "zod";
import { ProtobufCsharpSchema } from "./ProtobufCsharpSchema";

export const ProtobufFileOptionsSchema = z.strictObject({
    csharp: z.optional(ProtobufCsharpSchema)
});

export type ProtobufFileOptionsSchema = z.infer<typeof ProtobufFileOptionsSchema>;
