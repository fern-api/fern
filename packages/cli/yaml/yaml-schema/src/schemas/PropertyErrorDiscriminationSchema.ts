import { z } from "zod";

export const PropertyErrorDiscriminationSchema = z.object({
    strategy: z.literal("property"),
    "property-name": z.string()
});

export type PropertyErrorDiscriminationSchema = z.infer<typeof PropertyErrorDiscriminationSchema>;
