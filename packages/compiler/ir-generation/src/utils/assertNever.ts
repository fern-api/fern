export function assertNever(typeDefinition: never): never {
    throw new Error("Unexpected value: " + JSON.stringify(typeDefinition));
}
