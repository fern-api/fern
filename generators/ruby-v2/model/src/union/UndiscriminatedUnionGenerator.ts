import { RelativeFilePath } from "@fern-api/fs-utils";
import { ruby } from "@fern-api/ruby-ast";
import { FileGenerator, RubyFile } from "@fern-api/ruby-base";
import { FernIr } from "@fern-fern/ir-sdk";
import { TypeDeclaration, UndiscriminatedUnionTypeDeclaration } from "@fern-fern/ir-sdk/api";
import { ModelCustomConfigSchema } from "../ModelCustomConfig";
import { ModelGeneratorContext } from "../ModelGeneratorContext";

interface UnionMember {
    typeReference: ruby.ClassReference | ruby.Type;
}

export class UndiscriminatedUnionGenerator extends FileGenerator<
    RubyFile,
    ModelCustomConfigSchema,
    ModelGeneratorContext
> {
    private readonly typeDeclaration: TypeDeclaration;
    private readonly classReference: ruby.ClassReference;
    private readonly unionMembers: UnionMember[];

    constructor(
        context: ModelGeneratorContext,
        typeDeclaration: TypeDeclaration,
        private readonly unionDeclaration: UndiscriminatedUnionTypeDeclaration
    ) {
        super(context);
        this.typeDeclaration = typeDeclaration;
        this.classReference = this.context.typeMapper.convertToClassReference(this.typeDeclaration.name);
        this.unionMembers = this.unionDeclaration.members.map((member) => this.unionMemberFromUnionMember(member));
    }

    public doGenerate(): RubyFile {
        const classNode = ruby.class_({
            ...this.classReference,
            superclass: this.context.getModelClassReference(),
            docstring: this.typeDeclaration.docs ?? undefined
        });
        classNode.addStatement(ruby.codeblock(`extend ${this.context.getRootModuleName()}::Internal::Types::Union`));

        classNode.addStatement(
            ruby.codeblock((writer) => {
                writer.newLine();
            })
        );

        for (const unionMember of this.unionMembers) {
            classNode.addStatement(
                ruby.codeblock((writer) => {
                    writer.write("member -> { ");
                    writer.writeNode(unionMember.typeReference);
                    writer.write(" }");
                })
            );
        }

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

    private unionMemberFromUnionMember(member: FernIr.UndiscriminatedUnionMember): UnionMember {
        return {
            typeReference: this.context.typeMapper.convert({ reference: member.type, fullyQualified: true })
        };
    }

    protected getFilepath(): RelativeFilePath {
        return this.context.getLocationForTypeId(this.typeDeclaration.name.typeId);
    }
}
