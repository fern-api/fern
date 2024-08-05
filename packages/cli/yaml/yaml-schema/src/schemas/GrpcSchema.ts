import { z } from "zod";

export const GrpcSchema = z.strictObject({
    file: z
        .string()
        .describe(
            "The relative path of the `.proto` source file that defines the gRPC service (e.g. user/v1/user.proto)"
        )
});

export type GrpcSchema = z.infer<typeof GrpcSchema>;
