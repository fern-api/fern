import { z } from "zod";
import { GeneratorRegistriesConfig } from "./GeneratorRegistriesConfig";

// IMPORTANT: don't use strictObject so we're forward compat if new keys are added

export const GeneratorPublishConfigSchema = z.object({
    registryUrl: z.string(),
    registries: GeneratorRegistriesConfig,
});

export type GeneratorPublishConfigSchema = z.infer<typeof GeneratorPublishConfigSchema>;
