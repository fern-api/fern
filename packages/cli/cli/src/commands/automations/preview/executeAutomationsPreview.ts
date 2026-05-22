import { CliContext } from "../../../cli-context/CliContext.js";
import { loadProjectAndRegisterWorkspacesWithContext } from "../../../cliCommons.js";
import { previewRunAttributes } from "../../../telemetry/automationTelemetryAttributes.js";
import { isAutomationMode } from "../../../telemetry/automationTelemetryContext.js";
import { AUTOMATION_EVENT_NAMES } from "../../../telemetry/automationTelemetryEvent.js";
import { sdkPreview } from "../../sdk-preview/sdkPreview.js";
import { listPreviewGroups } from "../listPreviewGroups.js";
import { countPreviewResults, PreviewRunCollector } from "./PreviewRunResult.js";

export interface AutomationsPreviewOptions {
    group: string | undefined;
    json: boolean;
    pushDiff: boolean;
}

/**
 * Top-level runner for `fern automations preview`. Manages the collector,
 * stdout/JSON reporting, and exit code. Kept as a module-level function so
 * the yargs handler stays tiny and the orchestration is testable.
 */
export async function executeAutomationsPreview({
    cliContext,
    options
}: {
    cliContext: CliContext;
    options: AutomationsPreviewOptions;
}): Promise<void> {
    const collector = new PreviewRunCollector({
        emitAutomationEvent: (event, emitOptions) => cliContext.emitAutomationTelemetryEvent(event, emitOptions)
    });

    try {
        if (isAutomationMode()) {
            cliContext.emitAutomationTelemetryEvent({
                event: AUTOMATION_EVENT_NAMES.PREVIEW_STARTED
            });
        }

        const project = await loadProjectAndRegisterWorkspacesWithContext(cliContext, {
            commandLineApiWorkspace: undefined,
            defaultToAllApiWorkspaces: true
        });

        const groups = listPreviewGroups({
            workspaces: project.apiWorkspaces,
            groupFilter: options.group
        });

        if (groups.length === 0) {
            if (options.json) {
                process.stdout.write(JSON.stringify({ results: [] }, null, 2) + "\n");
            } else {
                cliContext.logger.info("No eligible generator groups found for preview.");
            }
            return;
        }

        cliContext.logger.info(
            `Found ${groups.length} previewable group(s): ${groups.map((group) => group.groupName).join(", ")}`
        );

        for (const group of groups) {
            const apiLabel = group.apiName != null ? ` (api: ${group.apiName})` : "";
            cliContext.logger.info(`Running preview for ${group.groupName}${apiLabel}...`);

            try {
                const result = await sdkPreview({
                    cliContext,
                    groupName: group.groupName,
                    generatorFilter: undefined,
                    apiName: group.apiName ?? undefined,
                    output: undefined,
                    local: false,
                    pushDiff: options.pushDiff
                });

                if (result.status === "success") {
                    collector.recordSuccess({
                        group,
                        result,
                        pushDiffEnabled: options.pushDiff
                    });
                } else {
                    collector.recordFailure({
                        group,
                        message: result.message,
                        code: result.code,
                        failureSource: result.failureSource
                    });
                }
            } catch (error) {
                const message = error instanceof Error ? error.message : String(error);
                cliContext.logger.warn(`Preview failed for group '${group.groupName}': ${message}`);
                collector.recordFailure({
                    group,
                    message,
                    failureSource: "cli",
                    error
                });
            }
        }

        reportResults({ cliContext, collector, json: options.json });
    } finally {
        if (isAutomationMode()) {
            cliContext.emitAutomationTelemetryEvent({
                event: AUTOMATION_EVENT_NAMES.PREVIEW_COMPLETED,
                attributes: previewRunAttributes(countPreviewResults(collector.results()))
            });
        }
        if (collector.hasFailures()) {
            process.exitCode = 1;
        }
    }
}

function reportResults({
    cliContext,
    collector,
    json
}: {
    cliContext: CliContext;
    collector: PreviewRunCollector;
    json: boolean;
}): void {
    const results = collector.results();

    if (json) {
        process.stdout.write(JSON.stringify({ results }, null, 2) + "\n");
        return;
    }

    for (const groupResult of results) {
        if (groupResult.status === "success" && groupResult.previews != null) {
            for (const preview of groupResult.previews) {
                if (preview.install) {
                    cliContext.logger.info(`${groupResult.groupName}: ${preview.install}`);
                }
            }
        } else if (groupResult.status === "error") {
            cliContext.logger.warn(`${groupResult.groupName}: ${groupResult.error}`);
        }
    }
}
