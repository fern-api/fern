import { GeneratorError } from "@fern-api/base-generator";
import { CSharpFile, FileGenerator } from "@fern-api/csharp-base";
import { ast } from "@fern-api/csharp-codegen";
import { join, RelativeFilePath } from "@fern-api/fs-utils";

import { FernIr } from "@fern-fern/ir-sdk";

type MultipleBaseUrlsEnvironments = FernIr.MultipleBaseUrlsEnvironments;

import { SdkGeneratorContext } from "../SdkGeneratorContext.js";

export declare namespace SingleUrlEnvironmentGenerator {
    interface Args {
        context: SdkGeneratorContext;
        multiUrlEnvironments: MultipleBaseUrlsEnvironments;
    }
}

export class MultiUrlEnvironmentGenerator extends FileGenerator<CSharpFile> {
    private multiUrlEnvironments: MultipleBaseUrlsEnvironments;

    constructor({ context, multiUrlEnvironments }: SingleUrlEnvironmentGenerator.Args) {
        super(context);
        this.multiUrlEnvironments = multiUrlEnvironments;
    }

    public doGenerate(): CSharpFile {
        const class_ = this.csharp.class_({
            reference: this.Types.Environments,
            partial: false,
            access: ast.Access.Public,
            annotations: [this.System.Serializable]
        });

        for (const environment of this.multiUrlEnvironments.environments) {
            class_.addField({
                origin: class_.explicit(
                    this.settings.pascalCaseEnvironments
                        ? this.case.pascalSafe(environment.name)
                        : this.case.screamingSnakeSafe(environment.name)
                ),
                enclosingType: class_,
                access: ast.Access.Public,
                static_: true,
                readonly: true,

                type: this.Types.Environments,
                initializer: this.csharp.codeblock((writer) => {
                    writer.writeNode(
                        this.csharp.instantiateClass({
                            classReference: class_.reference,
                            arguments_: Object.entries(environment.urls).map(([id, url]) => {
                                const baseUrl = this.multiUrlEnvironments.baseUrls.find((url) => url.id === id);
                                if (baseUrl == null) {
                                    throw GeneratorError.referenceError(`Failed to find base url with id ${id}`);
                                }
                                return {
                                    name: this.case.pascalSafe(baseUrl?.name) ?? "",
                                    assignment: this.csharp.codeblock(this.csharp.string_({ string: url }))
                                };
                            })
                        })
                    );
                })
            });
        }

        for (const baseUrl of this.multiUrlEnvironments.baseUrls) {
            class_.addField({
                origin: baseUrl,
                access: ast.Access.Public,
                type: this.Primitive.string,
                get: true,
                init: true,
                summary: `URL for the ${baseUrl.id} service`
            });
        }

        return new CSharpFile({
            clazz: class_,
            directory: RelativeFilePath.of(this.context.getPublicCoreDirectory()),
            allNamespaceSegments: this.context.getAllNamespaceSegments(),
            allTypeClassReferences: this.context.getAllTypeClassReferences(),
            namespace: this.namespaces.root,
            generation: this.generation
        });
    }

    public generateSnippet(baseUrlValues?: ast.AstNode): ast.ClassInstantiation {
        const arguments_ = this.multiUrlEnvironments.baseUrls.map((baseUrl) => {
            const name = this.case.pascalSafe(baseUrl.name);
            const value = baseUrlValues ?? `<${baseUrl.id} URL>`;
            return { name, assignment: value };
        });

        return this.csharp.instantiateClass({
            classReference: this.Types.Environments,
            arguments_
        });
    }

    protected getFilepath(): RelativeFilePath {
        return join(this.constants.folders.publicCoreFiles, RelativeFilePath.of(`${this.Types.Environments.name}.cs`));
    }
}
