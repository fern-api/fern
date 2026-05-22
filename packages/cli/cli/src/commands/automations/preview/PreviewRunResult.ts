import { resolveErrorCode } from "@fern-api/task-context";

import type { AutomationTelemetryEmitOptions } from "../../../telemetry/AutomationTelemetryManager.js";
import {
    type GeneratorFailureSource,
    previewGroupCompletedAttributes,
    previewGroupFailedAttributes
} from "../../../telemetry/automationTelemetryAttributes.js";
import { isAutomationMode } from "../../../telemetry/automationTelemetryContext.js";
import { AUTOMATION_EVENT_NAMES, type AutomationTelemetryEvent } from "../../../telemetry/automationTelemetryEvent.js";
import type { SdkPreviewSuccess } from "../../sdk-preview/sdkPreview.js";
import type { PreviewGroup } from "../listPreviewGroups.js";

export interface PreviewGroupRunResult {
    groupName: string;
    apiName: string | null;
    status: "success" | "error";
    org?: string;
    previews?: SdkPreviewSuccess["previews"];
    error?: string;
}

export interface PreviewRunCounts {
    succeeded: number;
    failed: number;
}

export interface PreviewRunCollectorOptions {
    emitAutomationEvent?: (event: AutomationTelemetryEvent, options?: AutomationTelemetryEmitOptions) => void;
}

export function countPreviewResults(results: readonly PreviewGroupRunResult[]): PreviewRunCounts {
    let succeeded = 0;
    let failed = 0;
    for (const result of results) {
        if (result.status === "success") {
            succeeded++;
        } else {
            failed++;
        }
    }
    return { succeeded, failed };
}

export class PreviewRunCollector {
    readonly #results: PreviewGroupRunResult[] = [];
    readonly #emitAutomationEvent: PreviewRunCollectorOptions["emitAutomationEvent"];

    public constructor(options?: PreviewRunCollectorOptions) {
        this.#emitAutomationEvent = options?.emitAutomationEvent;
    }

    public recordSuccess(args: { group: PreviewGroup; result: SdkPreviewSuccess; pushDiffEnabled: boolean }): void {
        this.#results.push({
            groupName: args.group.groupName,
            apiName: args.group.apiName,
            status: "success",
            org: args.result.org,
            previews: args.result.previews
        });
        const hasDiffUrl = args.result.previews.some((preview) => preview.diff_url != null);
        this.emitIfPresent({
            event: AUTOMATION_EVENT_NAMES.PREVIEW_GROUP_COMPLETED,
            attributes: previewGroupCompletedAttributes({
                groupName: args.group.groupName,
                apiName: args.group.apiName ?? undefined,
                generatorName: args.group.generator,
                previewCount: args.result.previews.length,
                pushDiffEnabled: args.pushDiffEnabled,
                hasDiffUrl
            })
        });
    }

    public recordFailure(args: {
        group: PreviewGroup;
        message: string;
        code?: Parameters<typeof resolveErrorCode>[1];
        failureSource?: GeneratorFailureSource;
        error?: unknown;
    }): void {
        this.#results.push({
            groupName: args.group.groupName,
            apiName: args.group.apiName,
            status: "error",
            error: args.message
        });
        const failureSource = args.failureSource ?? "cli";
        this.emitIfPresent(
            {
                event: AUTOMATION_EVENT_NAMES.PREVIEW_GROUP_FAILED,
                errorCode: resolveErrorCode(args.error, args.code),
                attributes: previewGroupFailedAttributes({
                    groupName: args.group.groupName,
                    apiName: args.group.apiName ?? undefined,
                    generatorName: args.group.generator,
                    errorMessage: args.message,
                    failureSource
                })
            },
            failureSource === "cli" && args.error instanceof Error ? { error: args.error } : undefined
        );
    }

    public results(): readonly PreviewGroupRunResult[] {
        return this.#results;
    }

    public hasFailures(): boolean {
        return this.#results.some((result) => result.status === "error");
    }

    public counts(): PreviewRunCounts {
        return countPreviewResults(this.#results);
    }

    private emitIfPresent(event: AutomationTelemetryEvent, options?: AutomationTelemetryEmitOptions): void {
        if (!isAutomationMode() || this.#emitAutomationEvent == null) {
            return;
        }
        this.#emitAutomationEvent(event, options);
    }
}
