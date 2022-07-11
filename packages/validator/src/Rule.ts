import { RelativeFilePath, Workspace } from "@fern-api/workspace-parser";
import { FernConfigurationSchema } from "@fern-api/yaml-schema";
import { FernAstNodeTypes } from "./ast/AstVisitor";

export interface Rule {
    name: string;
    create: (context: RuleContext) => RuleRunner;
}

export interface RuleContext {
    workspace: Workspace;
    relativeFilePath: RelativeFilePath;
    contents: FernConfigurationSchema;
}

export type RuleRunner = {
    [K in keyof FernAstNodeTypes]?: (node: FernAstNodeTypes[K]) => RuleViolation[];
};

export interface RuleViolation {
    severity: "warning" | "error";
    message: string;
}
