import { assertNever } from "@fern-api/core-utils";
import { join, RelativeFilePath } from "@fern-api/fs-utils";
import { ruby } from "@fern-api/ruby-ast";
import { FileGenerator, RubyFile } from "@fern-api/ruby-base";
import { FernIr } from "@fern-fern/ir-sdk";
import { TypeDeclaration, UnionTypeDeclaration } from "@fern-fern/ir-sdk/api";
import { ModelCustomConfigSchema } from "../ModelCustomConfig";
import { ModelGeneratorContext } from "../ModelGeneratorContext";

// import { ExampleGenerator } from "../snippets/ExampleGenerator";

const basePropertiesClassName = "BaseProperties";

interface UnionMember {
    keyName: string;
    typeReference: ruby.ClassReference | ruby.Type;
}

export class UnionGenerator extends FileGenerator<RubyFile, ModelCustomConfigSchema, ModelGeneratorContext> {
    private readonly typeDeclaration: TypeDeclaration;
    private readonly classReference: ruby.ClassReference;
    private readonly discriminantPropertyName: string;
    private readonly unionMembers: UnionMember[];

    constructor(
        context: ModelGeneratorContext,
        typeDeclaration: TypeDeclaration,
        private readonly unionDeclaration: UnionTypeDeclaration
    ) {
        super(context);
        this.typeDeclaration = typeDeclaration;
        this.discriminantPropertyName = unionDeclaration.discriminant.name.snakeCase.safeName;
        this.classReference = this.context.typeMapper.convertToClassReference(this.typeDeclaration.name);
        this.unionMembers = this.unionDeclaration.types.map((type) => this.unionMemberFromUnionType(type));
    }

    public doGenerate(): RubyFile {
        const classNode = ruby.class_({
            ...this.classReference,
            superclass: ruby.classReference({
                name: "Union",
                modules: ["Internal", "Types"]
            }),
            docstring: this.typeDeclaration.docs ?? undefined
        });

        classNode.addStatement(
            ruby.codeblock((writer) => {
                writer.newLine();
                writer.writeLine(`discriminant :${this.discriminantPropertyName}`);
            })
        );

        for (const unionMember of this.unionMembers) {
            classNode.addStatement(
                ruby.codeblock((writer) => {
                    writer.write("member -> { ");
                    writer.writeNode(unionMember.typeReference);
                    writer.write(` }, key: "${unionMember.keyName}"`);
                })
            );
        }

        return new RubyFile({
            node: ruby.codeblock((writer) => {
                ruby.comment({ docs: "frozen_string_literal: true" }).write(writer);
                writer.newLine();
                ruby.wrapInModules(classNode, this.context.getModulesForTypeId(this.typeDeclaration.name.typeId)).write(writer);
            }),
            directory: this.getFilepath(),
            filename: this.getFilename(),
            customConfig: this.context.customConfig
        });
    }

    private unionMemberFromUnionType(type: FernIr.SingleUnionType): UnionMember {
        return {
            keyName: type.discriminantValue.name.screamingSnakeCase.safeName,
            typeReference: this.typeReferenceFromUnionType(type)
        };
    }

    private typeReferenceFromUnionType(type: FernIr.SingleUnionType): ruby.ClassReference | ruby.Type {
        switch (type.shape.propertiesType) {
            case "noProperties":
                return ruby.Type.object("TODO");
            case "samePropertiesAsObject":
                return this.context.typeMapper.convertToClassReference(type.shape, { fullyQualified: true });
            case "singleProperty":
                return this.context.typeMapper.convert({ reference: type.shape.type, fullyQualified: true });
            default:
                assertNever(type.shape);
        }
    }

    protected getFilepath(): RelativeFilePath {
        return this.context.getLocationForTypeId(this.typeDeclaration.name.typeId);
    }

    private getFilename(): string {
        return `${this.typeDeclaration.name.name.snakeCase.safeName}.rb`;
    }
}
