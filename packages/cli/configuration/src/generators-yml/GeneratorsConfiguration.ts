import { Values } from "@fern-api/core-utils";
import { RawSchemas } from "@fern-api/fern-definition-schema";
import { AbsoluteFilePath } from "@fern-api/path-utils";

import { FernFiddle } from "@fern-fern/fiddle-sdk";

import { generatorsYml } from "..";
import { Audiences } from "../commons";
import {
    ApiDefinitionSettingsSchema,
    GeneratorInvocationSchema,
    GeneratorsConfigurationSchema,
    OpenApiFilterSchema,
    ReadmeSchema
} from "./schemas";

export interface GeneratorsConfiguration {
    api?: APIDefinition;
    defaultGroup: string | undefined;
    reviewers: Reviewers | undefined;
    groups: GeneratorGroup[];
    whitelabel: FernFiddle.WhitelabelConfig | undefined;

    rawConfiguration: GeneratorsConfigurationSchema;
    absolutePathToConfiguration: AbsoluteFilePath;
}

export type APIDefinition = SingleNamespaceAPIDefinition | MultiNamespaceAPIDefinition | ConjureAPIDefinition;

export interface SingleNamespaceAPIDefinition
    extends RawSchemas.WithEnvironmentsSchema,
        RawSchemas.WithAuthSchema,
        RawSchemas.WithHeadersSchema {
    type: "singleNamespace";
    definitions: APIDefinitionLocation[];
}

export interface MultiNamespaceAPIDefinition
    extends RawSchemas.WithEnvironmentsSchema,
        RawSchemas.WithAuthSchema,
        RawSchemas.WithHeadersSchema {
    type: "multiNamespace";
    rootDefinitions: APIDefinitionLocation[] | undefined;
    definitions: Record<string, APIDefinitionLocation[]>;
}

export interface ConjureAPIDefinition
    extends RawSchemas.WithEnvironmentsSchema,
        RawSchemas.WithAuthSchema,
        RawSchemas.WithHeadersSchema {
    type: "conjure";
    pathToConjureDefinition: string;
}

export interface APIDefinitionSettings {
    shouldUseTitleAsName: boolean | undefined;
    shouldUseUndiscriminatedUnionsWithLiterals: boolean | undefined;
    shouldUseIdiomaticRequestNames: boolean | undefined;
    asyncApiMessageNaming: "v1" | "v2" | undefined;
    shouldUseOptionalAdditionalProperties: boolean | undefined;
    coerceEnumsToLiterals: boolean | undefined;
    objectQueryParameters: boolean | undefined;
    respectReadonlySchemas: boolean | undefined;
    respectNullableSchemas: boolean | undefined;
    onlyIncludeReferencedSchemas: boolean | undefined;
    inlinePathParameters: boolean | undefined;
    useBytesForBinaryResponse: boolean | undefined;
    respectForwardCompatibleEnums: boolean | undefined;
    filter: OpenApiFilterSchema | undefined;
    defaultFormParameterEncoding: "form" | "json" | undefined;
    exampleGeneration: generatorsYml.OpenApiExampleGenerationSchema | undefined;
    additionalPropertiesDefaultsTo: boolean | undefined;
    typeDatesAsStrings: boolean | undefined;
    preserveSingleSchemaOneOf: boolean | undefined;
    inlineAllOfSchemas: boolean | undefined;
    resolveAliases: generatorsYml.ResolveAliases | undefined;
    groupMultiApiEnvironments: boolean | undefined;
    groupEnvironmentsByHost: boolean | undefined;
    wrapReferencesToNullableInOptional: boolean | undefined;
    coerceOptionalSchemasToNullable: boolean | undefined;
}

export interface APIDefinitionLocation {
    schema: APIDefinitionSchema;
    origin: string | undefined;
    overrides: string | undefined;
    audiences: string[] | undefined;
    settings: APIDefinitionSettings | undefined;
}

export type APIDefinitionSchema = ProtoAPIDefinitionSchema | OSSAPIDefinitionSchema | OpenRPCDefinitionSchema;

export interface ProtoAPIDefinitionSchema {
    type: "protobuf";
    root: string;
    target: string;
    localGeneration: boolean;
    fromOpenAPI: boolean;
    dependencies: string[];
}

export interface OSSAPIDefinitionSchema {
    type: "oss";
    path: string;
}

export interface OpenRPCDefinitionSchema {
    type: "openrpc";
    path: string;
}

export interface GeneratorGroup {
    groupName: string;
    audiences: Audiences;
    generators: GeneratorInvocation[];
    reviewers: Reviewers | undefined;
}

export interface Reviewer {
    name: string;
}

export interface Reviewers {
    teams?: Reviewer[] | undefined;
    users?: Reviewer[] | undefined;
}

export interface GeneratorInvocation {
    raw?: GeneratorInvocationSchema;

    name: string;
    irVersionOverride: string | undefined;
    version: string;
    config: unknown;
    // Note this also includes a reviewers block for PR mode, it's from fiddle
    // and the same schema
    outputMode: FernFiddle.remoteGen.OutputMode;
    absolutePathToLocalOutput: AbsoluteFilePath | undefined;
    absolutePathToLocalSnippets: AbsoluteFilePath | undefined;
    keywords: string[] | undefined;
    smartCasing: boolean;
    disableExamples: boolean;
    language: GenerationLanguage | undefined;
    publishMetadata: FernFiddle.remoteGen.PublishingMetadata | undefined;
    readme: ReadmeSchema | undefined;
    settings: ApiDefinitionSettingsSchema | undefined;
}

export const GenerationLanguage = {
    TYPESCRIPT: "typescript",
    JAVA: "java",
    PYTHON: "python",
    GO: "go",
    RUBY: "ruby",
    CSHARP: "csharp",
    SWIFT: "swift",
    PHP: "php",
    RUST: "rust"
} as const;

export type GenerationLanguage = Values<typeof GenerationLanguage>;

export function getPackageName({
    generatorInvocation
}: {
    generatorInvocation: GeneratorInvocation;
}): string | undefined {
    if (generatorInvocation.language === "go") {
        return getGoPackageName(generatorInvocation);
    }
    
    const outputMode = generatorInvocation.outputMode;
    switch (outputMode.type) {
        case "github": {
            const publishInfo = outputMode.publishInfo;
            if (publishInfo == null) {
                return undefined;
            }
            switch (publishInfo.type) {
                case "maven":
                    return publishInfo.coordinate;
                case "npm":
                    return publishInfo.packageName;
                case "pypi":
                    return publishInfo.packageName;
                case "rubygems":
                    return publishInfo.packageName;
                case "nuget":
                    return publishInfo.packageName;
                case "crates":
                    return publishInfo.packageName;
                case "postman":
                default:
                    return undefined;
            }
        }
        case "githubV2":
            return undefined;
        case "downloadFiles":
        case "publish":
        case "publishV2":
        default:
            return undefined;
    }
}

/**
 * Go doesn't use a central package manager; the Go Module Proxy simply uses the name
 * of the GitHub repository.
 */
function getGoPackageName(generatorInvocation: GeneratorInvocation): string | undefined {
    const outputMode = generatorInvocation.outputMode;
    switch (outputMode.type) {
        case "github":
            return `github.com/${outputMode.owner}/${outputMode.repo}`;
        case "githubV2":
            return "owner" in outputMode && "repo" in outputMode
                ? `github.com/${outputMode.owner}/${outputMode.repo}`
                : undefined;
        case "downloadFiles":
        case "publish":
        case "publishV2":
        default:
            return undefined;
    }
}
