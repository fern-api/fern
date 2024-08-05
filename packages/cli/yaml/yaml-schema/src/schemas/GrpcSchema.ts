import { z } from "zod";

export const GrpcSchema = z.strictObject({
    "service-name": z.string().describe("The name of the gRPC service.")
});

export type GrpcSchema = z.infer<typeof GrpcSchema>;
