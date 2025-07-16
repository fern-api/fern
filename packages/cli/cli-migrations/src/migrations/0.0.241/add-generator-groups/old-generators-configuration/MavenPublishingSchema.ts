import { z } from "zod";

import { MavenRegistryOutputSchema } from "./MavenRegistryOutputSchema";

export const MavenPublishingSchema = z.strictObject({
    maven: MavenRegistryOutputSchema
});

export type MavenPublishingSchema = z.infer<typeof MavenPublishingSchema>;
