import { isPlainObject as isPlainObjectLodash } from "lodash-es";

export function isPlainObject(value: unknown): value is Record<string, unknown> {
    return isPlainObjectLodash(value);
}
