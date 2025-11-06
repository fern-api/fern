import { BaseJavaCustomConfigSchema } from "@fern-api/java-ast";
import { z } from "zod";

export const SdkCustomConfigSchema = BaseJavaCustomConfigSchema.extend({
    "enable-websockets": z.boolean().optional()
});

export type SdkCustomConfigSchema = z.infer<typeof SdkCustomConfigSchema>;
