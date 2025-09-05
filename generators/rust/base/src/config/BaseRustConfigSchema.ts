import { z } from "zod";

export const BaseRustCustomConfigSchema = z.object({
    packageName: z.string().optional(),
    packageVersion: z.string().optional(),
    authors: z.array(z.string()).optional(),
    edition: z.enum(["2015", "2018", "2021"]).optional().default("2021"),
    crateRegistry: z.string().optional(),
    generateTests: z.boolean().optional().default(true),
    useSerde: z.boolean().optional().default(true),
    useReqwest: z.boolean().optional().default(true),
    useTokio: z.boolean().optional().default(true),
    extraDependencies: z.record(z.string()).optional(),
    extraDevDependencies: z.record(z.string()).optional()
});

export type BaseRustCustomConfigSchema = z.infer<typeof BaseRustCustomConfigSchema>;
