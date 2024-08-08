import { z } from "zod";

export const ProtobufTypeSchema = z.strictObject({
    type: z.optional(z.string()).describe("The name of the Protobuf type (e.g. google.protobuf.Struct).")
});

export type ProtobufTypeSchema = z.infer<typeof ProtobufTypeSchema>;
