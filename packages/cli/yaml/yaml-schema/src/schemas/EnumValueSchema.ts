import { z } from "zod";
import { WithNameAndDocsSchema } from "./WithNameAndDocsSchema";

export const EnumValueSchema = WithNameAndDocsSchema.extend({
    value: z.string(),
});

export type EnumValueSchema = z.infer<typeof EnumValueSchema>;
