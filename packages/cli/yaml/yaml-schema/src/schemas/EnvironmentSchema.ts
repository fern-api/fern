import { z } from "zod";
import { WithDocsSchema } from "./WithDocsSchema";

export const EnvironmentSchema = z.union([
    z.string(),
    WithDocsSchema.extend({
        url: z.string(),
    }),
]);

export type EnvironmentSchema = z.infer<typeof EnvironmentSchema>;
