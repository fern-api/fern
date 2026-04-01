import { CaseConverter, GeneratorNotificationService } from "@fern-api/base-generator";
import { Logger } from "@fern-api/logger";
import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { FernIr } from "@fern-fern/ir-sdk";
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
    FileContext,
    GenericAPISdkErrorContext,
    JsonContext,
    NonStatusCodeErrorHandlerContext,
    SdkClientClassContext,
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
import { BaseClientTypeDeclarationReferencer } from "../declaration-referencers/BaseClientTypeDeclarationReferencer.js";
import { EndpointDeclarationReferencer } from "../declaration-referencers/EndpointDeclarationReferencer.js";
import { EnvironmentsDeclarationReferencer } from "../declaration-referencers/EnvironmentsDeclarationReferencer.js";
import { GenericAPISdkErrorDeclarationReferencer } from "../declaration-referencers/GenericAPISdkErrorDeclarationReferencer.js";
import { JsonDeclarationReferencer } from "../declaration-referencers/JsonDeclarationReferencer.js";
import { NonStatusCodeErrorHandlerDeclarationReferencer } from "../declaration-referencers/NonStatusCodeErrorHandlerDeclarationReferencer.js";
import { RequestWrapperDeclarationReferencer } from "../declaration-referencers/RequestWrapperDeclarationReferencer.js";
import { SdkClientClassDeclarationReferencer } from "../declaration-referencers/SdkClientClassDeclarationReferencer.js";
import { SdkErrorDeclarationReferencer } from "../declaration-referencers/SdkErrorDeclarationReferencer.js";
import { SdkInlinedRequestBodyDeclarationReferencer } from "../declaration-referencers/SdkInlinedRequestBodyDeclarationReferencer.js";
import { TimeoutSdkErrorDeclarationReferencer } from "../declaration-referencers/TimeoutSdkErrorDeclarationReferencer.js";
import { TypeDeclarationReferencer } from "../declaration-referencers/TypeDeclarationReferencer.js";
import { VersionDeclarationReferencer } from "../declaration-referencers/VersionDeclarationReferencer.js";
import { WebsocketSocketDeclarationReferencer } from "../declaration-referencers/WebsocketSocketDeclarationReferencer.js";
import { WebsocketTypeSchemaDeclarationReferencer } from "../declaration-referencers/WebsocketTypeSchemaDeclarationReferencer.js";
import { NonStatusCodeErrorHandlerGenerator } from "../non-status-code-error-handler/NonStatusCodeErrorHandlerGenerator.js";
import { VersionGenerator } from "../version/VersionGenerator.js";
import { EndpointErrorUnionContextImpl } from "./endpoint-error-union/EndpointErrorUnionContextImpl.js";
import { EnvironmentsContextImpl } from "./environments/EnvironmentsContextImpl.js";
import { GenericAPISdkErrorContextImpl } from "./generic-api-sdk-error/GenericAPISdkErrorContextImpl.js";
import { JsonContextImpl } from "./json/JsonContextImpl.js";
import { NonStatusCodeErrorHandlerContextImpl } from "./non-status-code-error-handler/NonStatusCodeErrorHandlerContextImpl.js";
import { RequestWrapperContextImpl } from "./request-wrapper/RequestWrapperContextImpl.js";
import { SdkClientClassContextImpl } from "./sdk-client-class/SdkClientClassContextImpl.js";
import { SdkEndpointTypeSchemasContextImpl } from "./sdk-endpoint-type-schemas/SdkEndpointTypeSchemasContextImpl.js";
import { SdkErrorContextImpl } from "./sdk-error/SdkErrorContextImpl.js";
import { SdkErrorSchemaContextImpl } from "./sdk-error-schema/SdkErrorSchemaContextImpl.js";
import { SdkInlinedRequestBodySchemaContextImpl } from "./sdk-inlined-request-body-schema/SdkInlinedRequestBodySchemaContextImpl.js";
import { TimeoutSdkErrorContextImpl } from "./timeout-sdk-error/TimeoutSdkErrorContextImpl.js";
import { TypeContextImpl } from "./type/TypeContextImpl.js";
import { TypeSchemaContextImpl } from "./type-schema/TypeSchemaContextImpl.js";
import { VersionContextImpl } from "./version/VersionContextImpl.js";
import { WebsocketContextImpl } from "./websocket/WebsocketContextImpl.js";
import { WebsocketTypeSchemaContextImpl } from "./websocket-type-schema/WebsocketTypeSchemaImpl.js";

const ROOT_CLIENT_VARIABLE_NAME = "client";

export declare namespace FileContextImpl {
    export interface Init {
        logger: Logger;
        version: string | undefined;
        ir: FernIr.IntermediateRepresentation;
        config: FernGeneratorExec.GeneratorConfig;
        sourceFile: SourceFile;
        importsManager: ImportsManager;
        exportsManager: ExportsManager;
        dependencyManager: DependencyManager;
        coreUtilitiesManager: CoreUtilitiesManager;
        fernConstants: FernIr.Constants;
        intermediateRepresentation: FernIr.IntermediateRepresentation;
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
        nonStatusCodeErrorHandlerDeclarationReferencer: NonStatusCodeErrorHandlerDeclarationReferencer;
        nonStatusCodeErrorHandlerGenerator: NonStatusCodeErrorHandlerGenerator;
        treatUnknownAsAny: boolean;
        includeSerdeLayer: boolean;
        isForSnippet: boolean;
        npmPackage: NpmPackage | undefined;
        retainOriginalCasing: boolean;
        generateOAuthClients: boolean;
        inlineFileProperties: boolean;
        inlinePathParameters: boolean;
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
        resolveQueryParameterNameConflicts: boolean;
    }
}

export class FileContextImpl implements FileContext {
    // Stored init params for lazy sub-context initialization
    private readonly initParams: FileContextImpl.Init;

    // Eagerly initialized (cheap scalar/reference assignments)
    public readonly logger: Logger;
    public readonly ir: FernIr.IntermediateRepresentation;
    public readonly config: FernGeneratorExec.GeneratorConfig;
    public readonly sourceFile: SourceFile;
    public readonly fernConstants: FernIr.Constants;
    public readonly npmPackage: NpmPackage | undefined;
    public readonly namespaceExport: string;
    public readonly rootClientVariableName: string;
    public readonly sdkInstanceReferenceForSnippet: ts.Identifier;
    public readonly includeSerdeLayer: boolean;
    public readonly retainOriginalCasing: boolean;
    public readonly inlineFileProperties: boolean;
    public readonly inlinePathParameters: boolean;
    public readonly formDataSupport: "Node16" | "Node18";
    public readonly generateOAuthClients: boolean;
    public readonly omitUndefined: boolean;
    public readonly neverThrowErrors: boolean;
    public readonly flattenRequestParameters: boolean;
    public readonly importsManager: ImportsManager;
    public readonly exportsManager: ExportsManager;
    public readonly relativePackagePath: string;
    public readonly relativeTestPath: string;
    public readonly enableInlineTypes: boolean;
    public readonly baseClient: BaseClientContext;
    public readonly case: CaseConverter;
    public readonly version: string | undefined;

    // Lazy backing fields for sub-contexts and utilities
    private _generatorNotificationService: GeneratorNotificationService | undefined;
    private _externalDependencies: ExternalDependencies | undefined;
    private _coreUtilities: CoreUtilities | undefined;
    private _type: TypeContextImpl | undefined;
    private _typeSchema: TypeSchemaContextImpl | undefined;
    private _versionContext: VersionContextImpl | undefined;
    private _jsonContext: JsonContextImpl | undefined;
    private _sdkError: SdkErrorContextImpl | undefined;
    private _sdkErrorSchema: SdkErrorSchemaContextImpl | undefined;
    private _endpointErrorUnion: EndpointErrorUnionContextImpl | undefined;
    private _requestWrapper: RequestWrapperContextImpl | undefined;
    private _sdkInlinedRequestBodySchema: SdkInlinedRequestBodySchemaContextImpl | undefined;
    private _sdkEndpointTypeSchemas: SdkEndpointTypeSchemasContextImpl | undefined;
    private _sdkClientClass: SdkClientClassContextImpl | undefined;
    private _websocketTypeSchema: WebsocketTypeSchemaContextImpl | undefined;
    private _websocket: WebsocketContextImpl | undefined;
    private _environments: EnvironmentsContextImpl | undefined;
    private _genericAPISdkError: GenericAPISdkErrorContextImpl | undefined;
    private _timeoutSdkError: TimeoutSdkErrorContextImpl | undefined;
    private _nonStatusCodeErrorHandler: NonStatusCodeErrorHandlerContextImpl | undefined;
    private _authProvider: AuthProviderContext | undefined;

    constructor(init: FileContextImpl.Init) {
        this.initParams = init;
        this.logger = init.logger;
        this.ir = init.ir;
        this.config = init.config;
        this.includeSerdeLayer = init.includeSerdeLayer;
        this.retainOriginalCasing = init.retainOriginalCasing;
        this.omitUndefined = init.omitUndefined;
        this.inlineFileProperties = init.inlineFileProperties;
        this.inlinePathParameters = init.inlinePathParameters;
        this.formDataSupport = init.formDataSupport;
        this.generateOAuthClients = init.generateOAuthClients;
        this.flattenRequestParameters = init.flattenRequestParameters;
        this.namespaceExport = init.typeDeclarationReferencer.namespaceExport;
        this.rootClientVariableName = ROOT_CLIENT_VARIABLE_NAME;
        this.sdkInstanceReferenceForSnippet = ts.factory.createIdentifier(this.rootClientVariableName);
        this.sourceFile = init.sourceFile;
        this.npmPackage = init.npmPackage;
        this.neverThrowErrors = init.neverThrowErrors;
        this.importsManager = init.importsManager;
        this.exportsManager = init.exportsManager;
        this.relativePackagePath = init.relativePackagePath;
        this.relativeTestPath = init.relativeTestPath;
        this.enableInlineTypes = init.enableInlineTypes;
        this.fernConstants = init.fernConstants;
        this.baseClient = init.baseClientContext;
        this.version = init.version;
        this.case = new CaseConverter({
            generationLanguage: "typescript",
            keywords: init.ir.casingsConfig?.keywords,
            smartCasing: init.ir.casingsConfig?.smartCasing ?? true
        });
    }

    // Lazy getters for utilities

    get generatorNotificationService(): GeneratorNotificationService {
        return (this._generatorNotificationService ??= new GeneratorNotificationService(this.config.environment));
    }

    get externalDependencies(): ExternalDependencies {
        return (this._externalDependencies ??= createExternalDependencies({
            dependencyManager: this.initParams.dependencyManager,
            importsManager: this.importsManager
        }));
    }

    get coreUtilities(): CoreUtilities {
        return (this._coreUtilities ??= this.initParams.coreUtilitiesManager.getCoreUtilities({
            sourceFile: this.sourceFile,
            importsManager: this.importsManager,
            exportsManager: this.exportsManager,
            relativePackagePath: this.relativePackagePath,
            relativeTestPath: this.relativeTestPath
        }));
    }

    // Lazy getters for sub-contexts

    get versionContext(): VersionContextImpl {
        return (this._versionContext ??= new VersionContextImpl({
            intermediateRepresentation: this.initParams.intermediateRepresentation,
            versionGenerator: this.initParams.versionGenerator,
            versionDeclarationReferencer: this.initParams.versionDeclarationReferencer,
            importsManager: this.importsManager,
            exportsManager: this.exportsManager,
            sourceFile: this.sourceFile
        }));
    }

    get jsonContext(): JsonContext {
        return (this._jsonContext ??= new JsonContextImpl({
            sourceFile: this.sourceFile,
            importsManager: this.importsManager,
            exportsManager: this.exportsManager,
            jsonDeclarationReferencer: this.initParams.jsonDeclarationReferencer
        }));
    }

    get type(): TypeContextImpl {
        return (this._type ??= new TypeContextImpl({
            npmPackage: this.npmPackage,
            isForSnippet: this.initParams.isForSnippet,
            sourceFile: this.sourceFile,
            importsManager: this.importsManager,
            exportsManager: this.exportsManager,
            typeResolver: this.initParams.typeResolver,
            typeDeclarationReferencer: this.initParams.typeDeclarationReferencer,
            typeGenerator: this.initParams.typeGenerator,
            typeReferenceExampleGenerator: this.initParams.typeReferenceExampleGenerator,
            treatUnknownAsAny: this.initParams.treatUnknownAsAny,
            includeSerdeLayer: this.includeSerdeLayer,
            retainOriginalCasing: this.retainOriginalCasing,
            useBigInt: this.initParams.useBigInt,
            enableInlineTypes: this.enableInlineTypes,
            allowExtraFields: this.initParams.allowExtraFields,
            omitUndefined: this.omitUndefined,
            useDefaultRequestParameterValues: this.initParams.useDefaultRequestParameterValues,
            context: this,
            generateReadWriteOnlyTypes: this.initParams.generateReadWriteOnlyTypes,
            caseConverter: this.case
        }));
    }

    get typeSchema(): TypeSchemaContextImpl {
        return (this._typeSchema ??= new TypeSchemaContextImpl({
            sourceFile: this.sourceFile,
            coreUtilities: this.coreUtilities,
            importsManager: this.importsManager,
            exportsManager: this.exportsManager,
            context: this,
            typeSchemaDeclarationReferencer: this.initParams.typeSchemaDeclarationReferencer,
            typeDeclarationReferencer: this.initParams.typeDeclarationReferencer,
            typeGenerator: this.initParams.typeGenerator,
            typeSchemaGenerator: this.initParams.typeSchemaGenerator,
            treatUnknownAsAny: this.initParams.treatUnknownAsAny,
            includeSerdeLayer: this.includeSerdeLayer,
            retainOriginalCasing: this.retainOriginalCasing,
            useBigInt: this.initParams.useBigInt,
            enableInlineTypes: this.enableInlineTypes,
            allowExtraFields: this.initParams.allowExtraFields,
            omitUndefined: this.omitUndefined,
            generateReadWriteOnlyTypes: this.initParams.generateReadWriteOnlyTypes
        }));
    }

    get sdkError(): SdkErrorContextImpl {
        return (this._sdkError ??= new SdkErrorContextImpl({
            sourceFile: this.sourceFile,
            importsManager: this.importsManager,
            exportsManager: this.exportsManager,
            errorDeclarationReferencer: this.initParams.errorDeclarationReferencer,
            sdkErrorGenerator: this.initParams.sdkErrorGenerator,
            errorResolver: this.initParams.errorResolver
        }));
    }

    get sdkErrorSchema(): SdkErrorSchemaContextImpl {
        return (this._sdkErrorSchema ??= new SdkErrorSchemaContextImpl({
            sourceFile: this.sourceFile,
            importsManager: this.importsManager,
            exportsManager: this.exportsManager,
            coreUtilities: this.coreUtilities,
            sdkErrorSchemaDeclarationReferencer: this.initParams.sdkErrorSchemaDeclarationReferencer,
            errorResolver: this.initParams.errorResolver,
            sdkErrorSchemaGenerator: this.initParams.sdkErrorSchemaGenerator
        }));
    }

    get endpointErrorUnion(): EndpointErrorUnionContextImpl {
        return (this._endpointErrorUnion ??= new EndpointErrorUnionContextImpl({
            sourceFile: this.sourceFile,
            importsManager: this.importsManager,
            exportsManager: this.exportsManager,
            endpointErrorUnionDeclarationReferencer: this.initParams.endpointErrorUnionDeclarationReferencer,
            endpointErrorUnionGenerator: this.initParams.endpointErrorUnionGenerator,
            packageResolver: this.initParams.packageResolver
        }));
    }

    get requestWrapper(): RequestWrapperContextImpl {
        return (this._requestWrapper ??= new RequestWrapperContextImpl({
            requestWrapperDeclarationReferencer: this.initParams.requestWrapperDeclarationReferencer,
            requestWrapperGenerator: this.initParams.requestWrapperGenerator,
            packageResolver: this.initParams.packageResolver,
            sourceFile: this.sourceFile,
            importsManager: this.importsManager,
            exportsManager: this.exportsManager,
            includeSerdeLayer: this.includeSerdeLayer,
            retainOriginalCasing: this.retainOriginalCasing,
            inlineFileProperties: this.inlineFileProperties,
            inlinePathParameters: this.inlinePathParameters,
            enableInlineTypes: this.enableInlineTypes,
            formDataSupport: this.formDataSupport,
            flattenRequestParameters: this.flattenRequestParameters,
            parameterNaming: this.initParams.parameterNaming,
            caseConverter: this.case,
            resolveQueryParameterNameConflicts: this.initParams.resolveQueryParameterNameConflicts
        }));
    }

    get sdkInlinedRequestBodySchema(): SdkInlinedRequestBodySchemaContext {
        return (this._sdkInlinedRequestBodySchema ??= new SdkInlinedRequestBodySchemaContextImpl({
            importsManager: this.importsManager,
            exportsManager: this.exportsManager,
            packageResolver: this.initParams.packageResolver,
            sourceFile: this.sourceFile,
            sdkInlinedRequestBodySchemaDeclarationReferencer:
                this.initParams.sdkInlinedRequestBodySchemaDeclarationReferencer,
            sdkInlinedRequestBodySchemaGenerator: this.initParams.sdkInlinedRequestBodySchemaGenerator
        }));
    }

    get sdkEndpointTypeSchemas(): SdkEndpointTypeSchemasContextImpl {
        return (this._sdkEndpointTypeSchemas ??= new SdkEndpointTypeSchemasContextImpl({
            packageResolver: this.initParams.packageResolver,
            sdkEndpointTypeSchemasGenerator: this.initParams.sdkEndpointTypeSchemasGenerator,
            sdkEndpointSchemaDeclarationReferencer: this.initParams.sdkEndpointSchemaDeclarationReferencer,
            importsManager: this.importsManager,
            exportsManager: this.exportsManager,
            sourceFile: this.sourceFile
        }));
    }

    get sdkClientClass(): SdkClientClassContext {
        return (this._sdkClientClass ??= new SdkClientClassContextImpl({
            sourceFile: this.sourceFile,
            importsManager: this.importsManager,
            exportsManager: this.exportsManager,
            sdkClientClassDeclarationReferencer: this.initParams.sdkClientClassDeclarationReferencer,
            sdkClientClassGenerator: this.initParams.sdkClientClassGenerator,
            baseClientTypeDeclarationReferencer: this.initParams.baseClientTypeDeclarationReferencer,
            packageResolver: this.initParams.packageResolver
        }));
    }

    get websocketTypeSchema(): WebsocketTypeSchemaContext {
        return (this._websocketTypeSchema ??= new WebsocketTypeSchemaContextImpl({
            sourceFile: this.sourceFile,
            importsManager: this.importsManager,
            exportsManager: this.exportsManager,
            websocketTypeSchemaGenerator: this.initParams.websocketTypeSchemaGenerator,
            packageResolver: this.initParams.packageResolver,
            websocketTypeSchemaDeclarationReferencer: this.initParams.websocketTypeSchemaDeclarationReferencer
        }));
    }

    get websocket(): WebsocketContextImpl {
        return (this._websocket ??= new WebsocketContextImpl({
            sourceFile: this.sourceFile,
            importsManager: this.importsManager,
            exportsManager: this.exportsManager,
            websocketSocketDeclarationReferencer: this.initParams.websocketSocketDeclarationReferencer,
            websocketGenerator: this.initParams.websocketGenerator,
            includeSerdeLayer: this.includeSerdeLayer,
            packageResolver: this.initParams.packageResolver
        }));
    }

    get environments(): EnvironmentsContext {
        return (this._environments ??= new EnvironmentsContextImpl({
            sourceFile: this.sourceFile,
            importsManager: this.importsManager,
            exportsManager: this.exportsManager,
            intermediateRepresentation: this.initParams.intermediateRepresentation,
            environmentsDeclarationReferencer: this.initParams.environmentsDeclarationReferencer,
            environmentsGenerator: this.initParams.environmentsGenerator,
            caseConverter: this.case
        }));
    }

    get genericAPISdkError(): GenericAPISdkErrorContext {
        return (this._genericAPISdkError ??= new GenericAPISdkErrorContextImpl({
            sourceFile: this.sourceFile,
            importsManager: this.importsManager,
            exportsManager: this.exportsManager,
            genericAPISdkErrorDeclarationReferencer: this.initParams.genericAPISdkErrorDeclarationReferencer,
            genericAPISdkErrorGenerator: this.initParams.genericAPISdkErrorGenerator
        }));
    }

    get timeoutSdkError(): TimeoutSdkErrorContext {
        return (this._timeoutSdkError ??= new TimeoutSdkErrorContextImpl({
            sourceFile: this.sourceFile,
            importsManager: this.importsManager,
            exportsManager: this.exportsManager,
            timeoutSdkErrorDeclarationReferencer: this.initParams.timeoutSdkErrorDeclarationReferencer,
            timeoutSdkErrorGenerator: this.initParams.timeoutSdkErrorGenerator
        }));
    }

    get nonStatusCodeErrorHandler(): NonStatusCodeErrorHandlerContext {
        return (this._nonStatusCodeErrorHandler ??= new NonStatusCodeErrorHandlerContextImpl({
            sourceFile: this.sourceFile,
            importsManager: this.importsManager,
            exportsManager: this.exportsManager,
            nonStatusCodeErrorHandlerDeclarationReferencer:
                this.initParams.nonStatusCodeErrorHandlerDeclarationReferencer,
            nonStatusCodeErrorHandlerGenerator: this.initParams.nonStatusCodeErrorHandlerGenerator
        }));
    }

    get authProvider(): AuthProviderContext {
        return (this._authProvider ??= new AuthProviderContext({
            context: this
        }));
    }
}
