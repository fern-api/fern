/**
 * Records per-generator outcomes when generation is fanned out across multiple generators.
 *
 * When an {@link AutomationRunOptions} is provided to {@link runRemoteGenerationForAPIWorkspace},
 * the runner catches per-generator failures so siblings still run, and reports each outcome here.
 * When absent, the runner preserves its default behavior of throwing on the first failure.
 */
export interface RemoteGeneratorRunRecorder {
    recordSuccess(args: {
        apiName: string | undefined;
        groupName: string;
        generatorName: string;
        version: string | null;
        durationMs: number;
    }): void;

    recordFailure(args: {
        apiName: string | undefined;
        groupName: string;
        generatorName: string;
        errorMessage: string;
        durationMs: number;
    }): void;
}

/**
 * Presence of this object on a call to `generateAPIWorkspaces` / `generateWorkspace` /
 * `runRemoteGenerationForAPIWorkspace` means "fan-out automation mode":
 *   - Iterate every group and every generator instead of honoring default-group.
 *   - Silently skip generators opted out via `automations.generate: false` / `autorelease: false` /
 *     local-file-system output — but reject explicit `--generator` targeting of an opted-out one.
 *   - Per-generator failures are captured via the recorder and siblings keep running.
 *   - Config errors (missing group, bad --generator) still throw loudly.
 */
export interface AutomationRunOptions {
    recorder: RemoteGeneratorRunRecorder;
}
