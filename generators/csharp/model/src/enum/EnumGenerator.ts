import { csharp, CSharpFile, Generator } from "@fern-api/csharp-codegen";
import { EnumTypeDeclaration, TypeDeclaration } from "@fern-fern/ir-sdk/api";
import { ModelCustomConfigSchema } from "../ModelCustomConfig";
import { ModelGeneratorContext } from "../ModelGeneratorContext";

export class EnumGenerator extends Generator<ModelCustomConfigSchema, ModelGeneratorContext> {
    constructor(
        context: ModelGeneratorContext,
        private readonly typeDeclaration: TypeDeclaration,
        private readonly enumDeclaration: EnumTypeDeclaration
    ) {
        super(context);
    }

    public generate(): CSharpFile {
        const enum_ = csharp.enum_({
            name: this.context.getPascalCaseSafeName(this.typeDeclaration.name.name),
            namespace: this.context.getNamespaceForTypeId(this.typeDeclaration.name.typeId),
            access: "public"
            // annotations: [this.prebuiltUtilities.enumConverterAnnotation()]
        });

        this.enumDeclaration.values.forEach((member) =>
            enum_.addMember({ name: member.name.name.pascalCase.safeName, value: member.name.wireValue })
        );

        return new CSharpFile({
            clazz: enum_,
            directory: this.context.getDirectoryForTypeId(this.typeDeclaration.name.typeId)
        });
    }
}
