import { z } from "zod";
import { extendTypeDefinitionSchema } from "./TypeDefinitionSchema";

// This return type is too crazy to write explicitly!
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function extendEncodableTypeDefinitionSchema<T extends z.ZodRawShape>(extension: T) {
    return extendTypeDefinitionSchema(
        z
            .strictObject({
                encoding: z.optional(z.string()),
            })
            .extend(extension).shape
    );
}

export const EncodableTypeDefinitionSchema = extendEncodableTypeDefinitionSchema({});
