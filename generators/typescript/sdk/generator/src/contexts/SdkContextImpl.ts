import {
    CoreUtilitiesManager,
    DependencyManager,
    ExternalDependencies,
    ImportsManager,
    JavaScriptRuntime,
    NpmPackage,
    createExternalDependencies
} from "@fern-typescript/commons";
import { CoreUtilities } from "@fern-typescript/commons/src/core-utilities/CoreUtilities";
import {
    EnvironmentsContext,
    GenericAPISdkErrorContext,
    SdkClientClassContext,
    SdkContext,
    SdkInlinedRequestBodySchemaContext,
    TimeoutSdkErrorContext
} from "@fern-typescript/contexts";
import { EndpointErrorUnionGenerator } from "@fern-typescript/endpoint-error-union-generator";
import { EnvironmentsGenerator } from "@fern-typescript/environments-generator";
import { GenericAPISdkErrorGenerator, TimeoutSdkErrorGenerator } from "@fern-typescript/generic-sdk-error-generators";
import { RequestWrapperGenerator } from "@fern-typescript/request-wrapper-generator";
import { ErrorResolver, PackageResolver, TypeResolver } from "@fern-typescript/resolvers";
import { SdkClientClassGenerator } from "@fern-typescript/sdk-client-class-generator";
import { SdkEndpointTypeSchemasGenerator } from "@fern-typescript/sdk-endpoint-type-schemas-generator";
import { SdkErrorGenerator } from "@fern-typescript/sdk-error-generator";
import { SdkErrorSchemaGenerator } from "@fern-typescript/sdk-error-schema-generator";
import { SdkInlinedRequestBodySchemaGenerator } from "@fern-typescript/sdk-inlined-request-schema-generator";
import { TypeGenerator } from "@fern-typescript/type-generator";
import { TypeReferenceExampleGenerator } from "@fern-typescript/type-reference-example-generator";
import { TypeSchemaGenerator } from "@fern-typescript/type-schema-generator";
import { SourceFile, ts } from "ts-morph";

import { GeneratorNotificationService } from "@fern-api/base-generator";
import { Logger } from "@fern-api/logger";

import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { Constants, IntermediateRepresentation } from "@fern-fern/ir-sdk/api";

import { EndpointDeclarationReferencer } from "../declaration-referencers/EndpointDeclarationReferencer";
import { EnvironmentsDeclarationReferencer } from "../declaration-referencers/EnvironmentsDeclarationReferencer";
import { GenericAPISdkErrorDeclarationReferencer } from "../declaration-referencers/GenericAPISdkErrorDeclarationReferencer";
import { RequestWrapperDeclarationReferencer } from "../declaration-referencers/RequestWrapperDeclarationReferencer";
import { SdkClientClassDeclarationReferencer } from "../declaration-referencers/SdkClientClassDeclarationReferencer";
import { SdkErrorDeclarationReferencer } from "../declaration-referencers/SdkErrorDeclarationReferencer";
import { SdkInlinedRequestBodyDeclarationReferencer } from "../declaration-referencers/SdkInlinedRequestBodyDeclarationReferencer";
import { TimeoutSdkErrorDeclarationReferencer } from "../declaration-referencers/TimeoutSdkErrorDeclarationReferencer";
import { TypeDeclarationReferencer } from "../declaration-referencers/TypeDeclarationReferencer";
import { VersionDeclarationReferencer } from "../declaration-referencers/VersionDeclarationReferencer";
import { VersionGenerator } from "../version/VersionGenerator";
import { EndpointErrorUnionContextImpl } from "./endpoint-error-union/EndpointErrorUnionContextImpl";
import { EnvironmentsContextImpl } from "./environments/EnvironmentsContextImpl";
import { GenericAPISdkErrorContextImpl } from "./generic-api-sdk-error/GenericAPISdkErrorContextImpl";
import { RequestWrapperContextImpl } from "./request-wrapper/RequestWrapperContextImpl";
import { SdkClientClassContextImpl } from "./sdk-client-class/SdkClientClassContextImpl";
import { SdkEndpointTypeSchemasContextImpl } from "./sdk-endpoint-type-schemas/SdkEndpointTypeSchemasContextImpl";
import { SdkErrorSchemaContextImpl } from "./sdk-error-schema/SdkErrorSchemaContextImpl";
import { SdkErrorContextImpl } from "./sdk-error/SdkErrorContextImpl";
import { SdkInlinedRequestBodySchemaContextImpl } from "./sdk-inlined-request-body-schema/SdkInlinedRequestBodySchemaContextImpl";
import { TimeoutSdkErrorContextImpl } from "./timeout-sdk-error/TimeoutSdkErrorContextImpl";
import { TypeSchemaContextImpl } from "./type-schema/TypeSchemaContextImpl";
import { TypeContextImpl } from "./type/TypeContextImpl";
import { VersionContextImpl } from "./version/VersionContextImpl";

const ROOT_CLIENT_VARIABLE_NAME = "client";

export declare namespace SdkContextImpl {
    export interface Init {
        logger: Logger;
        version: string | undefined;
        ir: IntermediateRepresentation;
        config: FernGeneratorExec.GeneratorConfig;
        sourceFile: SourceFile;
        importsManager: ImportsManager;
        dependencyManager: DependencyManager;
        coreUtilitiesManager: CoreUtilitiesManager;
        fernConstants: Constants;
        intermediateRepresentation: IntermediateRepresentation;
        versionGenerator: VersionGenerator;
        versionDeclarationReferencer: VersionDeclarationReferencer;
        typeGenerator: TypeGenerator;
        typeResolver: TypeResolver;
        typeDeclarationReferencer: TypeDeclarationReferencer;
        typeSchemaDeclarationReferencer: TypeDeclarationReferencer;
        typeSchemaGenerator: TypeSchemaGenerator;
        typeReferenceExampleGenerator: TypeReferenceExampleGenerator;
        sdkErrorGenerator: SdkErrorGenerator;
        errorResolver: ErrorResolver;
        sdkErrorSchemaGenerator: SdkErrorSchemaGenerator;
        errorDeclarationReferencer: SdkErrorDeclarationReferencer;
        sdkErrorSchemaDeclarationReferencer: SdkErrorDeclarationReferencer;
        endpointErrorUnionDeclarationReferencer: EndpointDeclarationReferencer;
        sdkEndpointSchemaDeclarationReferencer: EndpointDeclarationReferencer;
        requestWrapperDeclarationReferencer: RequestWrapperDeclarationReferencer;
        requestWrapperGenerator: RequestWrapperGenerator;
        sdkInlinedRequestBodySchemaDeclarationReferencer: SdkInlinedRequestBodyDeclarationReferencer;
        sdkInlinedRequestBodySchemaGenerator: SdkInlinedRequestBodySchemaGenerator;
        endpointErrorUnionGenerator: EndpointErrorUnionGenerator;
        sdkEndpointTypeSchemasGenerator: SdkEndpointTypeSchemasGenerator;
        sdkClientClassDeclarationReferencer: SdkClientClassDeclarationReferencer;
        sdkClientClassGenerator: SdkClientClassGenerator;
        packageResolver: PackageResolver;
        environmentsGenerator: EnvironmentsGenerator;
        environmentsDeclarationReferencer: EnvironmentsDeclarationReferencer;
        genericAPISdkErrorDeclarationReferencer: GenericAPISdkErrorDeclarationReferencer;
        genericAPISdkErrorGenerator: GenericAPISdkErrorGenerator;
        timeoutSdkErrorDeclarationReferencer: TimeoutSdkErrorDeclarationReferencer;
        timeoutSdkErrorGenerator: TimeoutSdkErrorGenerator;
        treatUnknownAsAny: boolean;
        includeSerdeLayer: boolean;
        isForSnippet: boolean;
        npmPackage: NpmPackage | undefined;
        targetRuntime: JavaScriptRuntime;
        retainOriginalCasing: boolean;
        generateOAuthClients: boolean;
        inlineFileProperties: boolean;
        inlinePathParameters: boolean;
        enableInlineTypes: boolean;
        omitUndefined: boolean;
        neverThrowErrors: boolean;
        useBigInt: boolean;
    }
}

export class SdkContextImpl implements SdkContext {
    public readonly logger: Logger;
    public readonly ir: IntermediateRepresentation;
    public readonly config: FernGeneratorExec.GeneratorConfig;
    public readonly generatorNotificationService: GeneratorNotificationService;
    public readonly sourceFile: SourceFile;
    public readonly externalDependencies: ExternalDependencies;
    public readonly coreUtilities: CoreUtilities;
    public readonly fernConstants: Constants;

    public readonly npmPackage: NpmPackage | undefined;
    public readonly type: TypeContextImpl;
    public readonly typeSchema: TypeSchemaContextImpl;
    public readonly namespaceExport: string;
    public readonly rootClientVariableName: string;
    public readonly sdkInstanceReferenceForSnippet: ts.Identifier;

    public readonly versionContext: VersionContextImpl;
    public readonly sdkError: SdkErrorContextImpl;
    public readonly sdkErrorSchema: SdkErrorSchemaContextImpl;
    public readonly endpointErrorUnion: EndpointErrorUnionContextImpl;
    public readonly requestWrapper: RequestWrapperContextImpl;
    public readonly sdkInlinedRequestBodySchema: SdkInlinedRequestBodySchemaContext;
    public readonly sdkEndpointTypeSchemas: SdkEndpointTypeSchemasContextImpl;
    public readonly sdkClientClass: SdkClientClassContext;
    public readonly environments: EnvironmentsContext;
    public readonly genericAPISdkError: GenericAPISdkErrorContext;
    public readonly timeoutSdkError: TimeoutSdkErrorContext;
    public readonly targetRuntime: JavaScriptRuntime;
    public readonly includeSerdeLayer: boolean;
    public readonly retainOriginalCasing: boolean;
    public readonly inlineFileProperties: boolean;
    public readonly inlinePathParameters: boolean;
    public readonly generateOAuthClients: boolean;
    public readonly omitUndefined: boolean;
    public readonly neverThrowErrors: boolean;

    constructor({
        logger,
        ir,
        config,
        npmPackage,
        isForSnippet,
        intermediateRepresentation,
        versionGenerator,
        versionDeclarationReferencer,
        typeGenerator,
        typeResolver,
        typeDeclarationReferencer,
        typeSchemaGenerator,
        typeSchemaDeclarationReferencer,
        typeReferenceExampleGenerator,
        sdkErrorGenerator,
        errorResolver,
        errorDeclarationReferencer,
        sdkErrorSchemaDeclarationReferencer,
        sdkErrorSchemaGenerator,
        endpointErrorUnionDeclarationReferencer,
        sdkEndpointSchemaDeclarationReferencer,
        endpointErrorUnionGenerator,
        sdkEndpointTypeSchemasGenerator,
        requestWrapperDeclarationReferencer,
        requestWrapperGenerator,
        sdkInlinedRequestBodySchemaDeclarationReferencer,
        sdkInlinedRequestBodySchemaGenerator,
        packageResolver,
        sdkClientClassDeclarationReferencer,
        sdkClientClassGenerator,
        environmentsGenerator,
        environmentsDeclarationReferencer,
        genericAPISdkErrorDeclarationReferencer,
        genericAPISdkErrorGenerator,
        timeoutSdkErrorDeclarationReferencer,
        timeoutSdkErrorGenerator,
        treatUnknownAsAny,
        sourceFile,
        importsManager,
        dependencyManager,
        coreUtilitiesManager,
        fernConstants,
        includeSerdeLayer,
        retainOriginalCasing,
        targetRuntime,
        inlineFileProperties,
        inlinePathParameters,
        generateOAuthClients,
        omitUndefined,
        useBigInt,
        neverThrowErrors,
        enableInlineTypes
    }: SdkContextImpl.Init) {
        this.logger = logger;
        this.ir = ir;
        this.config = config;
        this.generatorNotificationService = new GeneratorNotificationService(config.environment);
        this.includeSerdeLayer = includeSerdeLayer;
        this.retainOriginalCasing = retainOriginalCasing;
        this.omitUndefined = omitUndefined;
        this.inlineFileProperties = inlineFileProperties;
        this.inlinePathParameters = inlinePathParameters;
        this.targetRuntime = targetRuntime;
        this.generateOAuthClients = generateOAuthClients;
        this.namespaceExport = typeDeclarationReferencer.namespaceExport;
        this.rootClientVariableName = ROOT_CLIENT_VARIABLE_NAME;
        this.sdkInstanceReferenceForSnippet = ts.factory.createIdentifier(this.rootClientVariableName);
        this.sourceFile = sourceFile;
        this.npmPackage = npmPackage;
        this.neverThrowErrors = neverThrowErrors;
        this.externalDependencies = createExternalDependencies({
            dependencyManager,
            importsManager
        });
        this.coreUtilities = coreUtilitiesManager.getCoreUtilities({
            sourceFile,
            importsManager
        });
        this.fernConstants = fernConstants;

        this.versionContext = new VersionContextImpl({
            intermediateRepresentation,
            versionGenerator,
            versionDeclarationReferencer,
            importsManager,
            sourceFile
        });
        this.type = new TypeContextImpl({
            npmPackage,
            isForSnippet,
            sourceFile: this.sourceFile,
            importsManager,
            typeResolver,
            typeDeclarationReferencer,
            typeGenerator,
            typeReferenceExampleGenerator,
            treatUnknownAsAny,
            includeSerdeLayer,
            retainOriginalCasing,
            useBigInt,
            enableInlineTypes,
            context: this
        });
        this.typeSchema = new TypeSchemaContextImpl({
            sourceFile,
            coreUtilities: this.coreUtilities,
            importsManager,
            typeResolver,
            typeSchemaDeclarationReferencer,
            typeDeclarationReferencer,
            typeGenerator,
            typeSchemaGenerator,
            treatUnknownAsAny,
            includeSerdeLayer,
            retainOriginalCasing,
            useBigInt,
            enableInlineTypes
        });
        this.sdkError = new SdkErrorContextImpl({
            sourceFile,
            importsManager,
            errorDeclarationReferencer,
            sdkErrorGenerator,
            errorResolver
        });
        this.sdkErrorSchema = new SdkErrorSchemaContextImpl({
            sourceFile,
            importsManager,
            coreUtilities: this.coreUtilities,
            sdkErrorSchemaDeclarationReferencer,
            errorResolver,
            sdkErrorSchemaGenerator
        });
        this.endpointErrorUnion = new EndpointErrorUnionContextImpl({
            sourceFile: this.sourceFile,
            importsManager,
            endpointErrorUnionDeclarationReferencer,
            endpointErrorUnionGenerator,
            packageResolver
        });
        this.requestWrapper = new RequestWrapperContextImpl({
            requestWrapperDeclarationReferencer,
            requestWrapperGenerator,
            packageResolver,
            sourceFile: this.sourceFile,
            importsManager,
            includeSerdeLayer,
            retainOriginalCasing,
            inlineFileProperties,
            inlinePathParameters,
            enableInlineTypes
        });
        this.sdkInlinedRequestBodySchema = new SdkInlinedRequestBodySchemaContextImpl({
            importsManager,
            packageResolver,
            sourceFile: this.sourceFile,
            sdkInlinedRequestBodySchemaDeclarationReferencer,
            sdkInlinedRequestBodySchemaGenerator
        });
        this.sdkEndpointTypeSchemas = new SdkEndpointTypeSchemasContextImpl({
            packageResolver,
            sdkEndpointTypeSchemasGenerator,
            sdkEndpointSchemaDeclarationReferencer,
            importsManager,
            sourceFile
        });
        this.sdkClientClass = new SdkClientClassContextImpl({
            sourceFile: this.sourceFile,
            importsManager,
            sdkClientClassDeclarationReferencer,
            sdkClientClassGenerator,
            packageResolver
        });
        this.environments = new EnvironmentsContextImpl({
            sourceFile: this.sourceFile,
            importsManager,
            intermediateRepresentation,
            environmentsDeclarationReferencer,
            environmentsGenerator
        });
        this.genericAPISdkError = new GenericAPISdkErrorContextImpl({
            sourceFile: this.sourceFile,
            importsManager,
            genericAPISdkErrorDeclarationReferencer,
            genericAPISdkErrorGenerator
        });
        this.timeoutSdkError = new TimeoutSdkErrorContextImpl({
            sourceFile: this.sourceFile,
            importsManager,
            timeoutSdkErrorDeclarationReferencer,
            timeoutSdkErrorGenerator
        });
    }
    version: string | undefined;
}
