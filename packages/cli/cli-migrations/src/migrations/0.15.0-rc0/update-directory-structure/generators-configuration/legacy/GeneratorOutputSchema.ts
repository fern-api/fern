import { z } from "zod";

import { LocalFileSystemOutputLocationSchema } from "./LocalFileSystemOutputLocationSchema";
import { MavenOutputLocationSchema } from "./MavenOutputLocationSchema";
import { NpmOutputLocationSchema } from "./NpmOutputLocationSchema";
import { PostmanOutputLocationSchema } from "./PostmanOutputLocationSchema";
import { PypiOutputLocationSchema } from "./PypiOutputLocationSchema";

export const GeneratorOutputSchema = z.discriminatedUnion("location", [
    NpmOutputLocationSchema,
    MavenOutputLocationSchema,
    PypiOutputLocationSchema,
    PostmanOutputLocationSchema,
    LocalFileSystemOutputLocationSchema
]);

export type GeneratorOutputSchema = z.infer<typeof GeneratorOutputSchema>;
