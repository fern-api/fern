import { z } from "zod";
import { CustomReadmeSectionSchema } from "./CustomReadmeSectionSchema";

export const BaseRustCustomConfigSchema = z.object({
    crateName: z.string().optional(),
    crateVersion: z.string().optional(),
    clientClassName: z.string().optional(),
    environmentEnumName: z.string().optional(),
    customReadmeSections: z.array(CustomReadmeSectionSchema).optional(),
    extraDependencies: z.record(z.string()).optional(),
    extraDevDependencies: z.record(z.string()).optional()
});

export type BaseRustCustomConfigSchema = z.infer<typeof BaseRustCustomConfigSchema>;
