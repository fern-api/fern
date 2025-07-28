import {
    CoreUtilitiesManager,
    DependencyManager,
    ExportsManager,
    ExternalDependencies,
    ImportsManager,
    createExternalDependencies
} from "@fern-typescript/commons";
import { CoreUtilities } from "@fern-typescript/commons/src/core-utilities/CoreUtilities";
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

import { Logger } from "@fern-api/logger";

import { Constants } from "@fern-fern/ir-sdk";

import { EndpointDeclarationReferencer } from "../declaration-referencers/EndpointDeclarationReferencer";
import { ExpressErrorDeclarationReferencer } from "../declaration-referencers/ExpressErrorDeclarationReferencer";
import { ExpressInlinedRequestBodyDeclarationReferencer } from "../declaration-referencers/ExpressInlinedRequestBodyDeclarationReferencer";
import { ExpressServiceDeclarationReferencer } from "../declaration-referencers/ExpressServiceDeclarationReferencer";
import { GenericAPIExpressErrorDeclarationReferencer } from "../declaration-referencers/GenericAPIExpressErrorDeclarationReferencer";
import { JsonDeclarationReferencer } from "../declaration-referencers/JsonDeclarationReferencer";
import { TypeDeclarationReferencer } from "../declaration-referencers/TypeDeclarationReferencer";
import { ExpressEndpointTypeSchemasContextImpl } from "./express-endpoint-type-schemas/ExpressEndpointTypeSchemasContextImpl";
import { ExpressErrorSchemaContextImpl } from "./express-error-schema/ExpressErrorSchemaContextImpl";
import { ExpressErrorContextImpl } from "./express-error/ExpressErrorContextImpl";
import { ExpressInlinedRequestBodySchemaContextImpl } from "./express-inlined-request-body-schema/ExpressInlinedRequestBodySchemaContextImpl";
import { ExpressInlinedRequestBodyContextImpl } from "./express-inlined-request-body/ExpressInlinedRequestBodyContextImpl.ts";
import { ExpressRegisterContextImpl } from "./express-register/ExpressRegisterContextImpl.ts";
import { ExpressServiceContextImpl } from "./express-service/ExpressServiceContextImpl.ts";
import { GenericAPIExpressErrorContextImpl } from "./generic-api-express-error/GenericAPIExpressErrorContextImpl";
import { JsonContextImpl } from "./json/JsonContextImpl";
import { TypeSchemaContextImpl } from "./type-schema/TypeSchemaContextImpl";
import { TypeContextImpl } from "./type/TypeContextImpl";

export declare namespace ExpressContextImpl {
    export interface Init {
        logger: Logger;
        sourceFile: SourceFile;
        importsManager: ImportsManager;
        exportsManager: ExportsManager;
        dependencyManager: DependencyManager;
        coreUtilitiesManager: CoreUtilitiesManager;
        fernConstants: Constants;

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
    }
}

export class ExpressContextImpl implements ExpressContext {
    public readonly logger: Logger;
    public readonly sourceFile: SourceFile;
    public readonly externalDependencies: ExternalDependencies;
    public readonly coreUtilities: CoreUtilities;
    public readonly fernConstants: Constants;
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
        relativeTestPath
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
            context: this
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
            omitUndefined
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
