import { z } from "zod";

import { MavenRegistryOutputSchema } from "./MavenRegistryOutputSchema.js";

export const MavenPublishingSchema = z.strictObject({
    maven: MavenRegistryOutputSchema
});

export type MavenPublishingSchema = z.infer<typeof MavenPublishingSchema>;
