import { z } from "zod";
import { WithDocsSchema } from "./utils/WithDocsSchema";

export const EnumSchema = z
    .strictObject({
        enum: z.array(z.string()),
    })
    .merge(WithDocsSchema);

export type EnumSchema = z.infer<typeof EnumSchema>;
