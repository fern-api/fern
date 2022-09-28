import { Schema } from "../../Schema";
import { identity } from "./identity";

export function createIdentitySchemaCreator<T>(): () => Schema<T, T> {
    return <T>() => identity<T>();
}
