import { z } from "zod";

export const ProtobufCsharpSchema = z.strictObject({
    namespace: z.string()
});

export type ProtobufCsharpSchema = z.infer<typeof ProtobufCsharpSchema>;
