import { CaseConverter } from "@fern-api/base-generator";
import { FernIr } from "@fern-fern/ir-sdk";
import { PackageId, Zurg } from "@fern-typescript/commons";
import { FileContext, GeneratedUnion } from "@fern-typescript/contexts";
import { ErrorResolver } from "@fern-typescript/resolvers";
import { GeneratedUnionSchema, RawNoPropertiesSingleUnionType } from "@fern-typescript/union-schema-generator";
import { ts } from "ts-morph";

import { GeneratedEndpointErrorSchema } from "./GeneratedEndpointErrorSchema.js";
import { RawSinglePropertyErrorSingleUnionType } from "./RawSinglePropertyErrorSingleUnionType.js";

export declare namespace GeneratedEndpointErrorSchemaImpl {
    export interface Init {
        packageId: PackageId;
        endpoint: FernIr.HttpEndpoint;
        errorResolver: ErrorResolver;
        discriminationStrategy: FernIr.ErrorDiscriminationByPropertyStrategy;
        caseConverter: CaseConverter;
    }
}

export class GeneratedEndpointErrorSchemaImpl implements GeneratedEndpointErrorSchema {
    private static ERROR_SCHEMA_NAME = "Error";

    private packageId: PackageId;
    private endpoint: FernIr.HttpEndpoint;
    private GeneratedSdkErrorUnionSchema: GeneratedUnionSchema<FileContext>;

    constructor({
        packageId,
        endpoint,
        errorResolver,
        discriminationStrategy,
        caseConverter
    }: GeneratedEndpointErrorSchemaImpl.Init) {
        this.packageId = packageId;
        this.endpoint = endpoint;

        this.GeneratedSdkErrorUnionSchema = new GeneratedUnionSchema<FileContext>({
            shape: undefined,
            typeName: GeneratedEndpointErrorSchemaImpl.ERROR_SCHEMA_NAME,
            shouldIncludeDefaultCaseInTransform: false,
            includeUtilsOnUnionMembers: true,
            discriminant: discriminationStrategy.discriminant,
            caseConverter,
            getReferenceToSchema: (context) =>
                context.sdkEndpointTypeSchemas.getReferenceToEndpointTypeSchemaExport(
                    packageId,
                    endpoint.name,
                    GeneratedEndpointErrorSchemaImpl.ERROR_SCHEMA_NAME
                ),
            getGeneratedUnion: (context) => this.getErrorUnion(context),
            singleUnionTypes: endpoint.errors.map((responseError) => {
                const errorDeclaration = errorResolver.getErrorDeclarationFromName(responseError.error);
                if (errorDeclaration.type == null) {
                    return new RawNoPropertiesSingleUnionType({
                        discriminant: discriminationStrategy.discriminant,
                        discriminantValue: errorDeclaration.discriminantValue,
                        caseConverter
                    });
                } else {
                    return new RawSinglePropertyErrorSingleUnionType({
                        discriminant: discriminationStrategy.discriminant,
                        discriminantValue: errorDeclaration.discriminantValue,
                        errorName: responseError.error,
                        discriminationStrategy,
                        caseConverter
                    });
                }
            })
        });
    }

    public writeToFile(context: FileContext): void {
        this.GeneratedSdkErrorUnionSchema.writeSchemaToFile(context);
    }

    public getReferenceToRawShape(context: FileContext): ts.TypeNode {
        return this.GeneratedSdkErrorUnionSchema.getReferenceToRawShape(context);
    }

    public getReferenceToZurgSchema(context: FileContext): Zurg.Schema {
        return this.GeneratedSdkErrorUnionSchema.getReferenceToZurgSchema(context);
    }

    private getErrorUnion(context: FileContext): GeneratedUnion<FileContext> {
        return context.endpointErrorUnion
            .getGeneratedEndpointErrorUnion(this.packageId, this.endpoint.name)
            .getErrorUnion();
    }
}
