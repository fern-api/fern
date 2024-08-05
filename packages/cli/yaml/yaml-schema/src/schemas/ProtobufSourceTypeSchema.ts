import { z } from "zod";
import { ProtobufSourceFileSchema } from "./ProtobufSourceFileSchema";

export const ProtobufSourceTypeSchema = z
    .strictObject({
        name: z.optional(z.string()),
        isStruct: z.optional(z.boolean()).describe("Denotes whether the source type is a google.protobuf.Struct."),
        isStructValue: z.optional(z.boolean()).describe("Denotes whether the source type is a google.protobuf.Value.")
    })
    .extend(ProtobufSourceFileSchema.shape);

export type ProtobufSourceTypeSchema = z.infer<typeof ProtobufSourceTypeSchema>;
