import { z } from "zod";

import { BaseCsharpCustomConfigSchema } from "@fern-api/csharp-codegen";

export const SdkCustomConfigSchema = BaseCsharpCustomConfigSchema;

export type SdkCustomConfigSchema = z.infer<typeof SdkCustomConfigSchema>;
