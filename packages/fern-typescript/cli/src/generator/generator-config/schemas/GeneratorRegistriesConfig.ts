import { z } from "zod";
import { MavenRegistryConfigSchema } from "./MavenRegistryConfigSchema";
import { NpmRegistryConfigSchema } from "./NpmRegistryConfigSchema";

// IMPORTANT: don't use strictObject so we're forward compat if new keys are added

export const GeneratorRegistriesConfig = z.object({
    maven: MavenRegistryConfigSchema,
    npm: NpmRegistryConfigSchema,
});

export type GeneratorRegistriesConfig = z.infer<typeof GeneratorRegistriesConfig>;
