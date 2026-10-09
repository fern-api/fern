import { AbsoluteFilePath, dirname, doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";
import fs from "fs/promises";

/**
 * Persists the timestamp of the last update probe so we don't spam the
 * release feed on every command invocation.
 *
 * Stored at `<cacheBaseDir>/v1/update-check.json` so it travels with the rest
 * of the cache (and gets wiped by `fern cache clear`, which is fine — it just
 * forces the next command to do a fresh probe).
 */
const FILENAME = "update-check.json";
const DEFAULT_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours

export declare namespace UpdateCheckTracker {
    interface State {
        /** Epoch millis of the last successful probe. */
        lastCheckedAt: number;
        /** Latest version observed at last probe, if any. */
        latestVersion?: string;
    }
}

export class UpdateCheckTracker {
    private readonly filePath: AbsoluteFilePath;
    private readonly intervalMs: number;

    constructor({ baseDir, intervalMs }: { baseDir: AbsoluteFilePath; intervalMs?: number }) {
        this.filePath = join(baseDir, RelativeFilePath.of(FILENAME));
        this.intervalMs = intervalMs ?? DEFAULT_INTERVAL_MS;
    }

    /**
     * Returns true when enough time has elapsed since the last check that we
     * should hit the network again.
     */
    public async shouldCheck(now: number = Date.now()): Promise<boolean> {
        const state = await this.read();
        if (state == null) {
            return true;
        }
        return now - state.lastCheckedAt >= this.intervalMs;
    }

    /**
     * Records that a check happened, optionally with the version observed.
     */
    public async recordCheck({ latestVersion, now }: { latestVersion?: string; now?: number } = {}): Promise<void> {
        const state: UpdateCheckTracker.State = {
            lastCheckedAt: now ?? Date.now(),
            latestVersion
        };
        await fs.mkdir(dirname(this.filePath), { recursive: true });
        await fs.writeFile(this.filePath, JSON.stringify(state, null, 2), "utf-8");
    }

    /**
     * Loads the prior state, or undefined if missing/corrupt.
     */
    public async read(): Promise<UpdateCheckTracker.State | undefined> {
        try {
            if (!(await doesPathExist(this.filePath))) {
                return undefined;
            }
            const contents = await fs.readFile(this.filePath, "utf-8");
            const parsed = JSON.parse(contents) as unknown;
            if (typeof parsed !== "object" || parsed === null) {
                return undefined;
            }
            const record = parsed as Record<string, unknown>;
            if (typeof record.lastCheckedAt !== "number") {
                return undefined;
            }
            const latestVersion = typeof record.latestVersion === "string" ? record.latestVersion : undefined;
            return { lastCheckedAt: record.lastCheckedAt, latestVersion };
        } catch {
            return undefined;
        }
    }
}
