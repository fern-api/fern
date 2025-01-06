import { PackageId, Zurg } from "@fern-typescript/commons";
import { GeneratedUnion, SdkContext } from "@fern-typescript/contexts";
import { ErrorResolver } from "@fern-typescript/resolvers";
import { GeneratedUnionSchema, RawNoPropertiesSingleUnionType } from "@fern-typescript/union-schema-generator";
import { ts } from "ts-morph";

import { ErrorDiscriminationByPropertyStrategy, HttpEndpoint } from "@fern-fern/ir-sdk/api";

import { GeneratedEndpointErrorSchema } from "./GeneratedEndpointErrorSchema";
import { RawSinglePropertyErrorSingleUnionType } from "./RawSinglePropertyErrorSingleUnionType";

export declare namespace GeneratedEndpointErrorSchemaImpl {
    export interface Init {
        packageId: PackageId;
        endpoint: HttpEndpoint;
        errorResolver: ErrorResolver;
        discriminationStrategy: ErrorDiscriminationByPropertyStrategy;
    }
}

export class GeneratedEndpointErrorSchemaImpl implements GeneratedEndpointErrorSchema {
    private static ERROR_SCHEMA_NAME = "Error";

    private packageId: PackageId;
    private endpoint: HttpEndpoint;
    private GeneratedSdkErrorUnionSchema: GeneratedUnionSchema<SdkContext>;

    constructor({ packageId, endpoint, errorResolver, discriminationStrategy }: GeneratedEndpointErrorSchemaImpl.Init) {
        this.packageId = packageId;
        this.endpoint = endpoint;

        this.GeneratedSdkErrorUnionSchema = new GeneratedUnionSchema<SdkContext>({
            typeName: GeneratedEndpointErrorSchemaImpl.ERROR_SCHEMA_NAME,
            shouldIncludeDefaultCaseInTransform: false,
            includeUtilsOnUnionMembers: true,
            discriminant: discriminationStrategy.discriminant,
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
                        discriminantValue: errorDeclaration.discriminantValue
                    });
                } else {
                    return new RawSinglePropertyErrorSingleUnionType({
                        discriminant: discriminationStrategy.discriminant,
                        discriminantValue: errorDeclaration.discriminantValue,
                        errorName: responseError.error,
                        discriminationStrategy
                    });
                }
            })
        });
    }

    public writeToFile(context: SdkContext): void {
        this.GeneratedSdkErrorUnionSchema.writeSchemaToFile(context);
    }

    public getReferenceToRawShape(context: SdkContext): ts.TypeNode {
        return this.GeneratedSdkErrorUnionSchema.getReferenceToRawShape(context);
    }

    public getReferenceToZurgSchema(context: SdkContext): Zurg.Schema {
        return this.GeneratedSdkErrorUnionSchema.getReferenceToZurgSchema(context);
    }

    private getErrorUnion(context: SdkContext): GeneratedUnion<SdkContext> {
        return context.endpointErrorUnion
            .getGeneratedEndpointErrorUnion(this.packageId, this.endpoint.name)
            .getErrorUnion();
    }
}
