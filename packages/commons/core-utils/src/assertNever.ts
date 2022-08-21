export function assertNever(x: never): never {
    throw new Error("Unexpected value: " + JSON.stringify(x));
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
export function assertNeverNoThrow(_: never): void {}
