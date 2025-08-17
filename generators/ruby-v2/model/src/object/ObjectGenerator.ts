import { RelativeFilePath } from "@fern-api/fs-utils";
import { ruby } from "@fern-api/ruby-ast";
import { FileGenerator, RubyFile } from "@fern-api/ruby-base";
import { ObjectTypeDeclaration, TypeDeclaration } from "@fern-fern/ir-sdk/api";
import { ModelCustomConfigSchema } from "../ModelCustomConfig";
import { ModelGeneratorContext } from "../ModelGeneratorContext";
import { generateFields } from "./generateFields";

export interface GeneratorContextLike {
    customConfig: unknown;
}

export class ObjectGenerator extends FileGenerator<RubyFile, ModelCustomConfigSchema, ModelGeneratorContext> {
    private readonly typeDeclaration: TypeDeclaration;
    private readonly objectDeclaration: ObjectTypeDeclaration;

    public constructor(
        context: ModelGeneratorContext,
        typeDeclaration: TypeDeclaration,
        objectDeclaration: ObjectTypeDeclaration
    ) {
        super(context);
        this.typeDeclaration = typeDeclaration;
        this.objectDeclaration = objectDeclaration;
    }

    protected getFilepath(): RelativeFilePath {
        return this.context.getLocationForTypeId(this.typeDeclaration.name.typeId);
    }

    public doGenerate(): RubyFile {
        const properties = this.objectDeclaration.properties || [];

        const statements = generateFields({
            properties,
            context: this.context
        });

        const classNode = ruby.class_({
            name: this.typeDeclaration.name.name.pascalCase.safeName,
            superclass: ruby.classReference({
                name: "Model",
                modules: ["Internal", "Types"]
            }),
            docstring: this.typeDeclaration.docs ?? undefined,
            statements: statements
        });

        return new RubyFile({
            node: ruby.codeblock((writer) => {
                ruby.comment({ docs: "frozen_string_literal: true" }).write(writer);
                writer.newLine();
                ruby.wrapInModules(classNode, this.context.getModulesForTypeId(this.typeDeclaration.name.typeId)).write(writer);
            }),
            directory: this.getFilepath(),
            filename: `${this.typeDeclaration.name.name.snakeCase.safeName}.rb`,
            customConfig: this.context.customConfig
        });
    }
}
