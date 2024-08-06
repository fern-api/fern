import { z } from "zod";

export const ProtobufSchema = z.strictObject({
    path: z
        .string()
        .describe("The path to the Protobuf definition root (i.e. the directory containing all the .proto files).")
});

export type ProtobufSchema = z.infer<typeof ProtobufSchema>;
