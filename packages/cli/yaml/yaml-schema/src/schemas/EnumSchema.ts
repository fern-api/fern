import { z } from "zod";
import { EnumValueSchema } from "./EnumValueSchema";
import { WithDocsSchema } from "./WithDocsSchema";

export const EnumSchema = WithDocsSchema.extend({
    enum: z.array(EnumValueSchema),
});

export type EnumSchema = z.infer<typeof EnumSchema>;
