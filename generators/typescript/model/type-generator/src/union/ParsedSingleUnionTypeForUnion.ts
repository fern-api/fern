import { CaseConverter, getWireValue } from "@fern-api/base-generator";
import { FernIr } from "@fern-fern/ir-sdk";
import { BaseContext } from "@fern-typescript/contexts";
import {
    AbstractKnownSingleUnionType,
    NoPropertiesSingleUnionTypeGenerator,
    SinglePropertySingleUnionTypeGenerator,
    SingleUnionTypeGenerator
} from "@fern-typescript/union-generator";

import { SamePropertiesAsObjectSingleUnionTypeGenerator } from "./SamePropertiesAsObjectSingleUnionTypeGenerator.js";

export declare namespace ParsedSingleUnionTypeForUnion {
    export interface Init {
        singleUnionType: FernIr.SingleUnionType;
        union: FernIr.UnionTypeDeclaration;
        includeUtilsOnUnionMembers: boolean;
        includeSerdeLayer: boolean;
        retainOriginalCasing: boolean;
        noOptionalProperties: boolean;
        enableInlineTypes: boolean;
        generateReadWriteOnlyTypes: boolean;
        caseConverter: CaseConverter;
    }
}

export class ParsedSingleUnionTypeForUnion<Context extends BaseContext> extends AbstractKnownSingleUnionType<Context> {
    private singleUnionTypeFromUnion: FernIr.SingleUnionType;
    private includeSerdeLayer: boolean;
    private retainOriginalCasing: boolean;
    private caseConverter: CaseConverter;
    protected union: FernIr.UnionTypeDeclaration;

    constructor({
        singleUnionType,
        union,
        includeUtilsOnUnionMembers,
        includeSerdeLayer,
        retainOriginalCasing,
        noOptionalProperties,
        enableInlineTypes,
        generateReadWriteOnlyTypes,
        caseConverter
    }: ParsedSingleUnionTypeForUnion.Init) {
        super({
            singleUnionType: FernIr.SingleUnionTypeProperties._visit<SingleUnionTypeGenerator<Context>>(
                singleUnionType.shape,
                {
                    noProperties: () => new NoPropertiesSingleUnionTypeGenerator(),
                    samePropertiesAsObject: (extended) =>
                        new SamePropertiesAsObjectSingleUnionTypeGenerator({ extended, enableInlineTypes }),
                    singleProperty: (singleProperty) =>
                        new SinglePropertySingleUnionTypeGenerator({
                            getTypeName: () => this.getTypeName(),
                            propertyName: ParsedSingleUnionTypeForUnion.getSinglePropertyKey(singleProperty, {
                                includeSerdeLayer,
                                retainOriginalCasing,
                                caseConverter
                            }),
                            getReferenceToPropertyType: (context) =>
                                context.type.getReferenceToType(singleProperty.type),
                            getReferenceToPropertyTypeForInlineUnion: (context) =>
                                context.type.getReferenceToTypeForInlineUnion(singleProperty.type),
                            noOptionalProperties,
                            enableInlineTypes,
                            generateReadWriteOnlyTypes
                        }),
                    _other: () => {
                        throw new Error("Unknown SingleUnionTypeProperties: " + singleUnionType.shape.propertiesType);
                    }
                }
            ),
            includeUtilsOnUnionMembers
        });

        this.union = union;
        this.singleUnionTypeFromUnion = singleUnionType;
        this.includeSerdeLayer = includeSerdeLayer;
        this.retainOriginalCasing = retainOriginalCasing;
        this.caseConverter = caseConverter;
    }

    public getDocs(): string | null | undefined {
        return this.singleUnionTypeFromUnion.docs;
    }

    public getTypeName(): string {
        return sanitizeIdentifier(this.caseConverter.pascalUnsafe(this.singleUnionTypeFromUnion.discriminantValue));
    }

    public needsRequestResponse(context: Context): { request: boolean; response: boolean } {
        return this.singleUnionType.needsRequestResponse(context);
    }

    public getDiscriminantValue(): string {
        return getWireValue(this.singleUnionTypeFromUnion.discriminantValue);
    }

    public getBuilderName(): string {
        if (this.includeSerdeLayer && !this.retainOriginalCasing) {
            return sanitizeIdentifier(this.caseConverter.camelUnsafe(this.singleUnionTypeFromUnion.discriminantValue));
        } else {
            return sanitizeIdentifier(getWireValue(this.singleUnionTypeFromUnion.discriminantValue));
        }
    }

    public getVisitorKey(): string {
        if (this.includeSerdeLayer && !this.retainOriginalCasing) {
            return sanitizeIdentifier(this.caseConverter.camelUnsafe(this.singleUnionTypeFromUnion.discriminantValue));
        } else {
            return sanitizeIdentifier(getWireValue(this.singleUnionTypeFromUnion.discriminantValue));
        }
    }

    protected getDiscriminant(): FernIr.NameAndWireValueOrString {
        return this.union.discriminant;
    }

    public static getSinglePropertyKey(
        singleProperty: FernIr.SingleUnionTypeProperty,
        {
            includeSerdeLayer,
            retainOriginalCasing,
            caseConverter
        }: { includeSerdeLayer: boolean; retainOriginalCasing: boolean; caseConverter: CaseConverter }
    ): string {
        if (includeSerdeLayer && !retainOriginalCasing) {
            return caseConverter.camelUnsafe(singleProperty.name);
        } else {
            return getWireValue(singleProperty.name);
        }
    }
}

const STARTS_WITH_DIGIT = /^\d/;

function sanitizeIdentifier(name: string): string {
    if (STARTS_WITH_DIGIT.test(name)) {
        return `_${name}`;
    }
    return name;
}
