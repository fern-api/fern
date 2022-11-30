import { WireStringWithAllCasings } from "@fern-fern/ir-model/commons";
import { ResponseErrorShape, ResponseErrorsV2, ResponseErrorV2 } from "@fern-fern/ir-model/services/commons";
import { EndpointTypesContext } from "@fern-typescript/sdk-declaration-handler";
import {
    AbstractParsedSingleUnionType,
    NoPropertiesSingleUnionTypeGenerator,
    SinglePropertySingleUnionTypeGenerator,
    SingleUnionTypeGenerator,
} from "@fern-typescript/union-generator";

export declare namespace ParsedSingleUnionTypeForError {
    export interface Init {
        errors: ResponseErrorsV2;
        error: ResponseErrorV2;
    }
}

export class ParsedSingleUnionTypeForError extends AbstractParsedSingleUnionType<EndpointTypesContext> {
    protected errors: ResponseErrorsV2;
    protected error: ResponseErrorV2;

    constructor({ error, errors }: ParsedSingleUnionTypeForError.Init) {
        super(
            ResponseErrorShape._visit<SingleUnionTypeGenerator<EndpointTypesContext>>(error.shape, {
                noProperties: () => new NoPropertiesSingleUnionTypeGenerator(),
                singleProperty: (singleProperty) =>
                    new SinglePropertySingleUnionTypeGenerator<EndpointTypesContext>({
                        propertyName: singleProperty.name.camelCase,
                        getReferenceToPropertyType: (context) => {
                            const typeNode = context.error.getReferenceToError(singleProperty.error).getTypeNode();
                            return {
                                isOptional: false,
                                typeNode,
                                typeNodeWithoutUndefined: typeNode,
                            };
                        },
                    }),
                _unknown: () => {
                    throw new Error("Unknown ResponseErrorShape: " + error.shape.type);
                },
            })
        );

        this.error = error;
        this.errors = errors;
    }

    public getDocs(): string | null | undefined {
        return this.error.docs;
    }

    public getInterfaceName(): string {
        return this.error.discriminantValue.pascalCase;
    }

    public getDiscriminantValue(): string {
        return this.error.discriminantValue.wireValue;
    }

    public getBuilderName(): string {
        return this.error.discriminantValue.camelCase;
    }

    public getVisitorKey(): string {
        return this.error.discriminantValue.camelCase;
    }

    protected override getDiscriminant(): WireStringWithAllCasings {
        return this.errors.discriminant;
    }
}
