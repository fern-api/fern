import { OpenAPISpec } from "@fern-api/api-workspace-commons";
import { OSSWorkspace } from "@fern-api/lazy-fern-workspace";
import { TaskContext } from "@fern-api/task-context";

import { ValidationViolation } from "@fern-api/validation-utils";

export interface Rule {
    name: string;
    run: (context: RuleContext) => Promise<ValidationViolation[]>;
}

export interface RuleContext {
    workspace: OSSWorkspace;
    specs: OpenAPISpec[];
    context: TaskContext;
}
