import { SdkContext } from "@fern-typescript/contexts";
import { ErrorResolver } from "@fern-typescript/resolvers";
import {
    AbstractKnownSingleUnionType,
    NoPropertiesSingleUnionTypeGenerator,
    SinglePropertySingleUnionTypeGenerator,
    SingleUnionTypeGenerator
} from "@fern-typescript/union-generator";

import { ErrorDeclaration, ErrorDiscriminationStrategy, ResponseError } from "@fern-fern/ir-sdk/api";

export declare namespace ParsedSingleUnionTypeForError {
    export interface Init {
        error: ResponseError;
        errorResolver: ErrorResolver;
        errorDiscriminationStrategy: ErrorDiscriminationStrategy;
        includeUtilsOnUnionMembers: boolean;
        noOptionalProperties: boolean;
        retainOriginalCasing: boolean;
        enableInlineTypes: boolean;
    }
}

export class ParsedSingleUnionTypeForError extends AbstractKnownSingleUnionType<SdkContext> {
    private errorDeclaration: ErrorDeclaration;
    private responseError: ResponseError;
    private errorDiscriminationStrategy: ErrorDiscriminationStrategy;
    private retainOriginalCasing: boolean;

    constructor({
        error,
        errorDiscriminationStrategy,
        errorResolver,
        includeUtilsOnUnionMembers,
        noOptionalProperties,
        retainOriginalCasing,
        enableInlineTypes
    }: ParsedSingleUnionTypeForError.Init) {
        const errorDeclaration = errorResolver.getErrorDeclarationFromName(error.error);
        super({
            singleUnionType: getSingleUnionTypeGenerator({
                errorDiscriminationStrategy,
                errorDeclaration,
                noOptionalProperties,
                retainOriginalCasing,
                enableInlineTypes
            }),
            includeUtilsOnUnionMembers
        });

        this.errorDiscriminationStrategy = errorDiscriminationStrategy;
        this.responseError = error;
        this.errorDeclaration = errorDeclaration;
        this.retainOriginalCasing = retainOriginalCasing;
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
            _other: () => {
                throw new Error("Unknown ErrorDiscriminationStrategy: " + this.errorDiscriminationStrategy.type);
            }
        });
    }

    public getBuilderName(): string {
        return this.retainOriginalCasing
            ? this.errorDeclaration.discriminantValue.name.originalName
            : this.errorDeclaration.discriminantValue.name.camelCase.unsafeName;
    }

    public getVisitorKey(): string {
        return this.retainOriginalCasing
            ? this.errorDeclaration.discriminantValue.name.originalName
            : this.errorDeclaration.discriminantValue.name.camelCase.unsafeName;
    }
}

const CONTENT_PROPERTY_FOR_STATUS_CODE_DISCRIMINATED_ERRORS = "content";

function getSingleUnionTypeGenerator({
    errorDiscriminationStrategy,
    errorDeclaration,
    noOptionalProperties,
    retainOriginalCasing,
    enableInlineTypes
}: {
    errorDiscriminationStrategy: ErrorDiscriminationStrategy;
    errorDeclaration: ErrorDeclaration;
    noOptionalProperties: boolean;
    retainOriginalCasing: boolean;
    enableInlineTypes: boolean;
}): SingleUnionTypeGenerator<SdkContext> {
    if (errorDeclaration.type == null) {
        return new NoPropertiesSingleUnionTypeGenerator();
    }
    const { type } = errorDeclaration;

    const propertyName = ErrorDiscriminationStrategy._visit(errorDiscriminationStrategy, {
        property: ({ contentProperty }) =>
            retainOriginalCasing ? contentProperty.name.originalName : contentProperty.name.camelCase.unsafeName,
        statusCode: () => CONTENT_PROPERTY_FOR_STATUS_CODE_DISCRIMINATED_ERRORS,
        _other: () => {
            throw new Error("Unknown ErrorDiscriminationStrategy: " + errorDiscriminationStrategy.type);
        }
    });

    return new SinglePropertySingleUnionTypeGenerator<SdkContext>({
        propertyName,
        getReferenceToPropertyType: (context) => context.type.getReferenceToType(type),
        getReferenceToPropertyTypeForInlineUnion: (context) => context.type.getReferenceToTypeForInlineUnion(type),
        noOptionalProperties,
        enableInlineTypes
    });
}
