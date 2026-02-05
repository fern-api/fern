import { RelativeFilePath } from "@fern-api/fs-utils";
import { ruby } from "@fern-api/ruby-ast";
import { FileGenerator, RubyFile } from "@fern-api/ruby-base";
import { AliasTypeDeclaration, TypeDeclaration } from "@fern-fern/ir-sdk/api";
import { ModelCustomConfigSchema } from "../ModelCustomConfig";
import { ModelGeneratorContext } from "../ModelGeneratorContext";

export class AliasGenerator extends FileGenerator<RubyFile, ModelCustomConfigSchema, ModelGeneratorContext> {
    private readonly typeDeclaration: TypeDeclaration;
    private readonly aliasDeclaration: AliasTypeDeclaration;

    public constructor(
        context: ModelGeneratorContext,
        typeDeclaration: TypeDeclaration,
        aliasDeclaration: AliasTypeDeclaration
    ) {
        super(context);
        this.typeDeclaration = typeDeclaration;
        this.aliasDeclaration = aliasDeclaration;
    }

    protected getFilepath(): RelativeFilePath {
        return this.context.getLocationForTypeId(this.typeDeclaration.name.typeId);
    }

    public doGenerate(): RubyFile {
        const aliasModule = ruby.module({
            name: this.typeDeclaration.name.name.pascalCase.safeName
        });

        // Add a comment describing what this alias is for
        const aliasedTypeName = this.getAliasedTypeName();
        aliasModule.addStatement(
            ruby.comment({
                docs: `${this.typeDeclaration.name.name.pascalCase.safeName} is an alias for ${aliasedTypeName}`
            })
        );

        // Add load method - parses JSON string to value
        aliasModule.addStatement(
            ruby.method({
                name: "load",
                kind: ruby.MethodKind.Class_,
                parameters: {
                    positional: [ruby.parameters.positional({ name: "str", type: ruby.Type.string() })]
                },
                returnType: ruby.Type.untyped(),
                statements: [ruby.codeblock("::JSON.parse(str)")]
            })
        );

        // Add dump method - converts value to JSON string
        aliasModule.addStatement(
            ruby.method({
                name: "dump",
                kind: ruby.MethodKind.Class_,
                parameters: {
                    positional: [ruby.parameters.positional({ name: "value", type: ruby.Type.untyped() })]
                },
                returnType: ruby.Type.string(),
                statements: [ruby.codeblock("::JSON.generate(value)")]
            })
        );

        return new RubyFile({
            node: ruby.codeblock((writer) => {
                ruby.comment({ docs: "frozen_string_literal: true" }).write(writer);
                writer.newLine();
                ruby.wrapInModules(
                    aliasModule,
                    this.context.getModulesForTypeId(this.typeDeclaration.name.typeId)
                ).write(writer);
            }),
            directory: this.getFilepath(),
            filename: this.context.getFileNameForTypeId(this.typeDeclaration.name.typeId),
            customConfig: this.context.customConfig
        });
    }

    private getAliasedTypeName(): string {
        const aliasOf = this.aliasDeclaration.aliasOf;
        switch (aliasOf.type) {
            case "primitive":
                return this.getPrimitiveTypeName(aliasOf.primitive.v1);
            case "container":
                return this.getContainerTypeName(aliasOf.container);
            case "named":
                return aliasOf.name.pascalCase.safeName;
            case "unknown":
                return "Object";
            default:
                return "Object";
        }
    }

    private getPrimitiveTypeName(primitive: string): string {
        switch (primitive) {
            case "STRING":
            case "UUID":
            case "DATE":
            case "DATE_TIME":
            case "BASE_64":
            case "BIG_INTEGER":
                return "String";
            case "INTEGER":
            case "LONG":
            case "UINT":
            case "UINT_64":
                return "Integer";
            case "FLOAT":
            case "DOUBLE":
                return "Float";
            case "BOOLEAN":
                return "Boolean";
            default:
                return "Object";
        }
    }

    private getContainerTypeName(container: { type: string }): string {
        switch (container.type) {
            case "list":
            case "set":
                return "Array";
            case "map":
                return "Hash";
            case "optional":
            case "nullable":
                return "Object";
            case "literal":
                return "Object";
            default:
                return "Object";
        }
    }
}
