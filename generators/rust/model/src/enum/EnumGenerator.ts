import { RelativeFilePath } from "@fern-api/fs-utils";
import { FileGenerator, RustFile } from "@fern-api/rust-base";
import { rust } from "@fern-api/rust-codegen";

import { EnumTypeDeclaration, TypeDeclaration } from "@fern-fern/ir-sdk/api";

import { ModelCustomConfigSchema } from "../ModelCustomConfig";
import { ModelGeneratorContext } from "../ModelGeneratorContext";

export class EnumGenerator extends FileGenerator<RustFile, ModelCustomConfigSchema, ModelGeneratorContext> {
    private readonly classReference: rust.ClassReference;

    constructor(
        context: ModelGeneratorContext,
        private readonly typeDeclaration: TypeDeclaration,
        private readonly enumDeclaration: EnumTypeDeclaration
    ) {
        super(context);
        this.classReference = this.context.rustTypeMapper.convertToClassReference(this.typeDeclaration.name);
    }

    protected doGenerate(): RustFile {
        const enum_ = rust.enum_({
            ...this.classReference,
            backing: "string"
        });
        this.enumDeclaration.values.forEach((member) =>
            enum_.addMember({ name: member.name.name.pascalCase.safeName, value: member.name.wireValue })
        );
        return new RustFile({
            clazz: enum_,
            rootNamespace: this.context.getRootNamespace(),
            directory: this.context.getLocationForTypeId(this.typeDeclaration.name.typeId).directory,
            customConfig: this.context.customConfig
        });
    }

    protected getFilepath(): RelativeFilePath {
        return this.context.getLocationForTypeId(this.typeDeclaration.name.typeId).directory;
    }
}
