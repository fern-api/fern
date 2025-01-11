import { CSharpFile, FileGenerator, csharp } from "@fern-api/csharp-codegen";
import { RelativeFilePath, join } from "@fern-api/fs-utils";

import { SdkCustomConfigSchema } from "../SdkCustomConfig";
import { SdkGeneratorContext } from "../SdkGeneratorContext";
import { BaseOptionsGenerator } from "./BaseOptionsGenerator";

export const REQUEST_OPTIONS_CLASS_NAME = "RequestOptions";

export class RequestOptionsGenerator extends FileGenerator<CSharpFile, SdkCustomConfigSchema, SdkGeneratorContext> {
    private baseOptionsGenerator: BaseOptionsGenerator;

    constructor(context: SdkGeneratorContext, baseOptionsGenerator: BaseOptionsGenerator) {
        super(context);

        this.baseOptionsGenerator = baseOptionsGenerator;
    }

    public doGenerate(): CSharpFile {
        const class_ = csharp.class_({
            ...this.context.getRequestOptionsClassReference(),
            partial: true,
            access: csharp.Access.Public,
            interfaceReferences: [this.context.getRequestOptionsInterfaceReference()]
        });
        class_.addFields(this.baseOptionsGenerator.getRequestOptionFields());
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
            RelativeFilePath.of(`${REQUEST_OPTIONS_CLASS_NAME}.cs`)
        );
    }
}
