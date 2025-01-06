import { FernWorkspace } from "@fern-api/api-workspace-commons";
import { generatorsYml } from "@fern-api/configuration-loader";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { Logger } from "@fern-api/logger";

import { GeneratorsYmlFileAstNodeTypes } from "./ast/GeneratorsYmlAstVisitor";

export interface Rule {
    name: string;
    DISABLE_RULE?: boolean;
    create: (context: RuleContext) => Promise<RuleVisitors>;
}

export interface RuleContext {
    workspace: FernWorkspace;
    logger: Logger;
}

export interface RuleVisitors {
    generatorsYml?: RuleVisitor<GeneratorsYmlFileAstNodeTypes, generatorsYml.GeneratorsConfigurationSchema>;
}

export type RuleVisitor<AstNodeTypes, FileSchema> = {
    [K in keyof AstNodeTypes]?: (node: AstNodeTypes[K], args: RuleRunnerArgs<FileSchema>) => Promise<RuleViolation[]>;
};

export interface RuleRunnerArgs<FileSchema> {
    relativeFilepath: RelativeFilePath;
    contents: FileSchema;
}

export interface RuleViolation {
    severity: "warning" | "error";
    message: string;
}
