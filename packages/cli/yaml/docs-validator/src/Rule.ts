import { RelativeFilePath } from "@fern-api/fs-utils";
import { OSSWorkspace } from "@fern-api/lazy-fern-workspace";
import { Logger } from "@fern-api/logger";
import { AbstractAPIWorkspace, DocsWorkspace, FernWorkspace } from "@fern-api/workspace-loader";

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
    apiWorkspaces: AbstractAPIWorkspace<unknown>[];
    ossWorkspaces: OSSWorkspace[];
    logger: Logger;
}

export interface RuleViolation {
    name?: string;
    severity: "fatal" | "error" | "warning";
    message: string;
    relativeFilepath?: RelativeFilePath;
}

export type MaybePromise<T> = T | Promise<T>;
