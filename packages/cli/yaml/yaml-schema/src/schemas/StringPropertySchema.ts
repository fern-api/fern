import { z } from "zod";
import { DeclarationWithNameSchema } from "./DeclarationWithNameSchema";
import { StringRulesSchema } from "./StringRulesSchema";

export const StringPropertySchema = DeclarationWithNameSchema.extend(
    z
        .strictObject({
            type: z.literal("string")
        })
        .extend(StringRulesSchema.shape).shape
);

export type StringPropertySchema = z.infer<typeof StringPropertySchema>;
