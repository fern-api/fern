import { BaseContext } from "@fern-typescript/contexts";
import {
    AbstractKnownSingleUnionType,
    NoPropertiesSingleUnionTypeGenerator,
    SinglePropertySingleUnionTypeGenerator,
    SingleUnionTypeGenerator
} from "@fern-typescript/union-generator";

import {
    NameAndWireValue,
    SingleUnionType,
    SingleUnionTypeProperties,
    SingleUnionTypeProperty,
    UnionTypeDeclaration
} from "@fern-fern/ir-sdk/api";

import { SamePropertiesAsObjectSingleUnionTypeGenerator } from "./SamePropertiesAsObjectSingleUnionTypeGenerator";

export declare namespace ParsedSingleUnionTypeForUnion {
    export interface Init {
        singleUnionType: SingleUnionType;
        union: UnionTypeDeclaration;
        includeUtilsOnUnionMembers: boolean;
        includeSerdeLayer: boolean;
        retainOriginalCasing: boolean;
        noOptionalProperties: boolean;
        enableInlineTypes: boolean;
    }
}

export class ParsedSingleUnionTypeForUnion<Context extends BaseContext> extends AbstractKnownSingleUnionType<Context> {
    private singleUnionTypeFromUnion: SingleUnionType;
    private includeSerdeLayer: boolean;
    private retainOriginalCasing: boolean;
    protected union: UnionTypeDeclaration;

    constructor({
        singleUnionType,
        union,
        includeUtilsOnUnionMembers,
        includeSerdeLayer,
        retainOriginalCasing,
        noOptionalProperties,
        enableInlineTypes
    }: ParsedSingleUnionTypeForUnion.Init) {
        super({
            singleUnionType: SingleUnionTypeProperties._visit<SingleUnionTypeGenerator<Context>>(
                singleUnionType.shape,
                {
                    noProperties: () => new NoPropertiesSingleUnionTypeGenerator(),
                    samePropertiesAsObject: (extended) =>
                        new SamePropertiesAsObjectSingleUnionTypeGenerator({ extended, enableInlineTypes }),
                    singleProperty: (singleProperty) =>
                        new SinglePropertySingleUnionTypeGenerator({
                            propertyName: ParsedSingleUnionTypeForUnion.getSinglePropertyKey(singleProperty, {
                                includeSerdeLayer,
                                retainOriginalCasing
                            }),
                            getReferenceToPropertyType: (context) =>
                                context.type.getReferenceToType(singleProperty.type),
                            getReferenceToPropertyTypeForInlineUnion: (context) =>
                                context.type.getReferenceToTypeForInlineUnion(singleProperty.type),
                            noOptionalProperties,
                            enableInlineTypes
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
    }

    public getDocs(): string | null | undefined {
        return this.singleUnionTypeFromUnion.docs;
    }

    public getInterfaceName(): string {
        return this.singleUnionTypeFromUnion.discriminantValue.name.pascalCase.safeName;
    }

    public getDiscriminantValue(): string {
        return this.singleUnionTypeFromUnion.discriminantValue.wireValue;
    }

    public getBuilderName(): string {
        if (this.includeSerdeLayer && !this.retainOriginalCasing) {
            return this.singleUnionTypeFromUnion.discriminantValue.name.camelCase.unsafeName;
        } else {
            return this.singleUnionTypeFromUnion.discriminantValue.wireValue;
        }
    }

    public getVisitorKey(): string {
        if (this.includeSerdeLayer && !this.retainOriginalCasing) {
            return this.singleUnionTypeFromUnion.discriminantValue.name.camelCase.unsafeName;
        } else {
            return this.singleUnionTypeFromUnion.discriminantValue.wireValue;
        }
    }

    protected getDiscriminant(): NameAndWireValue {
        return this.union.discriminant;
    }

    public static getSinglePropertyKey(
        singleProperty: SingleUnionTypeProperty,
        { includeSerdeLayer, retainOriginalCasing }: { includeSerdeLayer: boolean; retainOriginalCasing: boolean }
    ): string {
        if (includeSerdeLayer && !retainOriginalCasing) {
            return singleProperty.name.name.camelCase.unsafeName;
        } else {
            return singleProperty.name.wireValue;
        }
    }
}
