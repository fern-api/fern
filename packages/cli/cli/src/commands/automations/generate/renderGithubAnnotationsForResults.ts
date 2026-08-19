import { renderGithubAnnotation, shouldEmitGithubAnnotations } from "@fern-api/cli-logger";

import { GeneratorRunResult } from "./GeneratorRunResult.js";

/**
 * GitHub Actions caps annotations at 10 per level per step (error and warning are independent
 * caps, as is notice though we don't emit those). When more than 10 generators fail in one run
 * the overflow is silently dropped — a reviewer reading the PR sees ten red markers and assumes
 * that's all of them.
 *
 * We can't lift the cap (it's the runner's), but we can emit a single trailing `::warning::` that
 * tells the reader exactly how many failures didn't make it onto the file view, pointing them at
 * the step-summary table for the full picture. The warning consumes one of the 10 *warning* slots
 * (separate from the error cap), and the CLI rarely emits warnings, so this is essentially free.
 *
 * If GitHub raises the cap in the future, this constant is the single place to update.
 */
const GITHUB_ACTIONS_ANNOTATIONS_PER_LEVEL_CAP = 10;

/**
 * Builds GitHub Actions error-annotation workflow commands for every failed generator in a run.
 * Each annotation is anchored on the generator's line in `generators.yml` (when resolvable) so it
 * appears inline on the file in the PR's "Files changed" tab — exactly where a reviewer would
 * change the version pin or remove the failing generator.
 *
 * Title format: `<generator> failed (group=<group>, api=<api>)`. Explicit `key=value` labels
 * disambiguate the title whenever a name contains a `/` (generator names like
 * `fernapi/fern-python-sdk` are common) and match the vocabulary of the step-summary table.
 *
 * When the failure count exceeds the runner's per-step annotation cap (see
 * {@link GITHUB_ACTIONS_ANNOTATIONS_PER_LEVEL_CAP}), we still emit one error annotation per
 * failure (GHA drops the overflow itself) and append a trailing warning explaining how many
 * failures didn't make it into the panel.
 *
 * Callers should guard with `shouldEmitGithubAnnotations()` to skip the render entirely off-CI.
 */
export function renderGithubAnnotationsForResults(results: readonly GeneratorRunResult[]): string {
    if (!shouldEmitGithubAnnotations()) {
        return "";
    }
    const lines: string[] = [];
    let failureCount = 0;
    for (const result of results) {
        if (result.status !== "failed") {
            continue;
        }
        failureCount++;
        const annotation = renderAnnotationForFailure(result);
        if (annotation != null) {
            lines.push(annotation);
        }
    }
    const overflow = renderOverflowWarning(failureCount);
    if (overflow != null) {
        lines.push(overflow);
    }
    return lines.join("");
}

function renderAnnotationForFailure(result: GeneratorRunResult): string | undefined {
    const body = result.errorMessage ?? "Generator failed";
    const title = buildTitle(result);
    const file = result.generatorsYmlWorkspaceRelativePath ?? undefined;
    // GHA renders `line=` without `file=` against the workflow file itself (or nothing) — drop
    // the line number when we have nothing to anchor it to so the annotation lands on the PR
    // generally rather than on a misleading location.
    const line = file != null ? (result.generatorsYmlLineNumber ?? undefined) : undefined;
    return renderGithubAnnotation("error", body, { title, file, line });
}

function buildTitle(result: GeneratorRunResult): string {
    const qualifiers: string[] = [`group=${result.groupName}`];
    if (result.apiName != null && result.apiName.length > 0) {
        qualifiers.push(`api=${result.apiName}`);
    }
    return `${result.generatorName} failed (${qualifiers.join(", ")})`;
}

function renderOverflowWarning(failureCount: number): string | undefined {
    if (failureCount <= GITHUB_ACTIONS_ANNOTATIONS_PER_LEVEL_CAP) {
        return undefined;
    }
    const suppressed = failureCount - GITHUB_ACTIONS_ANNOTATIONS_PER_LEVEL_CAP;
    const body =
        `${suppressed} additional generator ${suppressed === 1 ? "failure was" : "failures were"} hidden by ` +
        `GitHub's per-step annotation cap. See the step summary table for the full list.`;
    return renderGithubAnnotation("warning", body, {
        title: `${failureCount} generators failed (showing first ${GITHUB_ACTIONS_ANNOTATIONS_PER_LEVEL_CAP})`
    });
}
