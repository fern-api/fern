import { isNonNullish } from "./isNonNullish";

export function nullIfNullish<T>(value: T | null | undefined): T | null {
    return isNonNullish(value) ? value : null;
}

export function undefinedIfNullish<T>(value: T | null | undefined): T | undefined {
    return isNonNullish(value) ? value : undefined;
}

export function undefinedIfSomeNullish<T extends Record<string, unknown>>(
    obj: { [K in keyof T]: T[K] | null | undefined }
): T | undefined {
    return allOrNoneIf(obj, (value) => !isNonNullish(value), undefined);
}

export function nullIfSomeNullish<T extends Record<string, unknown>>(
    obj: { [K in keyof T]: T[K] | null | undefined }
): T | null {
    return allOrNoneIf(obj, (value) => !isNonNullish(value), null);
}

export function haveSameNullishness(...params: (unknown | null | undefined)[]): boolean {
    const nullishCount = params.filter((param) => !isNonNullish(param)).length;
    return nullishCount === 0 || nullishCount === params.length;
}

function allOrNoneIf<T extends Record<string, unknown>, R, Q>(
    obj: { [K in keyof T]: T[K] | R },
    predicate: (value: T[keyof T] | R) => boolean,
    returnValue: Q
): T | Q {
    const entries = Object.entries(obj);
    const hasMatch = entries.some(([, value]) => predicate(value));

    if (hasMatch) {
        return returnValue;
    }

    return obj as T;
}
