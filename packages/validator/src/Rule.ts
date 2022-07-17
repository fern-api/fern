import { RelativeFilePath, Workspace } from "@fern-api/workspace-parser";
import { FernAstNodeTypes, FernConfigurationSchema } from "@fern-api/yaml-schema";

export interface Rule {
    name: string;
    create: (context: RuleContext) => RuleRunner;
}

export interface RuleContext {
    workspace: Workspace;
}

export type RuleRunner = {
    [K in keyof FernAstNodeTypes]?: (node: FernAstNodeTypes[K], args: RuleRunnerArgs) => RuleViolation[];
};

export interface RuleRunnerArgs {
    absoluteFilePath: string;
    relativeFilePath: RelativeFilePath;
    contents: FernConfigurationSchema;
}
export interface RuleViolation {
    severity: "warning" | "error";
    message: string;
}
