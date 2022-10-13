import { z } from "zod";
import { MavenPublishingSchema } from "./MavenPublishingSchema";
import { NpmPublishingSchema } from "./NpmPublishingSchema";

export const GeneratorPublishingSchema = z.union([NpmPublishingSchema, MavenPublishingSchema]);

export type GeneratorPublishingSchema = z.infer<typeof GeneratorPublishingSchema>;
