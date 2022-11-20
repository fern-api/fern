import { DeclaredTypeName, SingleUnionTypeProperty } from "@fern-fern/ir-model/types";
import { getTextOfTsNode } from "@fern-typescript/commons";
import { Zurg } from "@fern-typescript/commons-v2";
import { TypeSchemaContext } from "@fern-typescript/sdk-declaration-handler";
import { AbstractRawSingleUnionType } from "@fern-typescript/union-schema-generator";
import { OptionalKind, PropertySignatureStructure, ts } from "ts-morph";

export declare namespace RawSinglePropertySingleUnionType {
    export interface Init extends AbstractRawSingleUnionType.Init {
        unionTypeName: DeclaredTypeName;
        singleProperty: SingleUnionTypeProperty;
    }
}

export class RawSinglePropertySingleUnionType extends AbstractRawSingleUnionType<TypeSchemaContext> {
    private unionTypeName: DeclaredTypeName;
    private singleProperty: SingleUnionTypeProperty;

    constructor({ singleProperty, unionTypeName, ...superInit }: RawSinglePropertySingleUnionType.Init) {
        super(superInit);
        this.unionTypeName = unionTypeName;
        this.singleProperty = singleProperty;
    }

    protected getExtends(): ts.TypeNode[] {
        return [];
    }

    protected getNonDiscriminantPropertiesForInterface(
        context: TypeSchemaContext
    ): OptionalKind<PropertySignatureStructure>[] {
        const type = context.getReferenceToRawType(this.singleProperty.type);
        return [
            {
                name: `"${this.singleProperty.nameV2.wireValue}"`,
                type: getTextOfTsNode(type.typeNodeWithoutUndefined),
                hasQuestionToken: type.isOptional,
            },
        ];
    }

    protected getNonDiscriminantPropertiesForSchema(
        context: TypeSchemaContext
    ): Zurg.union.SingleUnionType["nonDiscriminantProperties"] {
        return {
            isInline: true,
            properties: [
                {
                    key: {
                        parsed: context
                            .getGeneratedUnionType(this.unionTypeName)
                            .getSinglePropertyKey(this.singleProperty),
                        raw: this.singleProperty.nameV2.wireValue,
                    },
                    value: context.getSchemaOfTypeReference(this.singleProperty.type),
                },
            ],
        };
    }
}
