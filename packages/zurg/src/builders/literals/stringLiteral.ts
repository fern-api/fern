import { Schema } from "../../Schema";
import { createIdentitySchemaCreator } from "../identity";

export function stringLiteral<V extends string>(_value: V): Schema<V, V> {
    return createIdentitySchemaCreator<V>()();
}
