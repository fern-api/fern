import { OpenAPISpec } from "@fern-api/api-workspace-commons";
import { OSSWorkspace, UnresolvedRefProblem } from "@fern-api/lazy-fern-workspace";
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
    /**
     * The `$ref`s that could not be resolved while loading each spec, keyed by spec absolute
     * filepath. Reported by Redocly's bundler, which leaves unresolved `$ref`s in the document.
     */
    unresolvedRefs: Map<string, UnresolvedRefProblem[]>;
}
