import { z } from "zod";
import { ProtobufTypeSchema } from "./ProtobufTypeSchema";

export const EncodingSchema = z.strictObject({
    proto: z.optional(ProtobufTypeSchema)
});

export type EncodingSchema = z.infer<typeof EncodingSchema>;
