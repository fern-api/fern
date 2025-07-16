import { OSSWorkspace } from "@fern-api/lazy-fern-workspace"
import { getAllOpenAPISpecs } from "@fern-api/lazy-fern-workspace"
import { TaskContext } from "@fern-api/task-context"

import { Rule } from "./Rule"
import { ValidationViolation } from "./ValidationViolation"
import { getAllRules } from "./getAllRules"

export async function validateOSSWorkspace(
    workspace: OSSWorkspace,
    context: TaskContext
): Promise<ValidationViolation[]> {
    return await runRulesOnOSSWorkspace({ workspace, context, rules: getAllRules() })
}

export async function runRulesOnOSSWorkspace({
    workspace,
    context,
    rules
}: {
    workspace: OSSWorkspace
    context: TaskContext
    rules: Rule[]
}): Promise<ValidationViolation[]> {
    const openApiSpecs = await getAllOpenAPISpecs({ context, specs: workspace.specs })
    const ruleResults = await Promise.all(rules.map((rule) => rule.run({ workspace, specs: openApiSpecs, context })))
    return ruleResults.flat()
}
