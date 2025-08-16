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
    private readonly classReference: ruby.ClassReference;
    private readonly objectDeclaration: ObjectTypeDeclaration;

    public constructor(
        context: ModelGeneratorContext,
        typeDeclaration: TypeDeclaration,
        objectDeclaration: ObjectTypeDeclaration
    ) {
        super(context);
        this.typeDeclaration = typeDeclaration;
        this.classReference = this.context.typeMapper.convertToClassReference(typeDeclaration.name);
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
            superclass: this.context.getModelClassReference(),
            namespace: new Set<ruby.Module_>(this.classReference.modules.map(module => ruby.module({ name: module }))),
            docstring: this.typeDeclaration.docs ?? undefined,
            statements: statements
        });

        return new RubyFile({
            node: ruby.codeblock((writer) => {
                writer.writeNode(ruby.comment({ docs: "frozen_string_literal: true" }));
                writer.newLine();
                ruby.wrapInModules(classNode, this.classReference.modules).write(writer);
            }),
            directory: this.getFilepath(),
            filename: `${this.typeDeclaration.name.name.snakeCase.safeName}.rb`,
            customConfig: this.context.customConfig
        });
    }
}
