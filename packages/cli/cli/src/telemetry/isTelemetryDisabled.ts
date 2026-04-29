/**
 * Returns true when the user has opted out of CLI telemetry via the
 * `FERN_DISABLE_TELEMETRY` environment variable.
 *
 * This only applies to the legacy CLI. The new CLI (cli-v2) uses a combination of
 * a new environment variable (`FERN_TELEMETRY_DISABLED`) and a setting in the `~/.fernrc`
 * file to determine whether telemetry is disabled.
 */
export function isTelemetryDisabled(): boolean {
    return process.env.FERN_DISABLE_TELEMETRY === "true";
}
