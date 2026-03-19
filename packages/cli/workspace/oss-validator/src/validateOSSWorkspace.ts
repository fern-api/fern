import { OSSWorkspace } from "@fern-api/lazy-fern-workspace";
import { TaskContext } from "@fern-api/task-context";
import { getAllRules } from "./getAllRules.js";
import { Rule } from "./Rule.js";
import { ValidationViolation } from "./ValidationViolation.js";

export async function validateOSSWorkspace(
    workspace: OSSWorkspace,
    context: TaskContext
): Promise<ValidationViolation[]> {
    return await runRulesOnOSSWorkspace({ workspace, context, rules: getAllRules() });
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
    const ruleResults = await Promise.all(
        rules.map(async (rule) => {
            const violations = await rule.run({ workspace, specs: openApiSpecs, context });
            return violations.map((violation) => ({ ...violation, name: violation.name ?? rule.name }));
        })
    );
    return ruleResults.flat();
}
