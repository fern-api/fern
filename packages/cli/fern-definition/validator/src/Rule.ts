import { FernWorkspace } from "@fern-api/api-workspace-commons";
import { DefinitionFileSchema, PackageMarkerFileSchema, RootApiFileSchema } from "@fern-api/fern-definition-schema";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { Logger } from "@fern-api/logger";
import { OpenAPIV3_1 } from "openapi-types";
import { OpenApiValidationOptions } from "./types";

import { DefinitionFileAstNodeTypes, PackageMarkerAstNodeTypes, RootApiFileAstNodeTypes } from "./ast";

export interface Rule {
    name: string;
    description?: string;
    DISABLE_RULE?: boolean;
    create?: (context: FernRuleContext) => RuleVisitors;
    validate?: (context: OpenApiRuleContext) => OpenApiRuleViolation[];
}

export interface FernRuleContext {
    workspace: FernWorkspace;
    logger: Logger;
}

export interface OpenApiRuleContext {
    document: OpenAPIV3_1.Document;
    logger: Logger;
    options: OpenApiValidationOptions;
}

export type RuleContext = FernRuleContext | OpenApiRuleContext;

export interface RuleVisitors {
    rootApiFile?: RuleVisitor<RootApiFileAstNodeTypes, RootApiFileSchema>;
    definitionFile?: RuleVisitor<DefinitionFileAstNodeTypes, DefinitionFileSchema>;
    packageMarker?: RuleVisitor<PackageMarkerAstNodeTypes, PackageMarkerFileSchema>;
}

export type RuleVisitor<AstNodeTypes, FileSchema> = {
    [K in keyof AstNodeTypes]?: (node: AstNodeTypes[K], args: RuleRunnerArgs<FileSchema>) => RuleViolation[];
};

export interface RuleRunnerArgs<FileSchema> {
    relativeFilepath: RelativeFilePath;
    contents: FileSchema;
}

export interface RuleViolation {
    severity: "fatal" | "error" | "warning";
    message: string;
}

export interface OpenApiRuleViolation {
    severity: "fatal" | "error" | "warning";
    message: string;
    path?: string;
}
