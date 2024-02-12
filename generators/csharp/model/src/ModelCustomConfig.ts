import { z } from "zod";

export const ModelCustomConfigSchema = z.strictObject({});

export type ModelCustomConfigSchema = z.infer<typeof ModelCustomConfigSchema>;
