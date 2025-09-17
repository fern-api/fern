import { CSharpFile, FileGenerator } from "@fern-api/csharp-base";
import { ast } from "@fern-api/csharp-codegen";
import { join, RelativeFilePath } from "@fern-api/fs-utils";

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
        const class_ = this.csharp.class_({
            ...this.context.getEnvironmentsClassReference(),
            partial: false,
            access: ast.Access.Public,
            annotations: [this.context.getSerializableAttribute()]
        });

        for (const environment of this.multiUrlEnvironments.environments) {
            class_.addField(
                this.csharp.field({
                    access: ast.Access.Public,
                    static_: true,
                    readonly: true,
                    name:
                        (this.context.customConfig["pascal-case-environments"] ?? true)
                            ? environment.name.pascalCase.safeName
                            : environment.name.screamingSnakeCase.safeName,
                    type: this.csharp.Type.reference(this.context.getEnvironmentsClassReference()),
                    initializer: this.csharp.codeblock((writer) => {
                        writer.writeNode(
                            this.csharp.instantiateClass({
                                classReference: class_.reference,
                                arguments_: Object.entries(environment.urls).map(([id, url]) => {
                                    const baseUrl = this.multiUrlEnvironments.baseUrls.find((url) => url.id === id);
                                    if (baseUrl == null) {
                                        throw new Error(`Failed to find base url with id ${id}`);
                                    }
                                    return {
                                        name: baseUrl?.name.pascalCase.safeName ?? "",
                                        assignment: this.csharp.codeblock(this.csharp.string_({ string: url }))
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
                this.csharp.field({
                    access: ast.Access.Public,
                    name: baseUrl.name.pascalCase.safeName,
                    type: this.csharp.Type.string(),
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

    public generateSnippet(baseUrlValues?: ast.AstNode): ast.ClassInstantiation {
        const arguments_ = this.multiUrlEnvironments.baseUrls.map((baseUrl) => {
            const name = baseUrl.name.pascalCase.safeName;
            const value = baseUrlValues ?? `<${baseUrl.id} URL>`;
            return { name, assignment: value };
        });

        return this.csharp.instantiateClass({
            classReference: this.context.getEnvironmentsClassReference(),
            arguments_
        });
    }

    protected getFilepath(): RelativeFilePath {
        return join(
            this.context.project.filepaths.getPublicCoreFilesDirectory(),
            RelativeFilePath.of(`${this.context.getEnvironmentsClassReference().name}.cs`)
        );
    }
}
