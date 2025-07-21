export function assertNever(x: never): never {
    throw new Error("Unexpected value: " + JSON.stringify(x));
}

// biome-ignore lint/suspicious/noEmptyBlockStatements: allow
export function assertNeverNoThrow(_: never): void {}
