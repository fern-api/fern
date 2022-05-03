import { z } from "zod";
import { extendTypeDefinitionSchema } from "./TypeDefinitionSchema";
import { WithDocsSchema } from "./WithDocsSchema";

// This return type is too crazy to write explicitly!
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function extendWireMessageSchema<T extends z.ZodRawShape>(extension: T) {
    return z.union([z.string(), extendTypeDefinitionSchema(WithDocsSchema.extend(extension).shape)]);
}

export const WireMessageSchema = extendWireMessageSchema({});
export type WireMessageSchema = z.infer<typeof WireMessageSchema>;
