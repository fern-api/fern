import { CliError } from "@fern-api/task-context";

const UNIT_TO_MS = { s: 1000, m: 60_000, h: 3_600_000 } as const;
// setTimeout fires immediately for delays above 2^31-1 ms (~24.8 days).
const MAX_DURATION_MS = 2_147_483_647;

/**
 * Parses `fern docs dev --timeout` / `--idle-timeout` values: `30s`, `10m`, `1h`, or a plain number of seconds.
 */
export function parseDocsDevDuration(flag: string, value: string | number): number {
    const match = /^(\d+(?:\.\d+)?)\s*([smh]?)$/i.exec(String(value).trim());
    const amount = match?.[1] != null ? Number(match[1]) : Number.NaN;
    const unit = (match?.[2]?.toLowerCase() || "s") as keyof typeof UNIT_TO_MS;
    const ms = Math.round(amount * UNIT_TO_MS[unit]);
    if (!Number.isFinite(ms) || ms <= 0 || ms > MAX_DURATION_MS) {
        throw new CliError({
            message: `Invalid --${flag} "${value}". Use a positive duration such as 30s, 10m or 1h (a plain number means seconds), up to 24 days.`,
            code: CliError.Code.ConfigError
        });
    }
    return ms;
}
