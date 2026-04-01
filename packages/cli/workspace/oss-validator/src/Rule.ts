import { OpenAPISpec } from "@fern-api/api-workspace-commons";
import { OSSWorkspace } from "@fern-api/lazy-fern-workspace";
import { TaskContext } from "@fern-api/task-context";
import { OpenAPI } from "openapi-types";

import { ValidationViolation } from "./ValidationViolation.js";

export interface Rule {
    name: string;
    run: (context: RuleContext) => Promise<ValidationViolation[]>;
}

export interface RuleContext {
    workspace: OSSWorkspace;
    specs: OpenAPISpec[];
    context: TaskContext;
    /**
     * Pre-loaded OpenAPI documents keyed by spec absolute filepath.
     * Rules should use this instead of calling loadOpenAPI() directly
     * to avoid redundant parsing and overlay application.
     */
    loadedDocuments: Map<string, OpenAPI.Document>;
}
