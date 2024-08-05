import { z } from "zod";
import { ProtobufSourceFileSchema } from "./ProtobufSourceFileSchema";

export const GrpcSchema = ProtobufSourceFileSchema.extend(
    z.strictObject({
        "service-name": z.string().describe("The name of the gRPC service.")
    }).shape
);

export type GrpcSchema = z.infer<typeof GrpcSchema>;
