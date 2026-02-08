import { FernIr } from "@fern-fern/ir-sdk";
import { SdkContext } from "@fern-typescript/contexts";
import { ErrorResolver } from "@fern-typescript/resolvers";
import {
    AbstractKnownSingleUnionType,
    NoPropertiesSingleUnionTypeGenerator,
    SinglePropertySingleUnionTypeGenerator,
    SingleUnionTypeGenerator
} from "@fern-typescript/union-generator";

export declare namespace ParsedSingleUnionTypeForError {
    export interface Init {
        error: FernIr.ResponseError;
        errorResolver: ErrorResolver;
        errorDiscriminationStrategy: FernIr.ErrorDiscriminationStrategy;
        includeUtilsOnUnionMembers: boolean;
        noOptionalProperties: boolean;
        retainOriginalCasing: boolean;
        enableInlineTypes: boolean;
        generateReadWriteOnlyTypes: boolean;
    }
}

export class ParsedSingleUnionTypeForError extends AbstractKnownSingleUnionType<SdkContext> {
    private errorDeclaration: FernIr.ErrorDeclaration;
    private responseError: FernIr.ResponseError;
    private errorDiscriminationStrategy: FernIr.ErrorDiscriminationStrategy;
    private retainOriginalCasing: boolean;

    constructor({
        error,
        errorDiscriminationStrategy,
        errorResolver,
        includeUtilsOnUnionMembers,
        noOptionalProperties,
        retainOriginalCasing,
        enableInlineTypes,
        generateReadWriteOnlyTypes
    }: ParsedSingleUnionTypeForError.Init) {
        const errorDeclaration = errorResolver.getErrorDeclarationFromName(error.error);
        super({
            singleUnionType: getSingleUnionTypeGenerator({
                getTypeName: () => this.getTypeName(),
                errorDiscriminationStrategy,
                errorDeclaration,
                noOptionalProperties,
                retainOriginalCasing,
                enableInlineTypes,
                generateReadWriteOnlyTypes
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

    public getTypeName(): string {
        return this.errorDeclaration.discriminantValue.name.pascalCase.unsafeName;
    }

    public getDiscriminantValue(): string | number {
        return FernIr.ErrorDiscriminationStrategy._visit<string | number>(this.errorDiscriminationStrategy, {
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

    public needsRequestResponse(): { request: boolean; response: boolean } {
        return {
            request: false,
            response: false
        };
    }
}

const CONTENT_PROPERTY_FOR_STATUS_CODE_DISCRIMINATED_ERRORS = "content";

function getSingleUnionTypeGenerator({
    errorDiscriminationStrategy,
    errorDeclaration,
    noOptionalProperties,
    retainOriginalCasing,
    enableInlineTypes,
    getTypeName,
    generateReadWriteOnlyTypes
}: {
    errorDiscriminationStrategy: FernIr.ErrorDiscriminationStrategy;
    errorDeclaration: FernIr.ErrorDeclaration;
    noOptionalProperties: boolean;
    retainOriginalCasing: boolean;
    enableInlineTypes: boolean;
    getTypeName: () => string;
    generateReadWriteOnlyTypes: boolean;
}): SingleUnionTypeGenerator<SdkContext> {
    if (errorDeclaration.type == null) {
        return new NoPropertiesSingleUnionTypeGenerator();
    }
    const { type } = errorDeclaration;

    const propertyName = FernIr.ErrorDiscriminationStrategy._visit(errorDiscriminationStrategy, {
        property: ({ contentProperty }) =>
            retainOriginalCasing ? contentProperty.name.originalName : contentProperty.name.camelCase.unsafeName,
        statusCode: () => CONTENT_PROPERTY_FOR_STATUS_CODE_DISCRIMINATED_ERRORS,
        _other: () => {
            throw new Error("Unknown ErrorDiscriminationStrategy: " + errorDiscriminationStrategy.type);
        }
    });

    return new SinglePropertySingleUnionTypeGenerator<SdkContext>({
        getTypeName,
        propertyName,
        getReferenceToPropertyType: (context) => context.type.getReferenceToType(type),
        getReferenceToPropertyTypeForInlineUnion: (context) => context.type.getReferenceToTypeForInlineUnion(type),
        noOptionalProperties,
        enableInlineTypes,
        generateReadWriteOnlyTypes
    });
}
