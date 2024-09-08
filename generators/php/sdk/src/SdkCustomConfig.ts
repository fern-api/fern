import { z } from "zod";

export const SdkCustomConfigSchema = z.strictObject({});

export type SdkCustomConfigSchema = z.infer<typeof SdkCustomConfigSchema>;
