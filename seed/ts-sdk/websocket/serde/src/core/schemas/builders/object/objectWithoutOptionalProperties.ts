import { object } from "./object.js";
import {
    ObjectSchema,
    PropertySchemas,
    inferParsedPropertySchema,
    inferRawObjectFromPropertySchemas,
} from "./types.js";

export function objectWithoutOptionalProperties<ParsedKeys extends string, T extends PropertySchemas<ParsedKeys>>(
    schemas: T,
): inferObjectWithoutOptionalPropertiesSchemaFromPropertySchemas<T> {
    return object(schemas) as unknown as inferObjectWithoutOptionalPropertiesSchemaFromPropertySchemas<T>;
}

export type inferObjectWithoutOptionalPropertiesSchemaFromPropertySchemas<T extends PropertySchemas<keyof T>> =
    ObjectSchema<
        inferRawObjectFromPropertySchemas<T>,
        inferParsedObjectWithoutOptionalPropertiesFromPropertySchemas<T>
    >;

export type inferParsedObjectWithoutOptionalPropertiesFromPropertySchemas<T extends PropertySchemas<keyof T>> = {
    [K in keyof T]: inferParsedPropertySchema<T[K]>;
};
