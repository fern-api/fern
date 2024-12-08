import { generatorsYml } from "@fern-api/configuration-loader";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { Logger } from "@fern-api/logger";
import { FernWorkspace } from "@fern-api/api-workspace-commons";
import {
    GeneratorsYmlFileAstNodeTypes,
    PackageMarkerAstNodeTypes,
    RootApiFileAstNodeTypes,
    DefinitionFileAstNodeTypes
} from "./ast";
import { DefinitionFileSchema, PackageMarkerFileSchema, RootApiFileSchema } from "@fern-api/fern-definition-schema";

export interface Rule {
    name: string;
    DISABLE_RULE?: boolean;
    create: (context: RuleContext) => RuleVisitors;
}

export interface RuleContext {
    workspace: FernWorkspace;
    logger: Logger;
}

export interface RuleVisitors {
    rootApiFile?: RuleVisitor<RootApiFileAstNodeTypes, RootApiFileSchema>;
    definitionFile?: RuleVisitor<DefinitionFileAstNodeTypes, DefinitionFileSchema>;
    packageMarker?: RuleVisitor<PackageMarkerAstNodeTypes, PackageMarkerFileSchema>;
    generatorsYml?: RuleVisitor<GeneratorsYmlFileAstNodeTypes, generatorsYml.GeneratorsConfigurationSchema>;
}

export type RuleVisitor<AstNodeTypes, FileSchema> = {
    [K in keyof AstNodeTypes]?: (
        node: AstNodeTypes[K],
        args: RuleRunnerArgs<FileSchema>
    ) => RuleViolation[];
};

export interface RuleRunnerArgs<FileSchema> {
    relativeFilepath: RelativeFilePath;
    contents: FileSchema;
}

export interface RuleViolation {
    severity: "warning" | "error";
    message: string;
}
