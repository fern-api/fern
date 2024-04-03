import { generatorsYml } from "@fern-api/configuration";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { Logger } from "@fern-api/logger";
import { FernWorkspace } from "@fern-api/workspace-loader";
import {
    DefinitionFileAstNodeTypes,
    DefinitionFileSchema,
    GeneratorsYmlFileAstNodeTypes,
    PackageMarkerAstNodeTypes,
    PackageMarkerFileSchema,
    RootApiFileAstNodeTypes,
    RootApiFileSchema
} from "@fern-api/yaml-schema";

export interface Rule {
    name: string;
    DISABLE_RULE?: boolean;
    create: (context: RuleContext) => MaybePromise<RuleVisitors>;
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
    ) => MaybePromise<RuleViolation[]>;
};

export interface RuleRunnerArgs<FileSchema> {
    relativeFilepath: RelativeFilePath;
    contents: FileSchema;
}

export interface RuleViolation {
    severity: "warning" | "error";
    message: string;
}

export type MaybePromise<T> = T | Promise<T>;
