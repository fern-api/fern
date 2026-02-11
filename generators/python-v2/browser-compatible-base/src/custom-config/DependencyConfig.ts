import { z } from "zod";

import { BaseDependencyConfig } from "./BaseDependencyConfig";

export const DependencyConfig: z.ZodObject<
    { version: z.ZodString; extras: z.ZodOptional<z.ZodArray<z.ZodString, "many">> } & {
        python: z.ZodOptional<z.ZodString>;
        optional: z.ZodOptional<z.ZodBoolean>;
    },
    "strip",
    z.ZodTypeAny,
    {
        version: string;
        optional?: boolean | undefined;
        extras?: Array<string> | undefined;
        python?: string | undefined;
    },
    { version: string; optional?: boolean | undefined; extras?: Array<string> | undefined; python?: string | undefined }
> = BaseDependencyConfig.extend({
    python: z.string().optional(),
    optional: z.boolean().optional()
});

export type DependencyConfig = z.infer<typeof DependencyConfig>;
