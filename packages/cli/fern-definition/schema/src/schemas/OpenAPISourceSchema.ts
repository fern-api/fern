import { z } from "zod";

export const OpenAPISourceSchema = z.strictObject({
    openapi: z.string().describe("The OpenAPI filepath that defined this node.")
});

export type OpenAPISourceSchema = z.infer<typeof OpenAPISourceSchema>;
