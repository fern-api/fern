import { Logger } from "@fern-api/logger";
import { AbstractAPIWorkspace, DocsWorkspace } from "@fern-api/workspace-loader";

import { DocsConfigFileAstNodeTypes } from "./docsAst/DocsConfigFileAstVisitor";

export interface Rule {
    name: string;
    create: (context: RuleContext) => MaybePromise<RuleVisitor<DocsConfigFileAstNodeTypes>>;
}

export type RuleVisitor<AstNodeTypes> = {
    [K in keyof AstNodeTypes]?: (node: AstNodeTypes[K]) => MaybePromise<RuleViolation[]>;
};

export interface RuleContext {
    workspace: DocsWorkspace;
    loadApiWorkspace: (id?: string) => AbstractAPIWorkspace<unknown> | undefined;
    logger: Logger;
}

export interface RuleViolation {
    severity: "warning" | "error";
    message: string;
}

export type MaybePromise<T> = T | Promise<T>;
