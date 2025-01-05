import { CSharpFile, FileGenerator, csharp } from "@fern-api/csharp-codegen";
import { RelativeFilePath, join } from "@fern-api/fs-utils";

import { ModelCustomConfigSchema } from "../ModelCustomConfig";
import { ModelGeneratorContext } from "../ModelGeneratorContext";

const DEFAULT_VERSION = "0.0.0";

export class VersionGenerator extends FileGenerator<CSharpFile, ModelCustomConfigSchema, ModelGeneratorContext> {
    private classReference: csharp.ClassReference;

    constructor(context: ModelGeneratorContext) {
        super(context);
        this.classReference = this.context.getVersionClassReference();
    }

    public doGenerate(): CSharpFile {
        const class_ = csharp.class_({
            ...this.classReference,
            partial: false,
            access: csharp.Access.Internal
        });

        class_.addField(
            csharp.field({
                name: this.context.getCurrentVersionPropertyName(),
                type: csharp.Type.string(),
                access: csharp.Access.Public,
                const_: true,
                initializer: csharp.codeblock(`"${this.context.version ?? DEFAULT_VERSION}"`)
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
