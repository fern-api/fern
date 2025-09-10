import { BaseCsharpCustomConfigSchema } from "@fern-api/csharp-codegen";
import { z } from "zod";

export const SdkCustomConfigSchema = BaseCsharpCustomConfigSchema;

export type SdkCustomConfigSchema = z.infer<typeof SdkCustomConfigSchema>;
