import { z } from "zod";

import { LocalFileSystemOutputLocationSchema } from "./LocalFileSystemOutputLocationSchema.js";
import { MavenOutputLocationSchema } from "./MavenOutputLocationSchema.js";
import { NpmOutputLocationSchema } from "./NpmOutputLocationSchema.js";
import { PostmanOutputLocationSchema } from "./PostmanOutputLocationSchema.js";

export const GeneratorOutputSchema = z.discriminatedUnion("location", [
    NpmOutputLocationSchema,
    MavenOutputLocationSchema,
    PostmanOutputLocationSchema,
    LocalFileSystemOutputLocationSchema
]);

export type GeneratorOutputSchema = z.infer<typeof GeneratorOutputSchema>;
