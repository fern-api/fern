import { z } from "zod";
import { WithDocsSchema } from "./WithDocsSchema";

export const EnvironmentSchema = z.union([
    z.string(),
    WithDocsSchema.extend({
        "base-url": z.string(),
    }),
    WithDocsSchema.extend({
        "base-urls": z.string(),
    }),
]);

export type EnvironmentSchema = z.infer<typeof EnvironmentSchema>;
