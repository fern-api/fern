import { z } from "zod";

/**
 * Schema for GraphQL spec definition in fern.yml.
 */
export const GraphQlSpecSchema = z.object({
    /** Path to the GraphQL schema file. */
    graphql: z.string(),

    /** URL origin for the GraphQL endpoint. */
    origin: z.string().optional(),

    /** Path to overrides file for the GraphQL spec. */
    overrides: z.union([z.string(), z.array(z.string()).nonempty()]).optional(),

    /** Name used to group this GraphQL spec in the docs (rendered as a top-level section). */
    name: z.string().optional()
});

export type GraphQlSpecSchema = z.infer<typeof GraphQlSpecSchema>;
