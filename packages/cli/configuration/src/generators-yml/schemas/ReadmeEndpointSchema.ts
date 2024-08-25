import { z } from "zod";
import { ReadmeEndpointObjectSchema } from "./ReadmeEndpointObjectSchema";

export const ReadmeEndpointSchema = z.union([
    z.string().describe("Endpoint name in 'POST /users' format"),
    ReadmeEndpointObjectSchema
]);

export type ReadmeEndpointSchema = z.infer<typeof ReadmeEndpointSchema>;
