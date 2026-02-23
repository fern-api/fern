// Re-exports the generate function for use by vitest's globalSetup hooks.
// The main generation script is in generateTests.mjs, which is also run
// as a pretest step to ensure files exist before vitest discovers them.
import { generate } from "./generateTests.mjs";

// Required by vitest (globalSetup must export setup or default)
export function setup(): void {
    // Generation already happened via the pretest script (node generateTests.mjs).
    // This is a no-op on normal runs but ensures vitest accepts the globalSetup file.
    generate();
}

// Re-generate test files on watch mode reruns (e.g., when fixtures are added/removed)
export function onTestsRerun(): void {
    generate();
}
