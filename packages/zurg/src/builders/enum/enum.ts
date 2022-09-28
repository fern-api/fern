import { Schema } from "../../Schema";
import { createIdentitySchemaCreator } from "../identity";

export function enum_<U extends string, E extends Readonly<[U, ...U[]]>>(_values: E): Schema<E[number], E[number]> {
    return createIdentitySchemaCreator<E[number]>()();
}
