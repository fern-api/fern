import { z } from "zod";

export const ProtobufSourceSchema = z.strictObject({
    proto: z.string().describe("The Protobuf filepath that defined this node.")
});

export type ProtobufSourceSchema = z.infer<typeof ProtobufSourceSchema>;
