import { z } from "zod";
import { GrpcSchema } from "./GrpcSchema";

export const TransportSchema = z.strictObject({
    grpc: z.optional(GrpcSchema)
});

export type TransportSchema = z.infer<typeof TransportSchema>;
