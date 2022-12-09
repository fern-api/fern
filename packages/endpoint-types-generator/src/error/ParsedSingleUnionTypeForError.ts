import { ErrorDeclaration } from "@fern-fern/ir-model/errors";
import { ErrorDiscriminationStrategy } from "@fern-fern/ir-model/ir";
import { ResponseError } from "@fern-fern/ir-model/services/commons";
import { EndpointTypesContext } from "@fern-typescript/contexts";
import { ErrorResolver } from "@fern-typescript/resolvers";
import {
    AbstractKnownSingleUnionType,
    NoPropertiesSingleUnionTypeGenerator,
    SinglePropertySingleUnionTypeGenerator,
    SingleUnionTypeGenerator,
} from "@fern-typescript/union-generator";

export declare namespace ParsedSingleUnionTypeForError {
    export interface Init {
        error: ResponseError;
        errorResolver: ErrorResolver;
        errorDiscriminationStrategy: ErrorDiscriminationStrategy;
    }
}

export class ParsedSingleUnionTypeForError extends AbstractKnownSingleUnionType<EndpointTypesContext> {
    private errorDeclaration: ErrorDeclaration;
    private responseError: ResponseError;
    private errorDiscriminationStrategy: ErrorDiscriminationStrategy;

    constructor({ error, errorDiscriminationStrategy, errorResolver }: ParsedSingleUnionTypeForError.Init) {
        const errorDeclaration = errorResolver.getErrorDeclarationFromName(error.error);
        super({
            singleUnionType: getSingleUnionTypeGenerator({ error, errorDiscriminationStrategy, errorDeclaration }),
        });

        this.errorDiscriminationStrategy = errorDiscriminationStrategy;
        this.responseError = error;
        this.errorDeclaration = errorDeclaration;
    }

    public getDocs(): string | null | undefined {
        return this.responseError.docs;
    }

    public getInterfaceName(): string {
        return this.errorDeclaration.discriminantValueV4.name.unsafeName.pascalCase;
    }

    public getDiscriminantValue(): string | number {
        return ErrorDiscriminationStrategy._visit<string | number>(this.errorDiscriminationStrategy, {
            property: () => this.errorDeclaration.discriminantValueV4.wireValue,
            statusCode: () => this.errorDeclaration.statusCode,
            _unknown: () => {
                throw new Error("Unknown ErrorDiscriminationStrategy: " + this.errorDiscriminationStrategy.type);
            },
        });
    }

    public getBuilderName(): string {
        return this.errorDeclaration.discriminantValueV4.name.unsafeName.camelCase;
    }

    public getVisitorKey(): string {
        return this.errorDeclaration.discriminantValueV4.name.unsafeName.camelCase;
    }
}

const CONTENT_PROPERTY_FOR_STATUS_CODE_DISCRIMINATED_ERRORS = "content";

function getSingleUnionTypeGenerator({
    error,
    errorDiscriminationStrategy,
    errorDeclaration,
}: {
    error: ResponseError;
    errorDiscriminationStrategy: ErrorDiscriminationStrategy;
    errorDeclaration: ErrorDeclaration;
}): SingleUnionTypeGenerator<EndpointTypesContext> {
    if (errorDeclaration.typeV2 == null) {
        return new NoPropertiesSingleUnionTypeGenerator();
    }

    const propertyName = ErrorDiscriminationStrategy._visit(errorDiscriminationStrategy, {
        property: ({ contentProperty }) => contentProperty.name.unsafeName.camelCase,
        statusCode: () => CONTENT_PROPERTY_FOR_STATUS_CODE_DISCRIMINATED_ERRORS,
        _unknown: () => {
            throw new Error("Unknown ErrorDiscriminationStrategy: " + errorDiscriminationStrategy.type);
        },
    });

    return new SinglePropertySingleUnionTypeGenerator<EndpointTypesContext>({
        propertyName,
        getReferenceToPropertyType: (context) => {
            const typeNode = context.error.getReferenceToError(error.error).getTypeNode();
            return {
                isOptional: false,
                typeNode,
                typeNodeWithoutUndefined: typeNode,
            };
        },
    });
}
