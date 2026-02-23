export async function setup(): Promise<void> {
    const { generate } = await import("./generateTests.mjs");
    generate();
}

export function onTestsRerun(): void {
    import("./generateTests.mjs").then(({ generate }) => generate());
}
