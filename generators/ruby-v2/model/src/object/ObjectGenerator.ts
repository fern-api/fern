import { RelativeFilePath } from "@fern-api/fs-utils";
import { ruby } from "@fern-api/ruby-ast";
import { FileGenerator, RubyFile } from "@fern-api/ruby-base";
import { ObjectTypeDeclaration, TypeDeclaration } from "@fern-fern/ir-sdk/api";
import { generateFields } from "../generateFields";
import { ModelCustomConfigSchema } from "../ModelCustomConfig";
import { ModelGeneratorContext } from "../ModelGeneratorContext";

export interface GeneratorContextLike {
    customConfig: unknown;
}

const TYPES_MODULE_NAME = "Types";

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

        const clientModuleName = this.context.customConfig.module || "Api";

        const classNode = ruby.class_({
            name: this.typeDeclaration.name.name.pascalCase.safeName,
            superclass: ruby.classReference({
                name: "Model",
                modules: ["Internal", "Types"]
            }),
            docstring: this.typeDeclaration.docs ?? undefined,
            statements: statements
        });

        const typesModule = ruby.module({
            name: TYPES_MODULE_NAME,
            statements: [classNode]
        });

        const clientModule = ruby.module({
            name: clientModuleName,
            statements: [typesModule]
        });

        const frozenComment = ruby.comment({ docs: "frozen_string_literal: true" });

        const fileContent = ruby.codeblock((writer) => {
            frozenComment.write(writer);
            writer.newLine();
            clientModule.write(writer);
        });

        return new RubyFile({
            node: fileContent,
            directory: this.getFilepath(),
            filename: `${this.typeDeclaration.name.name.snakeCase.safeName}.rb`,
            customConfig: this.context.customConfig
        });
    }
}
