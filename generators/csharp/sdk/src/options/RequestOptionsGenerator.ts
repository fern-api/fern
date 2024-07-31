import { csharp, CSharpFile, FileGenerator } from "@fern-api/csharp-codegen";
import { join, RelativeFilePath } from "@fern-api/fs-utils";
import { Name } from "@fern-fern/ir-sdk/api";
import { SdkCustomConfigSchema } from "../SdkCustomConfig";
import { SdkGeneratorContext } from "../SdkGeneratorContext";

export const BASE_URL_FIELD_NAME = "BaseUrl";
export const ENVIRONMENT_FIELD_NAME = "Environment";

export const HTTP_CLIENT_FIELD = csharp.field({
    access: "public",
    name: "HttpClient",
    get: true,
    init: true,
    type: csharp.Type.optional(
        csharp.Type.reference(
            csharp.classReference({
                name: "HttpClient",
                namespace: "System.Net.Http"
            })
        )
    ),
    summary: "The http client used to make requests."
});

export const MAX_RETRIES_FIELD = csharp.field({
    access: "public",
    name: "MaxRetries",
    get: true,
    init: true,
    type: csharp.Type.optional(csharp.Type.integer()),
    summary: "The http client used to make requests."
});

export const TIMEOUT_IN_SECONDS = csharp.field({
    access: "public",
    name: "TimeoutInSeconds",
    get: true,
    init: true,
    type: csharp.Type.optional(csharp.Type.integer()),
    summary: "The timeout for the request in seconds."
});

export const REQUEST_OPTIONS_CLASS_NAME = "RequestOptions";
export const REQUEST_OPTIONS_PARAMETER_NAME = "options";

export class RequestOptionsGenerator extends FileGenerator<CSharpFile, SdkCustomConfigSchema, SdkGeneratorContext> {
    public doGenerate(): CSharpFile {
        const class_ = csharp.class_({
            name: REQUEST_OPTIONS_CLASS_NAME,
            namespace: this.context.getCoreNamespace(),
            partial: true,
            access: "public"
        });
        class_.addField(this.getBaseUrlField());
        class_.addField(HTTP_CLIENT_FIELD);
        class_.addField(MAX_RETRIES_FIELD);
        class_.addField(TIMEOUT_IN_SECONDS);
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

        if (this.context.ir.environments != null) {
            const field = this.context.ir.environments.environments._visit({
                singleBaseUrl: () => {
                    return csharp.field({
                        access: "public",
                        name: BASE_URL_FIELD_NAME,
                        get: true,
                        init: true,
                        useRequired: defaultEnvironment != null,
                        type: csharp.Type.optional(csharp.Type.string()),
                        summary: "The Base URL for the API."
                    });
                },
                multipleBaseUrls: () => {
                    return csharp.field({
                        access: "public",
                        name: ENVIRONMENT_FIELD_NAME,
                        get: true,
                        init: true,
                        useRequired: defaultEnvironment != null,
                        type: csharp.Type.optional(csharp.Type.reference(this.context.getEnvironmentsClassReference())),
                        summary: "The Environment for the API."
                    });
                },
                _other: () => undefined
            });
            if (field != null) {
                return field;
            }
        }

        return csharp.field({
            access: "public",
            name: BASE_URL_FIELD_NAME,
            get: true,
            init: true,
            useRequired: defaultEnvironment != null,
            type: csharp.Type.optional(csharp.Type.string()),
            summary: "The Base URL for the API."
        });
    }
}
