import { z } from "zod";

export const ModuleExport = z.object({
    from: z.string().optional(),
    imports: z.array(z.string()).optional()
});

export type ModuleExport = z.infer<typeof ModuleExport>;
