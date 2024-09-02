import { z } from "zod";
import { DeclarationSchema } from "./DeclarationSchema";
import { WithNameSchema } from "./WithNameSchema";

export const DeclarationWithNameSchema = DeclarationSchema.extend(WithNameSchema.shape);

export type DeclarationWithNameSchema = z.infer<typeof DeclarationWithNameSchema>;
