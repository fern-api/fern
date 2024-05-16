import { z } from "zod";
import { DoublePropertySchema } from "./DoublePropertySchema";
import { IntegerPropertySchema } from "./IntegerPropertySchema";
import { StringPropertySchema } from "./StringPropertySchema";
import { TypeReferenceDeclarationWithNameSchema } from "./TypeReferenceSchema";

export const ObjectPropertySchema = z.union([
    StringPropertySchema,
    IntegerPropertySchema,
    DoublePropertySchema,
    TypeReferenceDeclarationWithNameSchema
]);

export type ObjectPropertySchema = z.infer<typeof ObjectPropertySchema>;
