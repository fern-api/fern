import { HttpEndpoint } from "@fern-fern/ir-model/services/http";
import { ErrorResolver } from "@fern-typescript/resolvers";
import { EndpointTypeSchemasContext } from "@fern-typescript/sdk-declaration-handler";
import { GeneratedUnionSchema, RawNoPropertiesSingleUnionType } from "@fern-typescript/union-schema-generator";
import { EndpointTypesContextImpl } from "./EndpointTypesContextImpl";
import { RawSinglePropertyErrorSingleUnionType } from "./RawSinglePropertyErrorSingleUnionType";

export declare namespace GeneratedEndpointErrorSchema {
    export interface Init {
        endpoint: HttpEndpoint;
        errorResolver: ErrorResolver;
    }
}

export class GeneratedEndpointErrorSchema {
    private static ERROR_SCHEMA_NAME = "Error";

    private generatedErrorUnionSchema: GeneratedUnionSchema<EndpointTypeSchemasContext>;

    constructor({ endpoint, errorResolver }: GeneratedEndpointErrorSchema.Init) {
        const discriminant = endpoint.errorsV2.discriminant;
        this.generatedErrorUnionSchema = new GeneratedUnionSchema<EndpointTypeSchemasContext>({
            discriminant,
            getParsedDiscriminant: (context) => context.getEndpointTypesBeingGenerated().getErrorUnion().discriminant,
            getReferenceToParsedUnion: (context) =>
                context
                    .getEndpointTypesBeingGenerated()
                    .getErrorUnion()
                    .getReferenceTo(new EndpointTypesContextImpl({ endpointTypeSchemaContext: context })),
            buildParsedUnion: ({ discriminantValueToBuild, existingValue, context }) =>
                context
                    .getEndpointTypesBeingGenerated()
                    .getErrorUnion()
                    .buildFromExistingValue({
                        discriminantValueToBuild,
                        existingValue,
                        context: new EndpointTypesContextImpl({ endpointTypeSchemaContext: context }),
                    }),
            singleUnionTypes: endpoint.errors.map((responseError) => {
                const errorDeclaration = errorResolver.getErrorDeclarationFromName(responseError.error);
                if (errorDeclaration.typeV2 == null) {
                    return new RawNoPropertiesSingleUnionType({
                        discriminant,
                        discriminantValue: errorDeclaration.discriminantValue,
                    });
                } else {
                    return new RawSinglePropertyErrorSingleUnionType({
                        discriminant,
                        discriminantValue: errorDeclaration.discriminantValue,
                        errorName: responseError.error,
                    });
                }
            }),

            typeName: GeneratedEndpointErrorSchema.ERROR_SCHEMA_NAME,
        });
    }

    public writeToFile(context: EndpointTypeSchemasContext): void {
        this.generatedErrorUnionSchema.writeSchemaToFile(context);
    }
}
