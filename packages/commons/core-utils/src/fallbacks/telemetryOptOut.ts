/**
 * Whether the user opted out of CLI telemetry with `FERN_DISABLE_TELEMETRY=true`.
 *
 * Only the exact value `true` counts. Other affirmative values such as `1` or `yes` do not opt out.
 */
export function isTelemetryOptedOutByEnv(): boolean {
    return process.env.FERN_DISABLE_TELEMETRY === "true";
}
