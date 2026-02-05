import { CSharpFile, FileGenerator } from "@fern-api/csharp-base";
import { ast } from "@fern-api/csharp-codegen";
import { join, RelativeFilePath } from "@fern-api/fs-utils";

import { ModelGeneratorContext } from "../ModelGeneratorContext";

export class VersionGenerator extends FileGenerator<CSharpFile> {
    private classReference: ast.ClassReference;

    constructor(context: ModelGeneratorContext) {
        super(context);
        this.classReference = this.Types.Version;
    }

    public doGenerate(): CSharpFile {
        const class_ = this.csharp.class_({
            reference: this.classReference,
            partial: false,
            access: ast.Access.Internal,
            annotations: [this.System.Serializable]
        });

        class_.addField({
            origin: class_.explicit("Current"),
            enclosingType: class_,
            type: this.Primitive.string,
            access: ast.Access.Public,
            const_: true,
            initializer: this.csharp.codeblock(
                this.csharp.string_({ string: this.context.version ?? this.constants.defaults.version })
            )
        });

        return new CSharpFile({
            clazz: class_,
            directory: this.context.getPublicCoreDirectory(),
            allNamespaceSegments: this.context.getAllNamespaceSegments(),
            allTypeClassReferences: this.context.getAllTypeClassReferences(),
            namespace: this.namespaces.publicCore,
            generation: this.generation
        });
    }

    protected getFilepath(): RelativeFilePath {
        return join(this.constants.folders.publicCoreFiles, RelativeFilePath.of(`${this.classReference.name}.cs`));
    }
}
