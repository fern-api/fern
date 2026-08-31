import { OpenAPISpec } from "@fern-api/api-workspace-commons";
import { loadOpenAPI, OSSWorkspace, UnresolvedRefProblem } from "@fern-api/lazy-fern-workspace";
import { TaskContext } from "@fern-api/task-context";
import { readFile } from "fs/promises";
import { OpenAPI } from "openapi-types";
import { getAllRules } from "./getAllRules.js";
import { Rule } from "./Rule.js";
import { ValidationViolation } from "./ValidationViolation.js";

export async function validateOSSWorkspace(
    workspace: OSSWorkspace,
    context: TaskContext
): Promise<ValidationViolation[]> {
    return await runRulesOnOSSWorkspace({ workspace, context, rules: getAllRules() });
}

/**
 * Pre-loads all OpenAPI documents once so that validation rules can share
 * the parsed results instead of each rule calling loadOpenAPI() independently.
 */
async function preloadOpenAPIDocuments({ specs, context }: { specs: OpenAPISpec[]; context: TaskContext }): Promise<{
    loadedDocuments: Map<string, OpenAPI.Document>;
    unresolvedRefs: Map<string, UnresolvedRefProblem[]>;
}> {
    const loadedDocuments = new Map<string, OpenAPI.Document>();
    const unresolvedRefs = new Map<string, UnresolvedRefProblem[]>();

    for (const spec of specs) {
        const contents = (await readFile(spec.absoluteFilepath)).toString();
        if (!contents.includes("openapi") && !contents.includes("swagger")) {
            continue;
        }

        const document = await loadOpenAPI({
            absolutePathToOpenAPI: spec.absoluteFilepath,
            context,
            absolutePathToOpenAPIOverrides: spec.absoluteFilepathToOverrides,
            absolutePathToOpenAPIOverlays: spec.absoluteFilepathToOverlays,
            onUnresolvedRefs: (problems) => {
                unresolvedRefs.set(spec.absoluteFilepath, problems);
            }
        });

        loadedDocuments.set(spec.absoluteFilepath, document);
    }

    return { loadedDocuments, unresolvedRefs };
}

export async function runRulesOnOSSWorkspace({
    workspace,
    context,
    rules
}: {
    workspace: OSSWorkspace;
    context: TaskContext;
    rules: Rule[];
}): Promise<ValidationViolation[]> {
    const openApiSpecs = await workspace.getOpenAPISpecsCached({ context });

    // Pre-load all OpenAPI documents once to avoid redundant parsing and overlay application
    const { loadedDocuments, unresolvedRefs } = await preloadOpenAPIDocuments({ specs: openApiSpecs, context });

    const ruleResults = await Promise.all(
        rules.map(async (rule) => {
            const violations = await rule.run({
                workspace,
                specs: openApiSpecs,
                context,
                loadedDocuments,
                unresolvedRefs
            });
            return violations.map((violation) => ({ ...violation, name: violation.name ?? rule.name }));
        })
    );
    return ruleResults.flat();
}
