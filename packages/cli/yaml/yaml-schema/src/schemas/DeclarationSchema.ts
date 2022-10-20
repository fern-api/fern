import { z } from "zod";
import { WithDocsSchema } from "./WithDocsSchema";

export const DeclarationSchema = WithDocsSchema.extend({});

export type DeclarationSchema = z.infer<typeof DeclarationSchema>;
