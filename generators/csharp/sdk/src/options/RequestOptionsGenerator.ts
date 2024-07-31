import { csharp, CSharpFile, FileGenerator } from "@fern-api/csharp-codegen";
import { join, RelativeFilePath } from "@fern-api/fs-utils";
import { SdkCustomConfigSchema } from "../SdkCustomConfig";
import { SdkGeneratorContext } from "../SdkGeneratorContext";
import { BaseOptionsGenerator, OptionArgs } from "./BaseOptionsGenerator";

export const REQUEST_OPTIONS_CLASS_NAME = "RequestOptions";
export const REQUEST_OPTIONS_PARAMETER_NAME = "options";

export class RequestOptionsGenerator extends FileGenerator<CSharpFile, SdkCustomConfigSchema, SdkGeneratorContext> {
    private baseOptionsGenerator: BaseOptionsGenerator;

    constructor(context: SdkGeneratorContext, baseOptionsGenerator: BaseOptionsGenerator) {
        super(context);

        this.baseOptionsGenerator = baseOptionsGenerator;
    }

    public doGenerate(): CSharpFile {
        const class_ = csharp.class_({
            name: REQUEST_OPTIONS_CLASS_NAME,
            namespace: this.context.getCoreNamespace(),
            partial: true,
            access: "public"
        });
        const optionArgs: OptionArgs = {
            optional: true,
            includeInitializer: false
        };
        class_.addField(this.baseOptionsGenerator.getBaseUrlField(optionArgs));
        class_.addField(this.baseOptionsGenerator.getHttpClientField(optionArgs));
        class_.addField(this.baseOptionsGenerator.getMaxRetriesField(optionArgs));
        class_.addField(this.baseOptionsGenerator.getTimeoutField(optionArgs));
        return new CSharpFile({
            clazz: class_,
            directory: this.context.getCoreDirectory()
        });
    }

    protected getFilepath(): RelativeFilePath {
        return join(
            this.context.project.filepaths.getCoreFilesDirectory(),
            RelativeFilePath.of(`${REQUEST_OPTIONS_CLASS_NAME}.cs`)
        );
    }
}
