import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";

/**
 * Reads the SDK version from the generator config's output mode.
 *
 * Switches on `mode.type` rather than calling `mode._visit` so that it also works with a
 * plain JSON config (e.g. the docs platform passes `JSON.parse`d configs, which have no `_visit`).
 */
export function getSdkVersion(config: FernGeneratorExec.GeneratorConfig): string | undefined {
    const mode = config.output.mode;
    switch (mode.type) {
        case "publish":
        case "github":
            return mode.version;
        case "downloadFiles":
            return undefined;
        default:
            throw new Error("Unrecognized output mode.");
    }
}
