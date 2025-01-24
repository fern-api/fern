import { CSharpFile, FileGenerator, csharp } from "@fern-api/csharp-codegen";
import { RelativeFilePath, join } from "@fern-api/fs-utils";

import { SdkCustomConfigSchema } from "../SdkCustomConfig";
import { SdkGeneratorContext } from "../SdkGeneratorContext";
import { BaseOptionsGenerator } from "./BaseOptionsGenerator";

export const REQUEST_OPTIONS_INTERFACE_NAME = "IRequestOptions";
export const REQUEST_OPTIONS_PARAMETER_NAME = "options";

export class RequestOptionsInterfaceGenerator extends FileGenerator<
    CSharpFile,
    SdkCustomConfigSchema,
    SdkGeneratorContext
> {
    private baseOptionsGenerator: BaseOptionsGenerator;

    constructor(context: SdkGeneratorContext, baseOptionsGenerator: BaseOptionsGenerator) {
        super(context);

        this.baseOptionsGenerator = baseOptionsGenerator;
    }

    public doGenerate(): CSharpFile {
        const interace_ = csharp.interface_({
            ...this.context.getRequestOptionsInterfaceReference(),
            access: csharp.Access.Internal
        });
        interace_.addFields(this.baseOptionsGenerator.getRequestOptionInterfaceFields());
        return new CSharpFile({
            clazz: interace_,
            directory: this.context.getCoreDirectory(),
            allNamespaceSegments: this.context.getAllNamespaceSegments(),
            allTypeClassReferences: this.context.getAllTypeClassReferences(),
            namespace: this.context.getCoreNamespace(),
            customConfig: this.context.customConfig
        });
    }

    protected getFilepath(): RelativeFilePath {
        return join(
            this.context.project.filepaths.getCoreFilesDirectory(),
            RelativeFilePath.of(`${REQUEST_OPTIONS_INTERFACE_NAME}.cs`)
        );
    }
}
