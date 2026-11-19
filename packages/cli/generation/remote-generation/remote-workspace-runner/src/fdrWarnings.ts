import type { TaskContext } from "@fern-api/task-context";

import { formatCustomDomainRoutingNotice, isCustomDomainRoutingWarning } from "./customDomainRoutingNotice.js";

/**
 * Prints the optional `warnings` FDR returns from docs registration (e.g. a
 * custom domain that is not routed through Fern). Read off the raw response so
 * it works whether or not the pinned FDR SDK types the field yet.
 */
export function logFdrWarnings(response: unknown, context: TaskContext): void {
    if (response == null || typeof response !== "object" || !("warnings" in response)) {
        return;
    }
    const { warnings } = response;
    if (!Array.isArray(warnings)) {
        return;
    }
    for (const warning of warnings) {
        if (typeof warning === "string" && warning.trim() !== "") {
            context.logger.warn(
                isCustomDomainRoutingWarning(warning) ? formatCustomDomainRoutingNotice(warning, "warning") : warning
            );
        }
    }
}
