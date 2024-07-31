import { csharp, CSharpFile, FileGenerator } from "@fern-api/csharp-codegen";
import { join, RelativeFilePath } from "@fern-api/fs-utils";
import { SdkCustomConfigSchema } from "../SdkCustomConfig";
import { SdkGeneratorContext } from "../SdkGeneratorContext";
import { BaseOptionsGenerator, OptionArgs } from "./BaseOptionsGenerator";

export const CLIENT_OPTIONS_CLASS_NAME = "ClientOptions";

export class ClientOptionsGenerator extends FileGenerator<CSharpFile, SdkCustomConfigSchema, SdkGeneratorContext> {
    private baseOptionsGenerator: BaseOptionsGenerator;

    constructor(context: SdkGeneratorContext, baseOptionsGenerator: BaseOptionsGenerator) {
        super(context);

        this.baseOptionsGenerator = baseOptionsGenerator;
    }

    public doGenerate(): CSharpFile {
        const class_ = csharp.class_({
            name: CLIENT_OPTIONS_CLASS_NAME,
            namespace: this.context.getCoreNamespace(),
            partial: true,
            access: "public"
        });
        const optionArgs: OptionArgs = {
            optional: false,
            includeInitializer: true
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
            RelativeFilePath.of(`${CLIENT_OPTIONS_CLASS_NAME}.cs`)
        );
    }
}
