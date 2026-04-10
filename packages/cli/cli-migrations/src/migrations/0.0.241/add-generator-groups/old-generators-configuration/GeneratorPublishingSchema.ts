import { z } from "zod";

import { MavenPublishingSchema } from "./MavenPublishingSchema.js";
import { NpmPublishingSchema } from "./NpmPublishingSchema.js";
import { PostmanPublishingSchema } from "./PostmanPublishingSchema.js";

export const GeneratorPublishingSchema = z.union([NpmPublishingSchema, MavenPublishingSchema, PostmanPublishingSchema]);

export type GeneratorPublishingSchema = z.infer<typeof GeneratorPublishingSchema>;
