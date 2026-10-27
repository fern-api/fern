import { CliError } from "@fern-api/task-context";

import { CliContext } from "../../cli-context/CliContext.js";
import { type GenerationTelemetryInput, listRequestedGenerators } from "./buildGeneratePosthogProperties.js";

export const GUEST_DOCS_REQUIRE_PREVIEW_MESSAGE =
    "--guest only supports preview docs generation: a guest organization cannot publish to a production docs URL. " +
    "Re-run with --preview, or claim the session (fern claim) / run 'fern login' to publish.";

/** Output modes a guest can run: the result is downloaded, nothing is pushed or published. */
const GUEST_OUTPUT_MODES = new Set(["downloadFiles", "download"]);

export interface GuestIncompatibleGenerator {
    name: string;
    outputMode: string;
}

/**
 * Generators whose delivery a guest organization cannot perform (GitHub pushes, registry publishes). With
 * `--preview` everything is written to the local preview directory, so nothing is incompatible.
 */
export function findGuestIncompatibleGenerators({
    generations,
    isAutomation,
    preview
}: {
    generations: GenerationTelemetryInput[];
    isAutomation: boolean;
    preview: boolean;
}): GuestIncompatibleGenerator[] {
    if (preview) {
        return [];
    }
    return listRequestedGenerators({ generations, isAutomation })
        .filter(({ outputMode }) => !GUEST_OUTPUT_MODES.has(outputMode))
        .map(({ name, outputMode }) => ({ name, outputMode }));
}

/** Fails before a guest session is minted when the selected generators would publish instead of download. */
export function assertGuestCanGenerate({
    generations,
    isAutomation,
    preview,
    cliContext
}: {
    generations: GenerationTelemetryInput[];
    isAutomation: boolean;
    preview: boolean;
    cliContext: CliContext;
}): void {
    const incompatible = findGuestIncompatibleGenerators({ generations, isAutomation, preview });
    if (incompatible.length === 0) {
        return;
    }
    const list = incompatible.map(({ name, outputMode }) => `${name} (${outputMode})`).join(", ");
    cliContext.failAndThrow(
        `--guest can only download generated code; a guest organization cannot push to GitHub or publish to a registry. ` +
            `These generators publish: ${list}. Re-run with --preview to write them locally, switch their output to local-file-system, ` +
            "or claim the session (fern claim) / run 'fern login' to publish.",
        undefined,
        { code: CliError.Code.ConfigError }
    );
}
