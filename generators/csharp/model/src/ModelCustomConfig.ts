import { BaseCustomConfigSchema } from "@fern-api/csharp-generator-cli";
import { z } from "zod";

export const ModelCustomConfigSchema = BaseCustomConfigSchema.extend({});

export type ModelCustomConfigSchema = z.infer<typeof ModelCustomConfigSchema>;
