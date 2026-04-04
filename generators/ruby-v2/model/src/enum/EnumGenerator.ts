import { getWireValue } from "@fern-api/base-generator";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { ruby } from "@fern-api/ruby-ast";
import { FileGenerator, RubyFile } from "@fern-api/ruby-base";
import { FernIr } from "@fern-fern/ir-sdk";
import { ModelCustomConfigSchema } from "../ModelCustomConfig.js";
import { ModelGeneratorContext } from "../ModelGeneratorContext.js";

export class EnumGenerator extends FileGenerator<RubyFile, ModelCustomConfigSchema, ModelGeneratorContext> {
    private readonly typeDeclaration: FernIr.TypeDeclaration;
    private readonly enumDeclaration: FernIr.EnumTypeDeclaration;

    public constructor(
        context: ModelGeneratorContext,
        typeDeclaration: FernIr.TypeDeclaration,
        enumDeclaration: FernIr.EnumTypeDeclaration
    ) {
        super(context);
        this.typeDeclaration = typeDeclaration;
        this.enumDeclaration = enumDeclaration;
    }

    protected getFilepath(): RelativeFilePath {
        return this.context.getLocationForTypeId(this.typeDeclaration.name.typeId);
    }

    public doGenerate(): RubyFile {
        const enumModule = ruby.module({
            name: this.case.pascalSafe(this.typeDeclaration.name.name)
        });
        enumModule.addStatement(ruby.codeblock(`extend ${this.context.getRootModuleName()}::Internal::Types::Enum`));

        for (const enumValue of this.enumDeclaration.values) {
            const originalStringValue = getWireValue(enumValue.name);
            const escapedStringLiteral = originalStringValue.replaceAll("\\", "\\\\").replaceAll('"', '\\"');

            enumModule.addStatement(
                ruby.codeblock(`${this.case.screamingSnakeSafe(enumValue.name)} = "${escapedStringLiteral}"`)
            );
        }

        return new RubyFile({
            node: ruby.codeblock((writer) => {
                ruby.comment({ docs: "frozen_string_literal: true" }).write(writer);
                writer.newLine();
                ruby.wrapInModules(
                    enumModule,
                    this.context.getModulesForTypeId(this.typeDeclaration.name.typeId)
                ).write(writer);
            }),
            directory: this.getFilepath(),
            filename: this.context.getFileNameForTypeId(this.typeDeclaration.name.typeId),
            customConfig: this.context.customConfig
        });
    }
}
