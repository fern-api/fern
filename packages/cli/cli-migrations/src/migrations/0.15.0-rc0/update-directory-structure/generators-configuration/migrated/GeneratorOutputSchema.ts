import { z } from "zod";

import { LocalFileSystemOutputLocationSchema } from "./LocalFileSystemOutputLocationSchema.js";
import { MavenOutputLocationSchema } from "./MavenOutputLocationSchema.js";
import { NpmOutputLocationSchema } from "./NpmOutputLocationSchema.js";
import { PostmanOutputLocationSchema } from "./PostmanOutputLocationSchema.js";
import { PypiOutputLocationSchema } from "./PypiOutputLocationSchema.js";

export const GeneratorOutputSchema = z.discriminatedUnion("location", [
    NpmOutputLocationSchema,
    MavenOutputLocationSchema,
    PypiOutputLocationSchema,
    PostmanOutputLocationSchema,
    LocalFileSystemOutputLocationSchema
]);

export type GeneratorOutputSchema = z.infer<typeof GeneratorOutputSchema>;
