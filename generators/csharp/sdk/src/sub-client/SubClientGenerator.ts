import { csharp, CSharpFile, Generator } from "@fern-api/csharp-codegen";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { Subpackage, SubpackageId } from "@fern-fern/ir-sdk/api";
import { SdkCustomConfigSchema } from "../SdkCustomConfig";
import { SdkGeneratorContext } from "../SdkGeneratorContext";

export class SubClientGenerator extends Generator<SdkCustomConfigSchema, SdkGeneratorContext> {
    constructor(
        context: SdkGeneratorContext,
        private readonly id: SubpackageId,
        private readonly subpackage: Subpackage
    ) {
        super(context);
    }

    public generate(): CSharpFile {
        const class_ = csharp.class_({
            name: `${this.subpackage.name.pascalCase.unsafeName}Client`,
            namespace: this.context.getNamespaceForSubpackageId(this.id),
            partial: false,
            access: "public"
        });
        return new CSharpFile({
            clazz: class_,
            directory: RelativeFilePath.of(this.context.getDirectoryForSubpackageId(this.id))
        });
    }
}
