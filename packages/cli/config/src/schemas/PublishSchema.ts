import { z } from "zod";
import { NpmPublishSchema } from "./NpmPublishSchema";

export const PublishSchema = z.object({
    npm: NpmPublishSchema.optional()
});

export type PublishSchema = z.infer<typeof PublishSchema>;
