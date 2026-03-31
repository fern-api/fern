import { z } from "zod";

/**
 * Schema for endpoint filtering in OpenAPI specs.
 * Allows filtering which endpoints are included in the generated SDK.
 */
export const OpenApiFilterSchema = z.object({
    /** Endpoints to include in the generated SDK (e.g. "POST /users"). */
    endpoints: z.array(z.string()).optional()
});

export type OpenApiFilterSchema = z.infer<typeof OpenApiFilterSchema>;
