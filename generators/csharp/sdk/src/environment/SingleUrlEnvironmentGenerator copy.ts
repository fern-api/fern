import { csharp, CSharpFile, FileGenerator } from "@fern-api/csharp-codegen";
import { join, RelativeFilePath } from "@fern-api/fs-utils";
import { SingleBaseUrlEnvironments } from "@fern-fern/ir-sdk/api";
import { SdkCustomConfigSchema } from "../SdkCustomConfig";
import { SdkGeneratorContext } from "../SdkGeneratorContext";

export declare namespace SingleUrlEnvironmentGenerator {
    interface Args {
        context: SdkGeneratorContext;
        singleUrlEnvironments: SingleBaseUrlEnvironments;
    }
}

export class SingleUrlEnvironmentGenerator extends FileGenerator<
    CSharpFile,
    SdkCustomConfigSchema,
    SdkGeneratorContext
> {
    private singleUrlEnvironments: SingleBaseUrlEnvironments;

    constructor({ context, singleUrlEnvironments }: SingleUrlEnvironmentGenerator.Args) {
        super(context);
        this.singleUrlEnvironments = singleUrlEnvironments;
    }

    public doGenerate(): CSharpFile {
        const class_ = csharp.class_({
            ...this.context.getEnvironmentsClassReference(),
            partial: false,
            access: "public"
        });

        for (const environment of this.singleUrlEnvironments.environments) {
            class_.addField(
                csharp.field({
                    access: "public",
                    name: environment.name.screamingSnakeCase.safeName,
                    static_: true,
                    type: csharp.Type.string(),
                    initializer: csharp.codeblock(`"${environment.url}"`)
                })
            );
        }

        return new CSharpFile({
            clazz: class_,
            directory: RelativeFilePath.of(this.context.getCoreDirectory())
        });
    }

    protected getFilepath(): RelativeFilePath {
        return join(
            this.context.project.filepaths.getCoreFilesDirectory(),
            RelativeFilePath.of(`${this.context.getEnvironmentsClassReference().name}.cs`)
        );
    }
}
