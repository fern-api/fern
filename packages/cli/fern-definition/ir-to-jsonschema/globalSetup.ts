export async function setup(): Promise<void> {
    const { generate } = await import("./generateTests.mjs");
    generate();
}

export async function onTestsRerun(): Promise<void> {
    const { generate } = await import("./generateTests.mjs");
    generate();
}
