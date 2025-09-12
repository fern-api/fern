import { CSharpFile, FileGenerator } from "@fern-api/csharp-base";
import { ast } from "@fern-api/csharp-codegen";
import { join, RelativeFilePath } from "@fern-api/fs-utils";

import { ModelCustomConfigSchema } from "../ModelCustomConfig";
import { ModelGeneratorContext } from "../ModelGeneratorContext";

const DEFAULT_VERSION = "0.0.0";

export class VersionGenerator extends FileGenerator<CSharpFile, ModelCustomConfigSchema, ModelGeneratorContext> {
    private classReference: ast.ClassReference;

    constructor(context: ModelGeneratorContext) {
        super(context);
        this.classReference = this.context.getVersionClassReference();
    }

    public doGenerate(): CSharpFile {
        const class_ = this.csharp.class_({
            ...this.classReference,
            partial: false,
            access: ast.Access.Internal,
            annotations: [this.context.getSerializableAttribute()]
        });

        class_.addField(
          this.csharp.field({
                name: this.context.getCurrentVersionPropertyName(),
                type: this.csharp.Type.string(),
                access: ast.Access.Public,
                const_: true,
                initializer: this.csharp.codeblock(this.csharp.string_({ string: this.context.version ?? DEFAULT_VERSION }))
            })
        );

        return new CSharpFile({
            clazz: class_,
            directory: this.context.getPublicCoreDirectory(),
            allNamespaceSegments: this.context.getAllNamespaceSegments(),
            allTypeClassReferences: this.context.getAllTypeClassReferences(),
            namespace: this.context.getPublicCoreNamespace(),
            customConfig: this.context.customConfig
        });
    }

    protected getFilepath(): RelativeFilePath {
        return join(
            this.context.project.filepaths.getPublicCoreFilesDirectory(),
            RelativeFilePath.of(this.classReference.name + ".cs")
        );
    }
}
