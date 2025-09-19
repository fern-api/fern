import { CSharpFile, FileGenerator } from "@fern-api/csharp-base";
import { ast } from "@fern-api/csharp-codegen";
import { join, RelativeFilePath } from "@fern-api/fs-utils";

import { Name } from "@fern-fern/ir-sdk/api";

import { SdkCustomConfigSchema } from "../SdkCustomConfig";
import { SdkGeneratorContext } from "../SdkGeneratorContext";
import { BASE_URL_FIELD_NAME, BASE_URL_SUMMARY, BaseOptionsGenerator, OptionArgs } from "./BaseOptionsGenerator";

export const CLIENT_OPTIONS_CLASS_NAME = "ClientOptions";
export const GLOBAL_TEST_SETUP_NAME = "GlobalTestSetup";
export const EXCEPTION_HANDLER_MEMBER_NAME = "ExceptionHandler";

export class ClientOptionsGenerator extends FileGenerator<CSharpFile, SdkCustomConfigSchema, SdkGeneratorContext> {
    private baseOptionsGenerator: BaseOptionsGenerator;

    constructor(context: SdkGeneratorContext, baseOptionsGenerator: BaseOptionsGenerator) {
        super(context);

        this.baseOptionsGenerator = baseOptionsGenerator;
    }

    public doGenerate(): CSharpFile {
        const class_ = this.csharp.class_({
            ...this.context.getClientOptionsClassReference(),
            partial: true,
            access: ast.Access.Public,
            annotations: [this.context.getSerializableAttribute()]
        });
        const optionArgs: OptionArgs = {
            optional: false,
            includeInitializer: true
        };
        class_.addField(this.getBaseUrlField());
        class_.addField(this.baseOptionsGenerator.getHttpClientField(optionArgs));
        class_.addField(
            this.baseOptionsGenerator.getHttpHeadersField({
                optional: false,
                includeInitializer: true,
                interfaceReference: undefined
            })
        );
        class_.addField(
            this.baseOptionsGenerator.getAdditionalHeadersField({
                summary:
                    "Additional headers to be sent with HTTP requests.\nHeaders with matching keys will be overwritten by headers set on the request.",
                includeInitializer: true
            })
        );
        class_.addField(this.baseOptionsGenerator.getMaxRetriesField(optionArgs));
        class_.addField(this.baseOptionsGenerator.getTimeoutField(optionArgs));
        class_.addFields(this.baseOptionsGenerator.getLiteralHeaderOptions(optionArgs));
        if (this.context.hasGrpcEndpoints()) {
            class_.addField(this.getGrpcOptionsField());
        }

        if (this.context.includeExceptionHandler()) {
            class_.addField(
                this.csharp.field({
                    summary: "A handler that will handle exceptions thrown by the client.",
                    access: ast.Access.Internal,
                    name: EXCEPTION_HANDLER_MEMBER_NAME,
                    type: this.csharp.Type.reference(this.context.getExceptionHandlerClassReference()),
                    get: true,
                    set: true,
                    initializer: this.csharp.codeblock((writer) => {
                        writer.writeNode(
                            this.csharp.instantiateClass({
                                classReference: this.context.getExceptionHandlerClassReference(),
                                arguments_: [this.csharp.codeblock("null")]
                            })
                        );
                    })
                })
            );
        }

        class_.addMethod(this.getCloneMethod(class_));

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
            RelativeFilePath.of(`${CLIENT_OPTIONS_CLASS_NAME}.cs`)
        );
    }

    private getBaseUrlField(): ast.Field {
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
        const defaultEnvironmentName =
            (this.context.customConfig["pascal-case-environments"] ?? true)
                ? defaultEnvironment?.pascalCase.safeName
                : defaultEnvironment?.screamingSnakeCase.safeName;

        if (this.context.ir.environments != null) {
            const field = this.context.ir.environments.environments._visit({
                singleBaseUrl: () => {
                    return this.csharp.field({
                        access: ast.Access.Public,
                        name: BASE_URL_FIELD_NAME,
                        get: true,
                        init: true,
                        useRequired: defaultEnvironment != null,
                        type: this.csharp.Type.string(),
                        summary: BASE_URL_SUMMARY,
                        initializer:
                            defaultEnvironment != null
                                ? this.csharp.codeblock((writer) => {
                                      writer.writeNode(this.context.getEnvironmentsClassReference());
                                      writer.write(`.${defaultEnvironmentName}`);
                                  })
                                : this.csharp.codeblock('""') // TODO: remove this logic since it sets url to ""
                    });
                },
                multipleBaseUrls: () => {
                    return this.csharp.field({
                        access: ast.Access.Public,
                        name: "Environment",
                        get: true,
                        init: true,
                        useRequired: defaultEnvironment != null,
                        type: this.csharp.Type.reference(this.context.getEnvironmentsClassReference()),
                        summary: "The Environment for the API.",
                        initializer:
                            defaultEnvironment != null
                                ? this.csharp.codeblock((writer) => {
                                      writer.writeNode(this.context.getEnvironmentsClassReference());
                                      writer.write(`.${defaultEnvironmentName}`);
                                  })
                                : this.csharp.codeblock("null") // TODO: remove this logic since it sets url to null
                    });
                },
                _other: () => undefined
            });
            if (field != null) {
                return field;
            }
        }

        return this.csharp.field({
            access: ast.Access.Public,
            name: BASE_URL_FIELD_NAME,
            get: true,
            init: true,
            useRequired: defaultEnvironment != null,
            type: this.csharp.Type.string(),
            summary: BASE_URL_SUMMARY,
            initializer:
                defaultEnvironment != null
                    ? this.csharp.codeblock((writer) => {
                          writer.writeNode(this.context.getEnvironmentsClassReference());
                          writer.write(`.${defaultEnvironmentName}`);
                      })
                    : this.csharp.codeblock('""') // TODO: remove this logic since it sets url to ""
        });
    }

    private getGrpcOptionsField(): ast.Field {
        return this.csharp.field({
            access: ast.Access.Public,
            name: this.context.getGrpcChannelOptionsFieldName(),
            get: true,
            init: true,
            type: this.csharp.Type.optional(
                this.csharp.Type.reference(this.context.getGrpcChannelOptionsClassReference())
            ),
            summary: "The options used for gRPC client endpoints."
        });
    }

    private getCloneMethod(class_: ast.Class): ast.Method {
        // TODO: add the GRPC options here eventually
        return this.csharp.method({
            access: ast.Access.Internal,
            summary: "Clones this and returns a new instance",
            name: "Clone",
            return_: this.csharp.Type.reference(this.context.getClientOptionsClassReference()),
            body: this.csharp.codeblock((writer) => {
                writer.writeTextStatement(
                    `return new ClientOptions
{
` +
                        // TODO: iterate over all public fields and generate the clone logic
                        // for Headers, we should add a `.Clone` method on it and call that
                        (class_.getFields().find((field) => field.name === "Environment") !== undefined
                            ? "    Environment = Environment,"
                            : "") +
                        (class_.getFields().find((field) => field.name === BASE_URL_FIELD_NAME) !== undefined
                            ? `    ${BASE_URL_FIELD_NAME} = ${BASE_URL_FIELD_NAME},`
                            : "") +
                        `
    HttpClient = HttpClient,
    MaxRetries = MaxRetries,
    Timeout = Timeout,
    Headers = new Headers(new Dictionary<string, HeaderValue>(Headers)),
    ${this.context.includeExceptionHandler() ? "ExceptionHandler = ExceptionHandler.Clone()," : ""}
}`
                );
            }),
            isAsync: false,
            parameters: []
        });
    }
}
