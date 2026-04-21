import type { RemoteGeneratorRunRecorder } from "@fern-api/remote-workspace-runner";

export type GeneratorStatus = "success" | "failed" | "skipped_no_diff";

export interface GeneratorRunResult {
    apiName: string | undefined;
    groupName: string;
    generatorName: string;
    status: GeneratorStatus;
    version: string | null;
    pullRequestUrl: string | null;
    errorMessage: string | null;
    durationMs: number;
}

export interface GeneratorRunCounts {
    succeeded: number;
    failed: number;
    skipped: number;
}

/** Single source of truth for aggregating status counts across results. */
export function countResults(results: readonly GeneratorRunResult[]): GeneratorRunCounts {
    let succeeded = 0;
    let failed = 0;
    let skipped = 0;
    for (const r of results) {
        switch (r.status) {
            case "success":
                succeeded++;
                break;
            case "failed":
                failed++;
                break;
            case "skipped_no_diff":
                skipped++;
                break;
        }
    }
    return { succeeded, failed, skipped };
}

export class GeneratorRunCollector implements RemoteGeneratorRunRecorder {
    readonly #results: GeneratorRunResult[] = [];

    public recordSuccess(args: {
        apiName: string | undefined;
        groupName: string;
        generatorName: string;
        version: string | null;
        durationMs: number;
    }): void {
        this.#results.push({
            apiName: args.apiName,
            groupName: args.groupName,
            generatorName: args.generatorName,
            status: "success",
            version: args.version,
            pullRequestUrl: null,
            errorMessage: null,
            durationMs: args.durationMs
        });
    }

    public recordFailure(args: {
        apiName: string | undefined;
        groupName: string;
        generatorName: string;
        errorMessage: string;
        durationMs: number;
    }): void {
        this.#results.push({
            apiName: args.apiName,
            groupName: args.groupName,
            generatorName: args.generatorName,
            status: "failed",
            version: null,
            pullRequestUrl: null,
            errorMessage: args.errorMessage,
            durationMs: args.durationMs
        });
    }

    public results(): readonly GeneratorRunResult[] {
        return this.#results;
    }

    public hasFailures(): boolean {
        return this.#results.some((r) => r.status === "failed");
    }

    public counts(): GeneratorRunCounts {
        return countResults(this.#results);
    }
}
