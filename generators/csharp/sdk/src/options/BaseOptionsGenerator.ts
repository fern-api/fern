import { csharp } from "@fern-api/csharp-codegen";
import { Name } from "@fern-fern/ir-sdk/api";
import { SdkGeneratorContext } from "../SdkGeneratorContext";

export const BASE_URL_FIELD_NAME = "BaseUrl";
export const ENVIRONMENT_FIELD_NAME = "Environment";

export interface OptionArgs {
    optional: boolean;
    includeInitializer: boolean;
}

export class BaseOptionsGenerator {
    private context: SdkGeneratorContext;

    constructor(context: SdkGeneratorContext) {
        this.context = context;
    }

    public getHttpClientField({ optional, includeInitializer }: OptionArgs): csharp.Field {
        const type = csharp.Type.reference(
            csharp.classReference({
                name: "HttpClient",
                namespace: "System.Net.Http"
            })
        );
        return csharp.field({
            access: "public",
            name: "HttpClient",
            get: true,
            init: true,
            type: optional ? csharp.Type.optional(type) : type,
            initializer: includeInitializer ? csharp.codeblock("new HttpClient()") : undefined,
            summary: "The http client used to make requests."
        });
    }

    public getMaxRetriesField({ optional, includeInitializer }: OptionArgs): csharp.Field {
        const type = csharp.Type.integer();
        return csharp.field({
            access: "public",
            name: "MaxRetries",
            get: true,
            init: true,
            type: optional ? csharp.Type.optional(type) : type,
            initializer: includeInitializer ? csharp.codeblock("2") : undefined,
            summary: "The http client used to make requests."
        });
    }

    public getTimeoutField({ optional, includeInitializer }: OptionArgs): csharp.Field {
        const type = csharp.Type.integer();
        return csharp.field({
            access: "public",
            name: "TimeoutInSeconds",
            get: true,
            init: true,
            type: optional ? csharp.Type.optional(type) : type,
            initializer: includeInitializer ? csharp.codeblock("30") : undefined,
            summary: "The timeout for the request in seconds."
        });
    }

    public getBaseUrlField({ optional, includeInitializer }: OptionArgs): csharp.Field {
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

        if (this.context.ir.environments != null) {
            const field = this.context.ir.environments.environments._visit({
                singleBaseUrl: () => {
                    const type = csharp.Type.string();
                    return csharp.field({
                        access: "public",
                        name: "BaseUrl",
                        get: true,
                        init: true,
                        useRequired: defaultEnvironment != null,
                        type: optional ? csharp.Type.optional(type) : type,
                        summary: "The Base URL for the API.",
                        initializer: includeInitializer
                            ? defaultEnvironment != null
                                ? csharp.codeblock((writer) => {
                                      writer.writeNode(this.context.getEnvironmentsClassReference());
                                      writer.write(`.${defaultEnvironment?.screamingSnakeCase.safeName}`);
                                  })
                                : csharp.codeblock('""') // TODO: remove this logic since it sets url to ""
                            : undefined
                    });
                },
                multipleBaseUrls: () => {
                    const type = csharp.Type.reference(this.context.getEnvironmentsClassReference());
                    return csharp.field({
                        access: "public",
                        name: "Environment",
                        get: true,
                        init: true,
                        useRequired: defaultEnvironment != null,
                        type: optional ? csharp.Type.optional(type) : type,
                        summary: "The Environment for the API.",
                        initializer: includeInitializer
                            ? defaultEnvironment != null
                                ? csharp.codeblock((writer) => {
                                      writer.writeNode(this.context.getEnvironmentsClassReference());
                                      writer.write(`.${defaultEnvironment?.screamingSnakeCase.safeName}`);
                                  })
                                : csharp.codeblock("null") // TODO: remove this logic since it sets url to null
                            : undefined
                    });
                },
                _other: () => undefined
            });
            if (field != null) {
                return field;
            }
        }

        const type = csharp.Type.string();
        return csharp.field({
            access: "public",
            name: "BaseUrl",
            get: true,
            init: true,
            useRequired: defaultEnvironment != null,
            type: optional ? csharp.Type.optional(csharp.Type.string()) : type,
            summary: "The Base URL for the API.",
            initializer: includeInitializer
                ? defaultEnvironment != null
                    ? csharp.codeblock((writer) => {
                          writer.writeNode(this.context.getEnvironmentsClassReference());
                          writer.write(`.${defaultEnvironment?.screamingSnakeCase.safeName}`);
                      })
                    : csharp.codeblock('""') // TODO: remove this logic since it sets url to ""
                : undefined
        });
    }
}
