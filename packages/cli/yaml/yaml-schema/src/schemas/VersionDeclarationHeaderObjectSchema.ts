import { z } from "zod";

export const VersionDeclarationHeaderObjectSchema = z.strictObject({
    name: z.string().optional().describe("The name of the parameter used to represent the header"),
    env: z.string().optional().describe("The environment variable to read the header value from (if any)"),
    value: z.string().describe("The wire representation of the header (e.g. X-API-Version)")
});

export type VersionDeclarationHeaderObjectSchema = z.infer<typeof VersionDeclarationHeaderObjectSchema>;
