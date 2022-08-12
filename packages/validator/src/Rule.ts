import { RelativeFilePath } from "@fern-api/config-management-commons";
import { Workspace } from "@fern-api/workspace-loader";
import { FernAstNodeTypes, ServiceFileSchema } from "@fern-api/yaml-schema";

export interface Rule {
    name: string;
    create: (context: RuleContext) => MaybePromise<RuleRunner>;
}

export interface RuleContext {
    workspace: Workspace;
}

export type RuleRunner = {
    [K in keyof FernAstNodeTypes]?: (node: FernAstNodeTypes[K], args: RuleRunnerArgs) => MaybePromise<RuleViolation[]>;
};

export interface RuleRunnerArgs {
    relativeFilePath: RelativeFilePath;
    contents: ServiceFileSchema;
}
export interface RuleViolation {
    severity: "warning" | "error";
    message: string;
}

export type MaybePromise<T> = T | Promise<T>;
