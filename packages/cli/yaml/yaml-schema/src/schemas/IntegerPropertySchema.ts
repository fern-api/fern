import { z } from "zod";
import { DeclarationWithNameSchema } from "./DeclarationWithNameSchema";
import { NumberRulesSchema } from "./NumberRulesSchema";

export const IntegerPropertySchema = DeclarationWithNameSchema.extend(
    z
        .strictObject({
            type: z.literal("integer")
        })
        .extend(NumberRulesSchema.shape).shape
);

export type IntegerPropertySchema = z.infer<typeof IntegerPropertySchema>;
