import {
    NameAndWireValue,
    SingleUnionType,
    SingleUnionTypeProperties,
    SingleUnionTypeProperty,
    UnionTypeDeclaration
} from "@fern-fern/ir-sdk/api";
import { BaseContext } from "@fern-typescript/contexts";
import {
    AbstractKnownSingleUnionType,
    NoPropertiesSingleUnionTypeGenerator,
    SinglePropertySingleUnionTypeGenerator,
    SingleUnionTypeGenerator
} from "@fern-typescript/union-generator";

import { SamePropertiesAsObjectSingleUnionTypeGenerator } from "./SamePropertiesAsObjectSingleUnionTypeGenerator";

export declare namespace ParsedSingleUnionTypeForUnion {
    export interface Init {
        singleUnionType: SingleUnionType;
        union: UnionTypeDeclaration;
        unionTypeName: string;
        includeUtilsOnUnionMembers: boolean;
        includeSerdeLayer: boolean;
        retainOriginalCasing: boolean;
        noOptionalProperties: boolean;
        enableInlineTypes: boolean;
        generateReadWriteOnlyTypes: boolean;
    }
}

export class ParsedSingleUnionTypeForUnion<Context extends BaseContext> extends AbstractKnownSingleUnionType<Context> {
    private singleUnionTypeFromUnion: SingleUnionType;
    private includeSerdeLayer: boolean;
    private retainOriginalCasing: boolean;
    protected union: UnionTypeDeclaration;
    private unionTypeName: string;

    constructor({
        singleUnionType,
        union,
        unionTypeName,
        includeUtilsOnUnionMembers,
        includeSerdeLayer,
        retainOriginalCasing,
        noOptionalProperties,
        enableInlineTypes,
        generateReadWriteOnlyTypes
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
                            getTypeName: () => this.getTypeName(),
                            propertyName: ParsedSingleUnionTypeForUnion.getSinglePropertyKey(singleProperty, {
                                includeSerdeLayer,
                                retainOriginalCasing
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
        this.unionTypeName = unionTypeName;
    }

    public getDocs(): string | null | undefined {
        return this.singleUnionTypeFromUnion.docs;
    }

    public getTypeName(): string {
        return SingleUnionTypeProperties._visit(this.singleUnionTypeFromUnion.shape, {
            samePropertiesAsObject: (typeRef) => this.stripUnionTypeNamePrefix(typeRef.name.pascalCase.safeName),
            singleProperty: () => this.singleUnionTypeFromUnion.discriminantValue.name.pascalCase.safeName,
            noProperties: () => this.singleUnionTypeFromUnion.discriminantValue.name.pascalCase.safeName,
            _other: () => this.singleUnionTypeFromUnion.discriminantValue.name.pascalCase.safeName
        });
    }

    // Strip the union type name prefix from shape type names (e.g., "UnionTypeNameFieldName" -> "FieldName")
    private stripUnionTypeNamePrefix(shapeTypeName: string): string {
        if (shapeTypeName.startsWith(this.unionTypeName)) {
            const withoutPrefix = shapeTypeName.substring(this.unionTypeName.length);
            if (withoutPrefix.length > 0 && withoutPrefix.charAt(0) === withoutPrefix.charAt(0).toUpperCase()) {
                return withoutPrefix;
            }
        }
        return shapeTypeName;
    }

    public needsRequestResponse(context: Context): { request: boolean; response: boolean } {
        return this.singleUnionType.needsRequestResponse(context);
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
