import { z } from "zod";

import { NpmRegistryOutputSchema } from "./NpmRegistryOutputSchema";

export const NpmPublishingSchema = z.strictObject({
    npm: NpmRegistryOutputSchema
});

export type NpmPublishingSchema = z.infer<typeof NpmPublishingSchema>;
