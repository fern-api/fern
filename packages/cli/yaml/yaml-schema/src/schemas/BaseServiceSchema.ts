import { z } from "zod";
import { WithDocsSchema } from "./WithDocsSchema";

export const BaseServiceSchema = WithDocsSchema.extend({
    auth: z.boolean(),
});

export type BaseServiceSchema = z.infer<typeof BaseServiceSchema>;
