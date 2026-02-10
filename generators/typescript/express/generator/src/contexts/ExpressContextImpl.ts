import { Logger } from "@fern-api/logger";
import { FernIr } from "@fern-fern/ir-sdk";
import {
    CoreUtilities,
    CoreUtilitiesManager,
    createExternalDependencies,
    DependencyManager,
    ExportsManager,
    ExternalDependencies,
    ImportsManager
} from "@fern-typescript/commons";
import {
    ExpressContext,
    ExpressErrorSchemaContext,
    ExpressRegisterContext,
    GenericAPIExpressErrorContext,
    JsonContext
} from "@fern-typescript/contexts";
import { ExpressEndpointTypeSchemasGenerator } from "@fern-typescript/express-endpoint-type-schemas-generator";
import { ExpressErrorGenerator } from "@fern-typescript/express-error-generator";
import { ExpressErrorSchemaGenerator } from "@fern-typescript/express-error-schema-generator";
import { ExpressInlinedRequestBodyGenerator } from "@fern-typescript/express-inlined-request-body-generator";
import { ExpressInlinedRequestBodySchemaGenerator } from "@fern-typescript/express-inlined-request-schema-generator";
import { ExpressRegisterGenerator } from "@fern-typescript/express-register-generator";
import { ExpressServiceGenerator } from "@fern-typescript/express-service-generator";
import { GenericAPIExpressErrorGenerator } from "@fern-typescript/generic-express-error-generators";
import { ErrorResolver, PackageResolver, TypeResolver } from "@fern-typescript/resolvers";
import { TypeGenerator } from "@fern-typescript/type-generator";
import { TypeReferenceExampleGenerator } from "@fern-typescript/type-reference-example-generator";
import { TypeSchemaGenerator } from "@fern-typescript/type-schema-generator";
import { SourceFile } from "ts-morph";

import { EndpointDeclarationReferencer } from "../declaration-referencers/EndpointDeclarationReferencer.js";
import { ExpressErrorDeclarationReferencer } from "../declaration-referencers/ExpressErrorDeclarationReferencer.js";
import { ExpressInlinedRequestBodyDeclarationReferencer } from "../declaration-referencers/ExpressInlinedRequestBodyDeclarationReferencer.js";
import { ExpressServiceDeclarationReferencer } from "../declaration-referencers/ExpressServiceDeclarationReferencer.js";
import { GenericAPIExpressErrorDeclarationReferencer } from "../declaration-referencers/GenericAPIExpressErrorDeclarationReferencer.js";
import { JsonDeclarationReferencer } from "../declaration-referencers/JsonDeclarationReferencer.js";
import { TypeDeclarationReferencer } from "../declaration-referencers/TypeDeclarationReferencer.js";
import { ExpressEndpointTypeSchemasContextImpl } from "./express-endpoint-type-schemas/ExpressEndpointTypeSchemasContextImpl.js";
import { ExpressErrorContextImpl } from "./express-error/ExpressErrorContextImpl.js";
import { ExpressErrorSchemaContextImpl } from "./express-error-schema/ExpressErrorSchemaContextImpl.js";
import { ExpressInlinedRequestBodyContextImpl } from "./express-inlined-request-body/ExpressInlinedRequestBodyContextImpl.ts";
import { ExpressInlinedRequestBodySchemaContextImpl } from "./express-inlined-request-body-schema/ExpressInlinedRequestBodySchemaContextImpl.js";
import { ExpressRegisterContextImpl } from "./express-register/ExpressRegisterContextImpl.ts";
import { ExpressServiceContextImpl } from "./express-service/ExpressServiceContextImpl.ts";
import { GenericAPIExpressErrorContextImpl } from "./generic-api-express-error/GenericAPIExpressErrorContextImpl.js";
import { JsonContextImpl } from "./json/JsonContextImpl.js";
import { TypeContextImpl } from "./type/TypeContextImpl.js";
import { TypeSchemaContextImpl } from "./type-schema/TypeSchemaContextImpl.js";

export declare namespace ExpressContextImpl {
    export interface Init {
        logger: Logger;
        sourceFile: SourceFile;
        importsManager: ImportsManager;
        exportsManager: ExportsManager;
        dependencyManager: DependencyManager;
        coreUtilitiesManager: CoreUtilitiesManager;
        fernConstants: FernIr.Constants;

        typeResolver: TypeResolver;
        typeGenerator: TypeGenerator;
        typeSchemaDeclarationReferencer: TypeDeclarationReferencer;
        typeSchemaGenerator: TypeSchemaGenerator;
        typeDeclarationReferencer: TypeDeclarationReferencer;
        typeReferenceExampleGenerator: TypeReferenceExampleGenerator;
        packageResolver: PackageResolver;
        expressInlinedRequestBodyDeclarationReferencer: ExpressInlinedRequestBodyDeclarationReferencer;
        expressInlinedRequestBodyGenerator: ExpressInlinedRequestBodyGenerator;
        expressInlinedRequestBodySchemaGenerator: ExpressInlinedRequestBodySchemaGenerator;
        expressInlinedRequestBodySchemaDeclarationReferencer: ExpressInlinedRequestBodyDeclarationReferencer;
        expressEndpointSchemaDeclarationReferencer: EndpointDeclarationReferencer;
        expressEndpointTypeSchemasGenerator: ExpressEndpointTypeSchemasGenerator;
        expressServiceGenerator: ExpressServiceGenerator;
        expressServiceDeclarationReferencer: ExpressServiceDeclarationReferencer;
        errorDeclarationReferencer: ExpressErrorDeclarationReferencer;
        jsonDeclarationReferencer: JsonDeclarationReferencer;
        expressErrorGenerator: ExpressErrorGenerator;
        errorResolver: ErrorResolver;
        genericAPIExpressErrorDeclarationReferencer: GenericAPIExpressErrorDeclarationReferencer;
        genericAPIExpressErrorGenerator: GenericAPIExpressErrorGenerator;
        treatUnknownAsAny: boolean;
        expressRegisterGenerator: ExpressRegisterGenerator;
        expressErrorSchemaDeclarationReferencer: ExpressErrorDeclarationReferencer;
        expressErrorSchemaGenerator: ExpressErrorSchemaGenerator;
        includeSerdeLayer: boolean;
        retainOriginalCasing: boolean;
        useBigInt: boolean;
        enableInlineTypes: boolean;
        allowExtraFields: boolean;
        omitUndefined: boolean;
        relativePackagePath: string;
        relativeTestPath: string;
        generateReadWriteOnlyTypes: boolean;
    }
}

export class ExpressContextImpl implements ExpressContext {
    public readonly logger: Logger;
    public readonly sourceFile: SourceFile;
    public readonly externalDependencies: ExternalDependencies;
    public readonly coreUtilities: CoreUtilities;
    public readonly fernConstants: FernIr.Constants;
    public readonly includeSerdeLayer: boolean;

    public readonly type: TypeContextImpl;
    public readonly typeSchema: TypeSchemaContextImpl;

    public readonly expressInlinedRequestBody: ExpressInlinedRequestBodyContextImpl;
    public readonly expressInlinedRequestBodySchema: ExpressInlinedRequestBodySchemaContextImpl;
    public readonly expressEndpointTypeSchemas: ExpressEndpointTypeSchemasContextImpl;
    public readonly expressService: ExpressServiceContextImpl;
    public readonly expressError: ExpressErrorContextImpl;
    public readonly genericAPIExpressError: GenericAPIExpressErrorContext;
    public readonly expressRegister: ExpressRegisterContext;
    public readonly expressErrorSchema: ExpressErrorSchemaContext;
    public readonly jsonContext: JsonContext;

    constructor({
        logger,
        typeResolver,
        typeGenerator,
        typeDeclarationReferencer,
        typeSchemaDeclarationReferencer,
        typeSchemaGenerator,
        typeReferenceExampleGenerator,
        expressInlinedRequestBodyDeclarationReferencer,
        expressInlinedRequestBodyGenerator,
        expressEndpointSchemaDeclarationReferencer,
        expressEndpointTypeSchemasGenerator,
        expressInlinedRequestBodySchemaDeclarationReferencer,
        expressInlinedRequestBodySchemaGenerator,
        packageResolver,
        expressServiceGenerator,
        expressServiceDeclarationReferencer,
        errorDeclarationReferencer,
        errorResolver,
        expressErrorGenerator,
        genericAPIExpressErrorDeclarationReferencer,
        genericAPIExpressErrorGenerator,
        treatUnknownAsAny,
        sourceFile,
        importsManager,
        exportsManager,
        dependencyManager,
        coreUtilitiesManager,
        fernConstants,
        expressRegisterGenerator,
        expressErrorSchemaDeclarationReferencer,
        jsonDeclarationReferencer,
        expressErrorSchemaGenerator,
        includeSerdeLayer,
        retainOriginalCasing,
        enableInlineTypes,
        allowExtraFields,
        omitUndefined,
        useBigInt,
        relativePackagePath,
        relativeTestPath,
        generateReadWriteOnlyTypes
    }: ExpressContextImpl.Init) {
        this.logger = logger;
        this.includeSerdeLayer = includeSerdeLayer;
        this.sourceFile = sourceFile;
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

        this.type = new TypeContextImpl({
            sourceFile,
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
        this.jsonContext = new JsonContextImpl({
            importsManager,
            exportsManager,
            jsonDeclarationReferencer,
            sourceFile
        });
        this.expressInlinedRequestBody = new ExpressInlinedRequestBodyContextImpl({
            expressInlinedRequestBodyDeclarationReferencer,
            expressInlinedRequestBodyGenerator,
            packageResolver,
            sourceFile: this.sourceFile,
            importsManager,
            exportsManager,
            retainOriginalCasing,
            includeSerdeLayer
        });
        this.expressInlinedRequestBodySchema = new ExpressInlinedRequestBodySchemaContextImpl({
            packageResolver,
            importsManager,
            exportsManager,
            sourceFile,
            expressInlinedRequestBodySchemaGenerator,
            expressInlinedRequestBodySchemaDeclarationReferencer
        });
        this.expressEndpointTypeSchemas = new ExpressEndpointTypeSchemasContextImpl({
            packageResolver,
            expressEndpointTypeSchemasGenerator,
            expressEndpointSchemaDeclarationReferencer,
            importsManager,
            exportsManager,
            sourceFile
        });
        this.expressService = new ExpressServiceContextImpl({
            packageResolver,
            expressServiceGenerator,
            expressServiceDeclarationReferencer,
            importsManager,
            exportsManager,
            sourceFile
        });
        this.expressError = new ExpressErrorContextImpl({
            sourceFile,
            importsManager,
            errorDeclarationReferencer,
            expressErrorGenerator,
            errorResolver,
            exportsManager
        });
        this.expressErrorSchema = new ExpressErrorSchemaContextImpl({
            sourceFile,
            importsManager,
            expressErrorSchemaGenerator,
            expressErrorSchemaDeclarationReferencer,
            errorResolver,
            coreUtilities: this.coreUtilities,
            exportsManager
        });
        this.genericAPIExpressError = new GenericAPIExpressErrorContextImpl({
            genericAPIExpressErrorDeclarationReferencer,
            genericAPIExpressErrorGenerator,
            importsManager,
            exportsManager,
            sourceFile: this.sourceFile
        });
        this.expressRegister = new ExpressRegisterContextImpl({
            expressRegisterGenerator
        });
    }
}
