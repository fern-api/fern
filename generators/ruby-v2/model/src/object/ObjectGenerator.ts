import { RelativeFilePath } from "@fern-api/fs-utils";
import { ruby } from "@fern-api/ruby-ast";
import { FileGenerator, RubyFile } from "@fern-api/ruby-base";
import { FernIr } from "@fern-fern/ir-sdk";
import { ModelCustomConfigSchema } from "../ModelCustomConfig.js";
import { ModelGeneratorContext } from "../ModelGeneratorContext.js";
import { generateFields } from "./generateFields.js";

export interface GeneratorContextLike {
    customConfig: unknown;
}

export class ObjectGenerator extends FileGenerator<RubyFile, ModelCustomConfigSchema, ModelGeneratorContext> {
    private readonly typeDeclaration: FernIr.TypeDeclaration;
    private readonly objectDeclaration: FernIr.ObjectTypeDeclaration;

    public constructor(
        context: ModelGeneratorContext,
        typeDeclaration: FernIr.TypeDeclaration,
        objectDeclaration: FernIr.ObjectTypeDeclaration
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
            typeDeclaration: this.typeDeclaration,
            properties,
            context: this.context
        });

        const classNode = ruby.class_({
            name: this.typeDeclaration.name.name.pascalCase.safeName,
            superclass: this.context.getModelClassReference(),
            docstring: this.typeDeclaration.docs ?? undefined,
            statements: statements
        });

        return new RubyFile({
            node: ruby.codeblock((writer) => {
                ruby.comment({ docs: "frozen_string_literal: true" }).write(writer);
                writer.newLine();
                ruby.wrapInModules(classNode, this.context.getModulesForTypeId(this.typeDeclaration.name.typeId)).write(
                    writer
                );
            }),
            directory: this.getFilepath(),
            filename: this.context.getFileNameForTypeId(this.typeDeclaration.name.typeId),
            customConfig: this.context.customConfig
        });
    }
}
