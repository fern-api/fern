import { getWireValue } from "@fern-api/base-generator";
import { FernIr } from "@fern-fern/ir-sdk";
import { AbstractGeneratedSchema } from "@fern-typescript/abstract-schema-generator";
import { getTextOfTsNode, Zurg } from "@fern-typescript/commons";
import { BaseContext, GeneratedEnumTypeSchema } from "@fern-typescript/contexts";
import { ModuleDeclaration, ts } from "ts-morph";

import { AbstractGeneratedTypeSchema } from "../AbstractGeneratedTypeSchema.js";

export declare namespace GeneratedEnumTypeSchemaImpl {
    export interface Init<Context> extends AbstractGeneratedTypeSchema.Init<FernIr.EnumTypeDeclaration, Context> {
        enableForwardCompatibleEnums: boolean;
    }
}

export class GeneratedEnumTypeSchemaImpl<Context extends BaseContext>
    extends AbstractGeneratedTypeSchema<FernIr.EnumTypeDeclaration, Context>
    implements GeneratedEnumTypeSchema<Context>
{
    public readonly type = "enum";
    private enableForwardCompatibleEnums: boolean;

    constructor({ enableForwardCompatibleEnums, ...superInit }: GeneratedEnumTypeSchemaImpl.Init<Context>) {
        super(superInit);
        this.enableForwardCompatibleEnums = enableForwardCompatibleEnums;
    }

    protected override buildSchema(context: Context): Zurg.Schema {
        const wireValues = this.shape.values.map((value) => getWireValue(value.name));
        if (this.enableForwardCompatibleEnums) {
            return context.coreUtilities.zurg.forwardCompatibleEnum(wireValues);
        }
        return context.coreUtilities.zurg.enum(wireValues);
    }

    protected override generateRawTypeDeclaration(_context: Context, module: ModuleDeclaration): void {
        module.addTypeAlias({
            name: AbstractGeneratedSchema.RAW_TYPE_NAME,
            type: getTextOfTsNode(
                ts.factory.createUnionTypeNode(
                    this.shape.values.map((value) =>
                        ts.factory.createLiteralTypeNode(ts.factory.createStringLiteral(getWireValue(value.name)))
                    )
                )
            ),
            isExported: true
        });
    }
}
