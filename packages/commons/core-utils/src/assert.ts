/**
 * Asserts that a condition is truthy, throwing an exception with the specified message if it is falsy.
 */
export function assert(condition: unknown, message?: string): asserts condition {
    if (!condition) {
        throw new Error(message ?? "Expected condition to be truthy but got falsy.");
    }
}

export function assertDefined<T>(val: T, message?: string): asserts val is Exclude<T, undefined> {
    if (val === undefined) {
        throw new Error(message ?? "Expected value to be defined but got undefined.");
    }
}

export function assertNonNull<T>(val: T, message?: string): asserts val is Exclude<T, null> {
    if (val === null) {
        throw new Error(message ?? "Expected value to be non-null but got null.");
    }
}

export function assertString(val: unknown, message?: string): asserts val is string {
    if (typeof val !== "string") {
        throw new Error(message ?? `Expected value to be a string but got ${typeof val}.`);
    }
}

export function assertNever(x: never): never {
    throw new Error("Unexpected value: " + JSON.stringify(x));
}

// biome-ignore lint/suspicious/noEmptyBlockStatements: allow
export function assertNeverNoThrow(_: never): void {}

// biome-ignore lint/suspicious/noEmptyBlockStatements: allow
export function assertVoidNoThrow(_x: void): void {}
