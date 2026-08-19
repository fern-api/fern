import { z } from "zod";

import { BaseDependencyConfig } from "./BaseDependencyConfig.js";

export const DependencyConfig = BaseDependencyConfig.extend({
    python: z.string().optional(),
    optional: z.boolean().optional()
});

export type DependencyConfig = z.infer<typeof DependencyConfig>;
