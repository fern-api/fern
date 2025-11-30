import { GeneratorNotificationService } from "@fern-api/base-generator";
import { Logger } from "@fern-api/logger";
import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { Constants, IntermediateRepresentation } from "@fern-fern/ir-sdk/api";
import {
    CoreUtilities,
    CoreUtilitiesManager,
    createExternalDependencies,
    DependencyManager,
    ExportsManager,
    ExternalDependencies,
    ImportsManager,
    NpmPackage
} from "@fern-typescript/commons";
import {
    AuthProviderContext,
    BaseClientContext,
    EnvironmentsContext,
    GenericAPISdkErrorContext,
    JsonContext,
    SdkClientClassContext,
    SdkContext,
    SdkInlinedRequestBodySchemaContext,
    TimeoutSdkErrorContext,
    WebsocketTypeSchemaContext
} from "@fern-typescript/contexts";
import { EndpointErrorUnionGenerator } from "@fern-typescript/endpoint-error-union-generator";
import { EnvironmentsGenerator } from "@fern-typescript/environments-generator";
import { GenericAPISdkErrorGenerator, TimeoutSdkErrorGenerator } from "@fern-typescript/generic-sdk-error-generators";
import { RequestWrapperGenerator } from "@fern-typescript/request-wrapper-generator";
import { ErrorResolver, PackageResolver, TypeResolver } from "@fern-typescript/resolvers";
import { SdkClientClassGenerator, WebsocketClassGenerator } from "@fern-typescript/sdk-client-class-generator";
import { SdkEndpointTypeSchemasGenerator } from "@fern-typescript/sdk-endpoint-type-schemas-generator";
import { SdkErrorGenerator } from "@fern-typescript/sdk-error-generator";
import { SdkErrorSchemaGenerator } from "@fern-typescript/sdk-error-schema-generator";
import { SdkInlinedRequestBodySchemaGenerator } from "@fern-typescript/sdk-inlined-request-schema-generator";
import { TypeGenerator } from "@fern-typescript/type-generator";
import { TypeReferenceExampleGenerator } from "@fern-typescript/type-reference-example-generator";
import { TypeSchemaGenerator } from "@fern-typescript/type-schema-generator";
import { WebsocketTypeSchemaGenerator } from "@fern-typescript/websocket-type-schema-generator";
import { SourceFile, ts } from "ts-morph";
import { BaseClientTypeDeclarationReferencer } from "../declaration-referencers/BaseClientTypeDeclarationReferencer";
import { EndpointDeclarationReferencer } from "../declaration-referencers/EndpointDeclarationReferencer";
import { EnvironmentsDeclarationReferencer } from "../declaration-referencers/EnvironmentsDeclarationReferencer";
import { GenericAPISdkErrorDeclarationReferencer } from "../declaration-referencers/GenericAPISdkErrorDeclarationReferencer";
import { JsonDeclarationReferencer } from "../declaration-referencers/JsonDeclarationReferencer";
import { RequestWrapperDeclarationReferencer } from "../declaration-referencers/RequestWrapperDeclarationReferencer";
import { SdkClientClassDeclarationReferencer } from "../declaration-referencers/SdkClientClassDeclarationReferencer";
import { SdkErrorDeclarationReferencer } from "../declaration-referencers/SdkErrorDeclarationReferencer";
import { SdkInlinedRequestBodyDeclarationReferencer } from "../declaration-referencers/SdkInlinedRequestBodyDeclarationReferencer";
import { TimeoutSdkErrorDeclarationReferencer } from "../declaration-referencers/TimeoutSdkErrorDeclarationReferencer";
import { TypeDeclarationReferencer } from "../declaration-referencers/TypeDeclarationReferencer";
import { VersionDeclarationReferencer } from "../declaration-referencers/VersionDeclarationReferencer";
import { WebsocketSocketDeclarationReferencer } from "../declaration-referencers/WebsocketSocketDeclarationReferencer";
import { WebsocketTypeSchemaDeclarationReferencer } from "../declaration-referencers/WebsocketTypeSchemaDeclarationReferencer";
import { VersionGenerator } from "../version/VersionGenerator";
import { EndpointErrorUnionContextImpl } from "./endpoint-error-union/EndpointErrorUnionContextImpl";
import { EnvironmentsContextImpl } from "./environments/EnvironmentsContextImpl";
import { GenericAPISdkErrorContextImpl } from "./generic-api-sdk-error/GenericAPISdkErrorContextImpl";
import { JsonContextImpl } from "./json/JsonContextImpl";
import { RequestWrapperContextImpl } from "./request-wrapper/RequestWrapperContextImpl";
import { SdkClientClassContextImpl } from "./sdk-client-class/SdkClientClassContextImpl";
import { SdkEndpointTypeSchemasContextImpl } from "./sdk-endpoint-type-schemas/SdkEndpointTypeSchemasContextImpl";
import { SdkErrorContextImpl } from "./sdk-error/SdkErrorContextImpl";
import { SdkErrorSchemaContextImpl } from "./sdk-error-schema/SdkErrorSchemaContextImpl";
import { SdkInlinedRequestBodySchemaContextImpl } from "./sdk-inlined-request-body-schema/SdkInlinedRequestBodySchemaContextImpl";
import { TimeoutSdkErrorContextImpl } from "./timeout-sdk-error/TimeoutSdkErrorContextImpl";
import { TypeContextImpl } from "./type/TypeContextImpl";
import { TypeSchemaContextImpl } from "./type-schema/TypeSchemaContextImpl";
import { VersionContextImpl } from "./version/VersionContextImpl";
import { WebsocketContextImpl } from "./websocket/WebsocketContextImpl";
import { WebsocketTypeSchemaContextImpl } from "./websocket-type-schema/WebsocketTypeSchemaImpl";

const ROOT_CLIENT_VARIABLE_NAME = "client";

export declare namespace SdkContextImpl {
    export interface Init {
        logger: Logger;
        version: string | undefined;
        ir: IntermediateRepresentation;
        config: FernGeneratorExec.GeneratorConfig;
        sourceFile: SourceFile;
        importsManager: ImportsManager;
        exportsManager: ExportsManager;
        dependencyManager: DependencyManager;
        coreUtilitiesManager: CoreUtilitiesManager;
        fernConstants: Constants;
        intermediateRepresentation: IntermediateRepresentation;
        versionGenerator: VersionGenerator;
        versionDeclarationReferencer: VersionDeclarationReferencer;
        jsonDeclarationReferencer: JsonDeclarationReferencer;
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
        websocketTypeSchemaGenerator: WebsocketTypeSchemaGenerator;
        endpointErrorUnionGenerator: EndpointErrorUnionGenerator;
        sdkEndpointTypeSchemasGenerator: SdkEndpointTypeSchemasGenerator;
        sdkClientClassDeclarationReferencer: SdkClientClassDeclarationReferencer;
        sdkClientClassGenerator: SdkClientClassGenerator;
        websocketSocketDeclarationReferencer: WebsocketSocketDeclarationReferencer;
        websocketTypeSchemaDeclarationReferencer: WebsocketTypeSchemaDeclarationReferencer;
        websocketGenerator: WebsocketClassGenerator;
        packageResolver: PackageResolver;
        environmentsGenerator: EnvironmentsGenerator;
        environmentsDeclarationReferencer: EnvironmentsDeclarationReferencer;
        baseClientTypeDeclarationReferencer: BaseClientTypeDeclarationReferencer;
        baseClientContext: BaseClientContext;
        genericAPISdkErrorDeclarationReferencer: GenericAPISdkErrorDeclarationReferencer;
        genericAPISdkErrorGenerator: GenericAPISdkErrorGenerator;
        timeoutSdkErrorDeclarationReferencer: TimeoutSdkErrorDeclarationReferencer;
        timeoutSdkErrorGenerator: TimeoutSdkErrorGenerator;
        treatUnknownAsAny: boolean;
        includeSerdeLayer: boolean;
        isForSnippet: boolean;
        npmPackage: NpmPackage | undefined;
        retainOriginalCasing: boolean;
        generateOAuthClients: boolean;
        inlineFileProperties: boolean;
        inlinePathParameters: boolean | "always";
        enableInlineTypes: boolean;
        omitUndefined: boolean;
        allowExtraFields: boolean;
        neverThrowErrors: boolean;
        useBigInt: boolean;
        relativePackagePath: string;
        relativeTestPath: string;
        formDataSupport: "Node16" | "Node18";
        useDefaultRequestParameterValues: boolean;
        generateReadWriteOnlyTypes: boolean;
        flattenRequestParameters: boolean;
        parameterNaming: "originalName" | "wireValue" | "camelCase" | "snakeCase" | "default";
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
    public readonly jsonContext: JsonContext;
    public readonly sdkError: SdkErrorContextImpl;
    public readonly sdkErrorSchema: SdkErrorSchemaContextImpl;
    public readonly endpointErrorUnion: EndpointErrorUnionContextImpl;
    public readonly requestWrapper: RequestWrapperContextImpl;
    public readonly sdkInlinedRequestBodySchema: SdkInlinedRequestBodySchemaContext;
    public readonly sdkEndpointTypeSchemas: SdkEndpointTypeSchemasContextImpl;
    public readonly sdkClientClass: SdkClientClassContext;
    public readonly baseClient: BaseClientContext;
    public readonly websocketTypeSchema: WebsocketTypeSchemaContext;
    public readonly websocket: WebsocketContextImpl;
    public readonly environments: EnvironmentsContext;
    public readonly genericAPISdkError: GenericAPISdkErrorContext;
    public readonly timeoutSdkError: TimeoutSdkErrorContext;
    public readonly includeSerdeLayer: boolean;
    public readonly retainOriginalCasing: boolean;
    public readonly inlineFileProperties: boolean;
    public readonly inlinePathParameters: boolean | "always";
    public readonly formDataSupport: "Node16" | "Node18";
    public readonly generateOAuthClients: boolean;
    public readonly omitUndefined: boolean;
    public readonly neverThrowErrors: boolean;
    public readonly flattenRequestParameters: boolean;
    public readonly importsManager: ImportsManager;
    public readonly exportsManager: ExportsManager;
    public readonly relativePackagePath: string;
    public readonly relativeTestPath: string;
    public readonly authProvider: AuthProviderContext;
    public readonly enableInlineTypes: boolean;

    constructor({
        logger,
        ir,
        config,
        npmPackage,
        isForSnippet,
        intermediateRepresentation,
        versionGenerator,
        versionDeclarationReferencer,
        jsonDeclarationReferencer,
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
        websocketTypeSchemaGenerator,
        websocketSocketDeclarationReferencer,
        websocketGenerator,
        packageResolver,
        sdkClientClassDeclarationReferencer,
        sdkClientClassGenerator,
        websocketTypeSchemaDeclarationReferencer,
        environmentsGenerator,
        environmentsDeclarationReferencer,
        baseClientTypeDeclarationReferencer,
        baseClientContext,
        genericAPISdkErrorDeclarationReferencer,
        genericAPISdkErrorGenerator,
        timeoutSdkErrorDeclarationReferencer,
        timeoutSdkErrorGenerator,
        treatUnknownAsAny,
        sourceFile,
        importsManager,
        exportsManager,
        dependencyManager,
        coreUtilitiesManager,
        fernConstants,
        includeSerdeLayer,
        retainOriginalCasing,
        inlineFileProperties,
        inlinePathParameters,
        generateOAuthClients,
        omitUndefined,
        allowExtraFields,
        useBigInt,
        neverThrowErrors,
        enableInlineTypes,
        relativePackagePath,
        relativeTestPath,
        formDataSupport,
        useDefaultRequestParameterValues,
        generateReadWriteOnlyTypes,
        flattenRequestParameters,
        parameterNaming
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
        this.formDataSupport = formDataSupport;
        this.generateOAuthClients = generateOAuthClients;
        this.flattenRequestParameters = flattenRequestParameters;
        this.namespaceExport = typeDeclarationReferencer.namespaceExport;
        this.rootClientVariableName = ROOT_CLIENT_VARIABLE_NAME;
        this.sdkInstanceReferenceForSnippet = ts.factory.createIdentifier(this.rootClientVariableName);
        this.sourceFile = sourceFile;
        this.npmPackage = npmPackage;
        this.neverThrowErrors = neverThrowErrors;
        this.importsManager = importsManager;
        this.exportsManager = exportsManager;
        this.relativePackagePath = relativePackagePath;
        this.relativeTestPath = relativeTestPath;
        this.enableInlineTypes = enableInlineTypes;
        this.externalDependencies = createExternalDependencies({
            dependencyManager,
            importsManager
        });
        this.coreUtilities = coreUtilitiesManager.getCoreUtilities({
            sourceFile,
            importsManager,
            exportsManager,
            relativePackagePath,
            relativeTestPath
        });
        this.fernConstants = fernConstants;

        this.versionContext = new VersionContextImpl({
            intermediateRepresentation,
            versionGenerator,
            versionDeclarationReferencer,
            importsManager,
            exportsManager,
            sourceFile
        });
        this.jsonContext = new JsonContextImpl({
            sourceFile,
            importsManager,
            exportsManager,
            jsonDeclarationReferencer
        });
        this.type = new TypeContextImpl({
            npmPackage,
            isForSnippet,
            sourceFile: this.sourceFile,
            importsManager,
            exportsManager,
            typeResolver,
            typeDeclarationReferencer,
            typeGenerator,
            typeReferenceExampleGenerator,
            treatUnknownAsAny,
            includeSerdeLayer,
            retainOriginalCasing,
            useBigInt,
            enableInlineTypes,
            allowExtraFields,
            omitUndefined,
            useDefaultRequestParameterValues,
            context: this,
            generateReadWriteOnlyTypes
        });
        this.typeSchema = new TypeSchemaContextImpl({
            sourceFile,
            coreUtilities: this.coreUtilities,
            importsManager,
            exportsManager,
            context: this,
            typeSchemaDeclarationReferencer,
            typeDeclarationReferencer,
            typeGenerator,
            typeSchemaGenerator,
            treatUnknownAsAny,
            includeSerdeLayer,
            retainOriginalCasing,
            useBigInt,
            enableInlineTypes,
            allowExtraFields,
            omitUndefined,
            generateReadWriteOnlyTypes
        });
        this.sdkError = new SdkErrorContextImpl({
            sourceFile,
            importsManager,
            exportsManager,
            errorDeclarationReferencer,
            sdkErrorGenerator,
            errorResolver
        });
        this.sdkErrorSchema = new SdkErrorSchemaContextImpl({
            sourceFile,
            importsManager,
            exportsManager,
            coreUtilities: this.coreUtilities,
            sdkErrorSchemaDeclarationReferencer,
            errorResolver,
            sdkErrorSchemaGenerator
        });
        this.endpointErrorUnion = new EndpointErrorUnionContextImpl({
            sourceFile: this.sourceFile,
            importsManager,
            exportsManager,
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
            exportsManager,
            includeSerdeLayer,
            retainOriginalCasing,
            inlineFileProperties,
            inlinePathParameters,
            enableInlineTypes,
            formDataSupport,
            flattenRequestParameters,
            parameterNaming
        });
        this.sdkInlinedRequestBodySchema = new SdkInlinedRequestBodySchemaContextImpl({
            importsManager,
            exportsManager,
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
            exportsManager,
            sourceFile
        });
        this.sdkClientClass = new SdkClientClassContextImpl({
            sourceFile: this.sourceFile,
            importsManager,
            exportsManager,
            sdkClientClassDeclarationReferencer,
            sdkClientClassGenerator,
            baseClientTypeDeclarationReferencer,
            packageResolver
        });
        this.baseClient = baseClientContext;
        this.websocketTypeSchema = new WebsocketTypeSchemaContextImpl({
            sourceFile: this.sourceFile,
            importsManager,
            exportsManager,
            websocketTypeSchemaGenerator,
            packageResolver,
            websocketTypeSchemaDeclarationReferencer
        });
        this.websocket = new WebsocketContextImpl({
            sourceFile: this.sourceFile,
            importsManager,
            exportsManager,
            websocketSocketDeclarationReferencer,
            websocketGenerator,
            includeSerdeLayer,
            packageResolver
        });
        this.environments = new EnvironmentsContextImpl({
            sourceFile: this.sourceFile,
            importsManager,
            exportsManager,
            intermediateRepresentation,
            environmentsDeclarationReferencer,
            environmentsGenerator
        });
        this.genericAPISdkError = new GenericAPISdkErrorContextImpl({
            sourceFile: this.sourceFile,
            importsManager,
            exportsManager,
            genericAPISdkErrorDeclarationReferencer,
            genericAPISdkErrorGenerator
        });
        this.timeoutSdkError = new TimeoutSdkErrorContextImpl({
            sourceFile: this.sourceFile,
            importsManager,
            exportsManager,
            timeoutSdkErrorDeclarationReferencer,
            timeoutSdkErrorGenerator
        });
        this.authProvider = new AuthProviderContext({
            context: this
        });
    }
    version: string | undefined;
}
