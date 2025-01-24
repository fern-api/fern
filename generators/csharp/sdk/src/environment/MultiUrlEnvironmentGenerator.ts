import { CSharpFile, FileGenerator, csharp } from "@fern-api/csharp-codegen";
import { RelativeFilePath, join } from "@fern-api/fs-utils";

import { MultipleBaseUrlsEnvironments } from "@fern-fern/ir-sdk/api";

import { SdkCustomConfigSchema } from "../SdkCustomConfig";
import { SdkGeneratorContext } from "../SdkGeneratorContext";

export declare namespace SingleUrlEnvironmentGenerator {
    interface Args {
        context: SdkGeneratorContext;
        multiUrlEnvironments: MultipleBaseUrlsEnvironments;
    }
}

export class MultiUrlEnvironmentGenerator extends FileGenerator<
    CSharpFile,
    SdkCustomConfigSchema,
    SdkGeneratorContext
> {
    private multiUrlEnvironments: MultipleBaseUrlsEnvironments;

    constructor({ context, multiUrlEnvironments }: SingleUrlEnvironmentGenerator.Args) {
        super(context);
        this.multiUrlEnvironments = multiUrlEnvironments;
    }

    public doGenerate(): CSharpFile {
        const class_ = csharp.class_({
            ...this.context.getEnvironmentsClassReference(),
            partial: false,
            access: csharp.Access.Public
        });

        for (const environment of this.multiUrlEnvironments.environments) {
            class_.addField(
                csharp.field({
                    access: csharp.Access.Public,
                    name:
                        (this.context.customConfig["pascal-case-environments"] ?? true)
                            ? environment.name.pascalCase.safeName
                            : environment.name.screamingSnakeCase.safeName,
                    static_: true,
                    type: csharp.Type.reference(this.context.getEnvironmentsClassReference()),
                    initializer: csharp.codeblock((writer) => {
                        writer.writeNode(
                            new csharp.ClassInstantiation({
                                classReference: class_.reference,
                                arguments_: Object.entries(environment.urls).map(([id, url]) => {
                                    const baseUrl = this.multiUrlEnvironments.baseUrls.find((url) => url.id === id);
                                    if (baseUrl == null) {
                                        throw new Error(`Failed to find base url with id ${id}`);
                                    }
                                    return {
                                        name: baseUrl?.name.pascalCase.safeName ?? "",
                                        assignment: csharp.codeblock(`"${url}"`)
                                    };
                                })
                            })
                        );
                    })
                })
            );
        }

        for (const baseUrl of this.multiUrlEnvironments.baseUrls) {
            class_.addField(
                csharp.field({
                    access: csharp.Access.Public,
                    name: baseUrl.name.pascalCase.safeName,
                    type: csharp.Type.string(),
                    get: true,
                    init: true,
                    summary: `URL for the ${baseUrl.id} service`
                })
            );
        }

        return new CSharpFile({
            clazz: class_,
            directory: RelativeFilePath.of(this.context.getPublicCoreDirectory()),
            allNamespaceSegments: this.context.getAllNamespaceSegments(),
            allTypeClassReferences: this.context.getAllTypeClassReferences(),
            namespace: this.context.getNamespace(),
            customConfig: this.context.customConfig
        });
    }

    protected getFilepath(): RelativeFilePath {
        return join(
            this.context.project.filepaths.getPublicCoreFilesDirectory(),
            RelativeFilePath.of(`${this.context.getEnvironmentsClassReference().name}.cs`)
        );
    }
}
