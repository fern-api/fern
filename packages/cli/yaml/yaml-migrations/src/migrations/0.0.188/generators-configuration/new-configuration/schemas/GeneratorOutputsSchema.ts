import { z } from "zod";
import { GithubRepositoryOutputSchema } from "./GithubRepositoryOutputSchema";
import { MavenRegistryOutputSchema } from "./MavenRegistryOutputSchema";
import { NpmRegistryOutputSchema } from "./NpmRegistryOutputSchema";

export const GeneratorOutputsSchema = z.strictObject({
    npm: z.optional(NpmRegistryOutputSchema),
    maven: z.optional(MavenRegistryOutputSchema),
    github: z.optional(GithubRepositoryOutputSchema)
});

export type GeneratorOutputsSchema = z.infer<typeof GeneratorOutputsSchema>;
