import { CSharpFile, FileGenerator, csharp } from "@fern-api/csharp-codegen";
import { RelativeFilePath, join } from "@fern-api/fs-utils";

import { Name } from "@fern-fern/ir-sdk/api";

import { SdkCustomConfigSchema } from "../SdkCustomConfig";
import { SdkGeneratorContext } from "../SdkGeneratorContext";
import { BASE_URL_FIELD_NAME, BASE_URL_SUMMARY, BaseOptionsGenerator, OptionArgs } from "./BaseOptionsGenerator";

export const CLIENT_OPTIONS_CLASS_NAME = "ClientOptions";
export const GLOBAL_TEST_SETUP_NAME = "GlobalTestSetup";

export class ClientOptionsGenerator extends FileGenerator<CSharpFile, SdkCustomConfigSchema, SdkGeneratorContext> {
    private baseOptionsGenerator: BaseOptionsGenerator;

    constructor(context: SdkGeneratorContext, baseOptionsGenerator: BaseOptionsGenerator) {
        super(context);

        this.baseOptionsGenerator = baseOptionsGenerator;
    }

    public doGenerate(): CSharpFile {
        const class_ = csharp.class_({
            ...this.context.getClientOptionsClassReference(),
            partial: true,
            access: csharp.Access.Public
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
        class_.addField(this.baseOptionsGenerator.getMaxRetriesField(optionArgs));
        class_.addField(this.baseOptionsGenerator.getTimeoutField(optionArgs));
        if (this.context.hasGrpcEndpoints()) {
            class_.addField(this.getGrpcOptionsField());
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

    private getBaseUrlField(): csharp.Field {
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
                    return csharp.field({
                        access: csharp.Access.Public,
                        name: BASE_URL_FIELD_NAME,
                        get: true,
                        init: true,
                        useRequired: defaultEnvironment != null,
                        type: csharp.Type.string(),
                        summary: BASE_URL_SUMMARY,
                        initializer:
                            defaultEnvironment != null
                                ? csharp.codeblock((writer) => {
                                      writer.writeNode(this.context.getEnvironmentsClassReference());
                                      writer.write(`.${defaultEnvironmentName}`);
                                  })
                                : csharp.codeblock('""') // TODO: remove this logic since it sets url to ""
                    });
                },
                multipleBaseUrls: () => {
                    return csharp.field({
                        access: csharp.Access.Public,
                        name: "Environment",
                        get: true,
                        init: true,
                        useRequired: defaultEnvironment != null,
                        type: csharp.Type.reference(this.context.getEnvironmentsClassReference()),
                        summary: "The Environment for the API.",
                        initializer:
                            defaultEnvironment != null
                                ? csharp.codeblock((writer) => {
                                      writer.writeNode(this.context.getEnvironmentsClassReference());
                                      writer.write(`.${defaultEnvironmentName}`);
                                  })
                                : csharp.codeblock("null") // TODO: remove this logic since it sets url to null
                    });
                },
                _other: () => undefined
            });
            if (field != null) {
                return field;
            }
        }

        return csharp.field({
            access: csharp.Access.Public,
            name: BASE_URL_FIELD_NAME,
            get: true,
            init: true,
            useRequired: defaultEnvironment != null,
            type: csharp.Type.string(),
            summary: BASE_URL_SUMMARY,
            initializer:
                defaultEnvironment != null
                    ? csharp.codeblock((writer) => {
                          writer.writeNode(this.context.getEnvironmentsClassReference());
                          writer.write(`.${defaultEnvironmentName}`);
                      })
                    : csharp.codeblock('""') // TODO: remove this logic since it sets url to ""
        });
    }

    private getGrpcOptionsField(): csharp.Field {
        return csharp.field({
            access: csharp.Access.Public,
            name: this.context.getGrpcChannelOptionsFieldName(),
            get: true,
            init: true,
            type: csharp.Type.optional(csharp.Type.reference(this.context.getGrpcChannelOptionsClassReference())),
            summary: "The options used for gRPC client endpoints."
        });
    }

    private getCloneMethod(class_: csharp.Class): csharp.Method {
        // TODO: add the GRPC options here eventually
        return csharp.method({
            access: csharp.Access.Internal,
            summary: "Clones this and returns a new instance",
            name: "Clone",
            return_: csharp.Type.reference(this.context.getClientOptionsClassReference()),
            body: csharp.codeblock((writer) => {
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
    Headers = new Headers(new Dictionary<string, HeaderValue>(Headers))
}`
                );
            }),
            isAsync: false,
            parameters: []
        });
    }
}
