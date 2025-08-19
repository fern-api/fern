import { RelativeFilePath } from "@fern-api/fs-utils";
import { ruby } from "@fern-api/ruby-ast";
import { FileGenerator, RubyFile } from "@fern-api/ruby-base";
import { EnumTypeDeclaration, TypeDeclaration } from "@fern-fern/ir-sdk/api";
import { ModelCustomConfigSchema } from "../ModelCustomConfig";
import { ModelGeneratorContext } from "../ModelGeneratorContext";

export class EnumGenerator extends FileGenerator<RubyFile, ModelCustomConfigSchema, ModelGeneratorContext> {
    private readonly typeDeclaration: TypeDeclaration;
    private readonly enumDeclaration: EnumTypeDeclaration;

    public constructor(
        context: ModelGeneratorContext,
        typeDeclaration: TypeDeclaration,
        enumDeclaration: EnumTypeDeclaration
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
            name: this.typeDeclaration.name.name.pascalCase.safeName
        });
        enumModule.addStatement(ruby.codeblock(`extend ${this.context.getRootModule().name}::Internal::Types::Enum`));

        for (const enumValue of this.enumDeclaration.values) {
            enumModule.addStatement(
                ruby.codeblock(`${enumValue.name.name.screamingSnakeCase.safeName} = "${enumValue.name.wireValue}"`)
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
