import { z } from "zod";
import { DeclarationWithNameSchema } from "./DeclarationWithNameSchema";
import { NumberRulesSchema } from "./NumberRulesSchema";

export const DoublePropertySchema = DeclarationWithNameSchema.extend(
    z
        .strictObject({
            type: z.literal("double")
        })
        .extend(NumberRulesSchema.shape).shape
);

export type DoublePropertySchema = z.infer<typeof DoublePropertySchema>;
