import { RelativeFilePath } from "@fern-api/core-utils";
import { Logger } from "@fern-api/logger";
import { Workspace } from "@fern-api/workspace-loader";
import { FernRootApiFileAstNodeTypes, FernServiceFileAstNodeTypes, ServiceFileSchema } from "@fern-api/yaml-schema";

export interface Rule {
    name: string;
    disabled?: boolean;
    create: (context: RuleContext) => MaybePromise<RuleVisitors>;
}

export interface RuleContext {
    workspace: Workspace;
    logger: Logger;
}

export interface RuleVisitors {
    rootApiFile?: RuleVisitor<FernRootApiFileAstNodeTypes>;
    serviceFile?: RuleVisitor<FernServiceFileAstNodeTypes>;
}

export type RuleVisitor<AstNodeTypes> = {
    [K in keyof AstNodeTypes]?: (node: AstNodeTypes[K], args: RuleRunnerArgs) => MaybePromise<RuleViolation[]>;
};

export interface RuleRunnerArgs {
    relativeFilepath: RelativeFilePath;
    contents: ServiceFileSchema;
}
export interface RuleViolation {
    severity: "warning" | "error";
    message: string;
}

export type MaybePromise<T> = T | Promise<T>;
