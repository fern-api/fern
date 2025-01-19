import { OSSWorkspace } from "@fern-api/lazy-fern-workspace";
import { Logger } from "@fern-api/logger";
import { DocsWorkspace, FernWorkspace } from "@fern-api/workspace-loader";

import { RuleViolation } from "@fern-api/validation-utils";
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
    fernWorkspaces: FernWorkspace[];
    ossWorkspaces: OSSWorkspace[];
    logger: Logger;
}

export type MaybePromise<T> = T | Promise<T>;
