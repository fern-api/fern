import { z } from "zod";

import { MavenPublishingSchema } from "./MavenPublishingSchema";
import { NpmPublishingSchema } from "./NpmPublishingSchema";
import { PostmanPublishingSchema } from "./PostmanPublishingSchema";

export const GeneratorPublishingSchema = z.union([NpmPublishingSchema, MavenPublishingSchema, PostmanPublishingSchema]);

export type GeneratorPublishingSchema = z.infer<typeof GeneratorPublishingSchema>;
