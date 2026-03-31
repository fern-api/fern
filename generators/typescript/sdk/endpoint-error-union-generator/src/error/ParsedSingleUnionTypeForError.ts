import { CaseConverter, getOriginalName, getWireValue } from "@fern-api/base-generator";
import { FernIr } from "@fern-fern/ir-sdk";
import { FileContext } from "@fern-typescript/contexts";
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
        caseConverter: CaseConverter;
    }
}

export class ParsedSingleUnionTypeForError extends AbstractKnownSingleUnionType<FileContext> {
    private errorDeclaration: FernIr.ErrorDeclaration;
    private responseError: FernIr.ResponseError;
    private errorDiscriminationStrategy: FernIr.ErrorDiscriminationStrategy;
    private retainOriginalCasing: boolean;
    private caseConverter: CaseConverter;

    constructor({
        error,
        errorDiscriminationStrategy,
        errorResolver,
        includeUtilsOnUnionMembers,
        noOptionalProperties,
        retainOriginalCasing,
        enableInlineTypes,
        generateReadWriteOnlyTypes,
        caseConverter
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
                generateReadWriteOnlyTypes,
                caseConverter
            }),
            includeUtilsOnUnionMembers
        });

        this.errorDiscriminationStrategy = errorDiscriminationStrategy;
        this.responseError = error;
        this.errorDeclaration = errorDeclaration;
        this.retainOriginalCasing = retainOriginalCasing;
        this.caseConverter = caseConverter;
    }

    public getDocs(): string | null | undefined {
        return this.responseError.docs;
    }

    public getTypeName(): string {
        return sanitizeIdentifier(this.caseConverter.pascalUnsafe(this.errorDeclaration.discriminantValue));
    }

    public getDiscriminantValue(): string | number {
        return FernIr.ErrorDiscriminationStrategy._visit<string | number>(this.errorDiscriminationStrategy, {
            property: () => getWireValue(this.errorDeclaration.discriminantValue),
            statusCode: () => this.errorDeclaration.statusCode,
            _other: () => {
                throw new Error("Unknown ErrorDiscriminationStrategy: " + this.errorDiscriminationStrategy.type);
            }
        });
    }

    public getBuilderName(): string {
        return this.retainOriginalCasing
            ? sanitizeIdentifier(getOriginalName(this.errorDeclaration.discriminantValue))
            : sanitizeIdentifier(this.caseConverter.camelUnsafe(this.errorDeclaration.discriminantValue));
    }

    public getVisitorKey(): string {
        return this.retainOriginalCasing
            ? sanitizeIdentifier(getOriginalName(this.errorDeclaration.discriminantValue))
            : sanitizeIdentifier(this.caseConverter.camelUnsafe(this.errorDeclaration.discriminantValue));
    }

    public needsRequestResponse(): { request: boolean; response: boolean } {
        return {
            request: false,
            response: false
        };
    }
}

const CONTENT_PROPERTY_FOR_STATUS_CODE_DISCRIMINATED_ERRORS = "content";

const STARTS_WITH_DIGIT = /^\d/;

function sanitizeIdentifier(name: string): string {
    if (STARTS_WITH_DIGIT.test(name)) {
        return `_${name}`;
    }
    return name;
}

function getSingleUnionTypeGenerator({
    errorDiscriminationStrategy,
    errorDeclaration,
    noOptionalProperties,
    retainOriginalCasing,
    enableInlineTypes,
    getTypeName,
    generateReadWriteOnlyTypes,
    caseConverter
}: {
    errorDiscriminationStrategy: FernIr.ErrorDiscriminationStrategy;
    errorDeclaration: FernIr.ErrorDeclaration;
    noOptionalProperties: boolean;
    retainOriginalCasing: boolean;
    enableInlineTypes: boolean;
    getTypeName: () => string;
    generateReadWriteOnlyTypes: boolean;
    caseConverter: CaseConverter;
}): SingleUnionTypeGenerator<FileContext> {
    if (errorDeclaration.type == null) {
        return new NoPropertiesSingleUnionTypeGenerator();
    }
    const { type } = errorDeclaration;

    const propertyName = FernIr.ErrorDiscriminationStrategy._visit(errorDiscriminationStrategy, {
        property: ({ contentProperty }) =>
            retainOriginalCasing ? getWireValue(contentProperty) : caseConverter.camelUnsafe(contentProperty),
        statusCode: () => CONTENT_PROPERTY_FOR_STATUS_CODE_DISCRIMINATED_ERRORS,
        _other: () => {
            throw new Error("Unknown ErrorDiscriminationStrategy: " + errorDiscriminationStrategy.type);
        }
    });

    return new SinglePropertySingleUnionTypeGenerator<FileContext>({
        getTypeName,
        propertyName,
        getReferenceToPropertyType: (context) => context.type.getReferenceToType(type),
        getReferenceToPropertyTypeForInlineUnion: (context) => context.type.getReferenceToTypeForInlineUnion(type),
        noOptionalProperties,
        enableInlineTypes,
        generateReadWriteOnlyTypes
    });
}
