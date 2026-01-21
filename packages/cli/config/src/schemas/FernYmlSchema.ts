import { z } from "zod";
import { CliSchema } from "./CliSchema";
import { SdksSchema } from "./SdksSchema";

export const FernYmlSchema = z.object({
    edition: z.string(),
    org: z.string(),
    cli: CliSchema.optional(),
    sdks: SdksSchema.optional()
});

export type FernYmlSchema = z.infer<typeof FernYmlSchema>;
