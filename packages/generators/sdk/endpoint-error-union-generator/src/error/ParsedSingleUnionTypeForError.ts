import { ErrorDeclaration } from "@fern-fern/ir-model/errors";
import { ResponseError } from "@fern-fern/ir-model/http";
import { ErrorDiscriminationStrategy } from "@fern-fern/ir-model/ir";
import { SdkContext } from "@fern-typescript/contexts";
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

export class ParsedSingleUnionTypeForError extends AbstractKnownSingleUnionType<SdkContext> {
    private errorDeclaration: ErrorDeclaration;
    private responseError: ResponseError;
    private errorDiscriminationStrategy: ErrorDiscriminationStrategy;

    constructor({ error, errorDiscriminationStrategy, errorResolver }: ParsedSingleUnionTypeForError.Init) {
        const errorDeclaration = errorResolver.getErrorDeclarationFromName(error.error);
        super({
            singleUnionType: getSingleUnionTypeGenerator({ errorDiscriminationStrategy, errorDeclaration }),
            includeUtilsOnUnionMembers: true,
        });

        this.errorDiscriminationStrategy = errorDiscriminationStrategy;
        this.responseError = error;
        this.errorDeclaration = errorDeclaration;
    }

    public getDocs(): string | null | undefined {
        return this.responseError.docs;
    }

    public getInterfaceName(): string {
        return this.errorDeclaration.discriminantValue.name.pascalCase.unsafeName;
    }

    public getDiscriminantValue(): string | number {
        return ErrorDiscriminationStrategy._visit<string | number>(this.errorDiscriminationStrategy, {
            property: () => this.errorDeclaration.discriminantValue.wireValue,
            statusCode: () => this.errorDeclaration.statusCode,
            _unknown: () => {
                throw new Error("Unknown ErrorDiscriminationStrategy: " + this.errorDiscriminationStrategy.type);
            },
        });
    }

    public getBuilderName(): string {
        return this.errorDeclaration.discriminantValue.name.camelCase.unsafeName;
    }

    public getVisitorKey(): string {
        return this.errorDeclaration.discriminantValue.name.camelCase.unsafeName;
    }
}

const CONTENT_PROPERTY_FOR_STATUS_CODE_DISCRIMINATED_ERRORS = "content";

function getSingleUnionTypeGenerator({
    errorDiscriminationStrategy,
    errorDeclaration,
}: {
    errorDiscriminationStrategy: ErrorDiscriminationStrategy;
    errorDeclaration: ErrorDeclaration;
}): SingleUnionTypeGenerator<SdkContext> {
    if (errorDeclaration.type == null) {
        return new NoPropertiesSingleUnionTypeGenerator();
    }
    const { type } = errorDeclaration;

    const propertyName = ErrorDiscriminationStrategy._visit(errorDiscriminationStrategy, {
        property: ({ contentProperty }) => contentProperty.name.camelCase.unsafeName,
        statusCode: () => CONTENT_PROPERTY_FOR_STATUS_CODE_DISCRIMINATED_ERRORS,
        _unknown: () => {
            throw new Error("Unknown ErrorDiscriminationStrategy: " + errorDiscriminationStrategy.type);
        },
    });

    return new SinglePropertySingleUnionTypeGenerator<SdkContext>({
        propertyName,
        getReferenceToPropertyType: (context) => context.type.getReferenceToType(type),
    });
}
