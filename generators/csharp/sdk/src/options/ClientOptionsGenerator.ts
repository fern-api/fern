import { CSharpFile, FileGenerator } from "@fern-api/csharp-base";
import { ast } from "@fern-api/csharp-codegen";
import { join, RelativeFilePath } from "@fern-api/fs-utils";

import { Name } from "@fern-fern/ir-sdk/api";

import { SdkGeneratorContext } from "../SdkGeneratorContext";
import { BaseOptionsGenerator, OptionArgs } from "./BaseOptionsGenerator";

export class ClientOptionsGenerator extends FileGenerator<CSharpFile> {
    private baseOptionsGenerator: BaseOptionsGenerator;

    constructor(context: SdkGeneratorContext, baseOptionsGenerator: BaseOptionsGenerator) {
        super(context);

        this.baseOptionsGenerator = baseOptionsGenerator;
    }
    private baseUrlField: ast.Field | undefined;
    private environmentField: ast.Field | undefined;

    public doGenerate(): CSharpFile {
        const class_ = this.csharp.class_({
            reference: this.Types.ClientOptions,
            partial: true,
            access: ast.Access.Public,
            annotations: [this.System.Serializable]
        });
        const optionArgs: OptionArgs = {
            optional: false,
            includeInitializer: true
        };
        this.createBaseUrlField(class_);
        this.baseOptionsGenerator.getHttpClientField(class_, optionArgs);

        this.baseOptionsGenerator.getHttpHeadersField(class_, {
            optional: false,
            includeInitializer: true,
            interfaceReference: undefined
        });

        this.baseOptionsGenerator.getAdditionalHeadersField(class_, {
            summary:
                "Additional headers to be sent with HTTP requests.\nHeaders with matching keys will be overwritten by headers set on the request.",
            includeInitializer: true
        });

        this.baseOptionsGenerator.getMaxRetriesField(class_, optionArgs);
        this.baseOptionsGenerator.getTimeoutField(class_, optionArgs);
        this.baseOptionsGenerator.getLiteralHeaderOptions(class_, optionArgs);
        if (this.context.hasGrpcEndpoints()) {
            this.getGrpcOptionsField(class_);
        }

        if (this.settings.includeExceptionHandler) {
            class_.addField({
                summary: "A handler that will handle exceptions thrown by the client.",
                access: ast.Access.Internal,
                origin: class_.explicit("ExceptionHandler"),
                type: this.Types.ExceptionHandler,
                get: true,
                set: true,
                initializer: this.csharp.codeblock((writer) => {
                    writer.writeNode(
                        this.csharp.instantiateClass({
                            classReference: this.Types.ExceptionHandler,
                            arguments_: [this.csharp.codeblock("null")]
                        })
                    );
                })
            });
        }

        this.getCloneMethod(class_);

        return new CSharpFile({
            clazz: class_,
            directory: this.context.getPublicCoreDirectory(),
            allNamespaceSegments: this.context.getAllNamespaceSegments(),
            allTypeClassReferences: this.context.getAllTypeClassReferences(),
            namespace: this.namespaces.publicCore,
            generation: this.generation
        });
    }

    protected getFilepath(): RelativeFilePath {
        return join(this.constants.folders.publicCoreFiles, RelativeFilePath.of(`${this.Types.ClientOptions.name}.cs`));
    }

    private createBaseUrlField(classOrInterface: ast.Interface | ast.Class): ast.Field | undefined {
        const defaultEnvironmentId = this.context.ir.environments?.defaultEnvironment;
        let defaultEnvironment: Name | undefined = undefined;
        if (defaultEnvironmentId != null) {
            defaultEnvironment = this.context.ir.environments?.environments._visit({
                singleBaseUrl: (value) => {
                    return value.environments.find((env) => {
                        return env.id === defaultEnvironmentId;
                    })?.name;
                },
                multipleBaseUrls: (value) => {
                    return value.environments.find((env) => {
                        return env.id === defaultEnvironmentId;
                    })?.name;
                },
                _other: () => undefined
            });
        }
        const defaultEnvironmentName = this.settings.pascalCaseEnvironments
            ? defaultEnvironment?.pascalCase.safeName
            : defaultEnvironment?.screamingSnakeCase.safeName;

        if (this.context.ir.environments != null) {
            const field = this.context.ir.environments.environments._visit({
                singleBaseUrl: () => {
                    return (this.baseUrlField = classOrInterface.addField({
                        origin: classOrInterface.explicit("BaseUrl"),
                        access: ast.Access.Public,
                        get: true,
                        init: true,
                        useRequired: defaultEnvironment != null,
                        type: this.Primitive.string,
                        summary: this.baseOptionsGenerator.members.baseUrlSummary,
                        initializer:
                            defaultEnvironment != null
                                ? this.csharp.codeblock((writer) => {
                                      writer.writeNode(this.Types.Environments);
                                      writer.write(`.${defaultEnvironmentName}`);
                                  })
                                : this.csharp.codeblock('""') // TODO: remove this logic since it sets url to ""
                    }));
                },
                multipleBaseUrls: () => {
                    return (this.environmentField = classOrInterface.addField({
                        origin: classOrInterface.explicit("Environment"),
                        access: ast.Access.Public,
                        get: true,
                        init: true,
                        useRequired: defaultEnvironment != null,
                        type: this.Types.Environments,
                        summary: "The Environment for the API.",
                        initializer:
                            defaultEnvironment != null
                                ? this.csharp.codeblock((writer) => {
                                      writer.writeNode(this.Types.Environments);
                                      writer.write(`.${defaultEnvironmentName}`);
                                  })
                                : this.csharp.codeblock("null") // TODO: remove this logic since it sets url to null
                    }));
                },
                _other: () => undefined
            });
            return field;
        }

        return (this.baseUrlField = classOrInterface.addField({
            origin: classOrInterface.explicit("BaseUrl"),
            access: ast.Access.Public,
            get: true,
            init: true,
            useRequired: defaultEnvironment != null,
            type: this.Primitive.string,
            summary: this.baseOptionsGenerator.members.baseUrlSummary,
            initializer:
                defaultEnvironment != null
                    ? this.csharp.codeblock((writer) => {
                          writer.writeNode(this.Types.Environments);
                          writer.write(`.${defaultEnvironmentName}`);
                      })
                    : this.csharp.codeblock('""') // TODO: remove this logic since it sets url to ""
        }));
    }

    private getGrpcOptionsField(classOrInterface: ast.Interface | ast.Class): void {
        classOrInterface.addField({
            origin: classOrInterface.explicit("GrpcOptions"),
            access: ast.Access.Public,
            get: true,
            init: true,
            type: this.Types.GrpcChannelOptions.asOptional(),
            summary: "The options used for gRPC client endpoints."
        });
    }

    private getCloneMethod(cls: ast.Class): void {
        // TODO: add the GRPC options here eventually
        // TODO: iterate over all public fields and generate the clone logic
        // for Headers, we should add a `.Clone` method on it and call that

        cls.addMethod({
            access: ast.Access.Internal,
            summary: "Clones this and returns a new instance",
            name: "Clone",
            return_: this.Types.ClientOptions,
            body: this.csharp.codeblock((writer) => {
                writer.writeStatement(
                    `return new ClientOptions
{${this.baseUrlField ? `\n    ${this.baseUrlField.name} = ${this.baseUrlField.name},` : ""}${this.environmentField ? `\n    ${this.environmentField.name} = ${this.environmentField.name},` : ""}
    HttpClient = HttpClient,
    MaxRetries = MaxRetries,
    Timeout = Timeout,
    Headers = new `,
                    this.Types.Headers,
                    `(new Dictionary<string, `,
                    this.Types.HeaderValue,
                    `>(Headers)),
    ${this.settings.includeExceptionHandler ? "ExceptionHandler = ExceptionHandler.Clone()," : ""}
}`
                );
            }),
            isAsync: false,
            parameters: []
        });
    }
}
