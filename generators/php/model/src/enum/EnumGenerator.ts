import { CaseConverter, getWireValue } from "@fern-api/base-generator";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { FileGenerator, PhpFile } from "@fern-api/php-base";
import { php } from "@fern-api/php-codegen";
import { FernIr } from "@fern-fern/ir-sdk";

import { ModelCustomConfigSchema } from "../ModelCustomConfig.js";
import { ModelGeneratorContext } from "../ModelGeneratorContext.js";

export class EnumGenerator extends FileGenerator<PhpFile, ModelCustomConfigSchema, ModelGeneratorContext> {
    private readonly case: CaseConverter;
    private readonly classReference: php.ClassReference;

    constructor(
        context: ModelGeneratorContext,
        private readonly typeDeclaration: FernIr.TypeDeclaration,
        private readonly enumDeclaration: FernIr.EnumTypeDeclaration
    ) {
        super(context);
        this.case = context.case;
        this.classReference = this.context.phpTypeMapper.convertToClassReference(this.typeDeclaration.name);
    }

    protected doGenerate(): PhpFile {
        const enum_ = php.enum_({
            ...this.classReference,
            backing: "string"
        });
        this.enumDeclaration.values.forEach((member) =>
            enum_.addMember({ name: this.case.pascalSafe(member.name), value: getWireValue(member.name) })
        );
        return new PhpFile({
            clazz: enum_,
            rootNamespace: this.context.getRootNamespace(),
            directory: this.context.getLocationForTypeId(this.typeDeclaration.name.typeId).directory,
            customConfig: this.context.customConfig
        });
    }

    protected getFilepath(): RelativeFilePath {
        return this.context.getLocationForTypeId(this.typeDeclaration.name.typeId).directory;
    }

    protected getLogLabel(): string {
        const dir = this.context.getLocationForTypeId(this.typeDeclaration.name.typeId).directory;
        return dir ? `${dir}/${this.classReference.name}` : this.classReference.name;
    }
}
