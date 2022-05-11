import { z } from "zod";
import { extendTypeDefinitionSchema } from "./TypeDefinitionSchema";
import { WithDocsSchema } from "./WithDocsSchema";

// This return type is too crazy to write explicitly!
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function extendWireMessageSchema<T extends z.ZodRawShape>(extension: T) {
    const schema = extendTypeDefinitionSchema(z.strictObject({}).extend(WithDocsSchema.shape).extend(extension).shape);

    return z.union([z.string(), schema]);
}

export const WireMessageSchema = extendWireMessageSchema({});
export type WireMessageSchema = z.infer<typeof WireMessageSchema>;
