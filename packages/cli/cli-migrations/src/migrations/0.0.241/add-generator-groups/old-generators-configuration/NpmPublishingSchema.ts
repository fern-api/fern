import { z } from "zod";

import { NpmRegistryOutputSchema } from "./NpmRegistryOutputSchema.js";

export const NpmPublishingSchema = z.strictObject({
    npm: NpmRegistryOutputSchema
});

export type NpmPublishingSchema = z.infer<typeof NpmPublishingSchema>;
