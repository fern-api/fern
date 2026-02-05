import { z } from "zod";
import { AiConfigSchema } from "./AiConfigSchema";
import { ApiDefinitionSchema } from "./ApiDefinitionSchema";
import { ApisSchema } from "./ApisSchema";
import { CliSchema } from "./CliSchema";
import { SdksSchema } from "./SdksSchema";

export const FernYmlSchema = z.object({
    edition: z.string(),
    org: z.string(),
    ai: AiConfigSchema.optional(),
    cli: CliSchema.optional(),
    sdks: SdksSchema.optional(),

    // At most one of 'api' or 'apis' should be present.
    //
    // For now, we validate this in a downstream component
    // to prevent a cross product of union variants in
    // future schema shapes.
    api: ApiDefinitionSchema.optional(),
    apis: ApisSchema.optional()
});

export type FernYmlSchema = z.infer<typeof FernYmlSchema>;
