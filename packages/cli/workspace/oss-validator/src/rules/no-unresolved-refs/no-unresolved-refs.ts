import { AbsoluteFilePath, relative } from "@fern-api/fs-utils";

import { Rule } from "../../Rule";
import { ValidationViolation } from "../../ValidationViolation";

const MAX_VIOLATIONS_PER_SPEC = 25;

/**
 * Reports `$ref`s that could not be resolved while loading a spec. The bundler leaves unresolved
 * `$ref`s in the document, so without this rule a dangling pointer (for example one an overlay
 * meant to create but never did) silently reaches the generators.
 *
 * These are warnings rather than errors: specs with dangling `$ref`s generate today, so failing
 * `fern check` on them would break existing pipelines.
 */
export const NoUnresolvedRefsRule: Rule = {
    name: "no-unresolved-refs",
    run: async ({ workspace, specs, unresolvedRefs, loadedDocuments }) => {
        const violations: ValidationViolation[] = [];

        for (const spec of specs) {
            if (spec.type !== "openapi") {
                continue;
            }
            const problems = unresolvedRefs.get(spec.absoluteFilepath) ?? [];
            if (problems.length === 0) {
                continue;
            }

            const relativeFilepath = relative(workspace.absoluteFilePath, spec.source.file);

            for (const problem of problems.slice(0, MAX_VIOLATIONS_PER_SPEC)) {
                const nodePath = problem.pointer != null ? pointerToNodePath(problem.pointer) : [];
                const location =
                    problem.sourceFilepath != null
                        ? relative(workspace.absoluteFilePath, AbsoluteFilePath.of(problem.sourceFilepath))
                        : relativeFilepath;
                const ref = readRefAtPointer({ document: loadedDocuments.get(spec.absoluteFilepath), nodePath });

                violations.push({
                    name: "no-unresolved-refs",
                    severity: "warning",
                    relativeFilepath,
                    nodePath,
                    message: [
                        ref != null ? `Unresolved $ref "${ref}"` : "Unresolved $ref",
                        ` in ${location}`,
                        nodePath.length > 0 ? ` at ${nodePath.join(".")}` : "",
                        `: ${problem.message}`
                    ].join("")
                });
            }

            if (problems.length > MAX_VIOLATIONS_PER_SPEC) {
                violations.push({
                    name: "no-unresolved-refs",
                    severity: "warning",
                    relativeFilepath,
                    nodePath: [],
                    message: `${problems.length - MAX_VIOLATIONS_PER_SPEC} additional $refs in this specification could not be resolved.`
                });
            }
        }

        return violations;
    }
};

function pointerToNodePath(pointer: string): string[] {
    return pointer
        .replace(/^#?\/?/, "")
        .split("/")
        .filter((segment) => segment.length > 0)
        .map((segment) => decodeURIComponent(segment).replaceAll("~1", "/").replaceAll("~0", "~"));
}

/**
 * Reads the `$ref` the bundler failed to resolve out of the bundled document, so the violation can
 * name it. Returns undefined when the reported location is inside a referenced file rather than the
 * bundled document — in that case the bundler's own message already names the missing file.
 */
function readRefAtPointer({ document, nodePath }: { document: unknown; nodePath: string[] }): string | undefined {
    let current = document;
    for (const segment of nodePath) {
        if (Array.isArray(current)) {
            current = current[Number.parseInt(segment, 10)];
            continue;
        }
        if (!isRecord(current)) {
            return undefined;
        }
        current = current[segment];
    }

    if (isRecord(current) && typeof current.$ref === "string") {
        return current.$ref;
    }
    return undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value != null && !Array.isArray(value);
}
