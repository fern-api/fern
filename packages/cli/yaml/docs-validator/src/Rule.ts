import { docsYml } from "@fern-api/configuration";
import { Logger } from "@fern-api/logger";
import { DocsWorkspace } from "@fern-api/workspace-loader";

export interface Rule {
    name: string;
    create: (context: RuleContext) => MaybePromise<RuleVisitor<docsYml.RawSchemas.Visitors.DocsConfigFileAstNodeTypes>>;
}

export type RuleVisitor<AstNodeTypes> = {
    [K in keyof AstNodeTypes]?: (node: AstNodeTypes[K]) => MaybePromise<RuleViolation[]>;
};

export interface RuleContext {
    workspace: DocsWorkspace;
    logger: Logger;
}

export interface RuleViolation {
    severity: "warning" | "error";
    message: string;
}

export type MaybePromise<T> = T | Promise<T>;
