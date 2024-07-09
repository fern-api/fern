import { csharp, CSharpFile, FileGenerator } from "@fern-api/csharp-codegen";
import { join, RelativeFilePath } from "@fern-api/fs-utils";
import { SingleBaseUrlEnvironment } from "@fern-fern/ir-sdk/api";
import { SdkCustomConfigSchema } from "../SdkCustomConfig";
import { SdkGeneratorContext } from "../SdkGeneratorContext";

export const HTTP_CLIENT_FIELD = csharp.field({
    access: "public",
    name: "HttpClient",
    get: true,
    init: true,
    type: csharp.Type.reference(
        csharp.classReference({
            name: "HttpClient",
            namespace: "System.Net.Http"
        })
    ),
    initializer: csharp.codeblock("new HttpClient()"),
    summary: "The http client used to make requests."
});

export const MAX_RETRIES_FIELD = csharp.field({
    access: "public",
    name: "MaxRetries",
    get: true,
    init: true,
    type: csharp.Type.integer(),
    initializer: csharp.codeblock("2"),
    summary: "The http client used to make requests."
});

export const TIMEOUT_IN_SECONDS = csharp.field({
    access: "public",
    name: "TimeoutInSeconds",
    get: true,
    init: true,
    type: csharp.Type.integer(),
    initializer: csharp.codeblock("30"),
    summary: "The timeout for the request in seconds."
});

export const CLIENT_OPTIONS_CLASS_NAME = "ClientOptions";

export class ClientOptionsGenerator extends FileGenerator<CSharpFile, SdkCustomConfigSchema, SdkGeneratorContext> {
    public doGenerate(): CSharpFile {
        const class_ = csharp.class_({
            name: CLIENT_OPTIONS_CLASS_NAME,
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
            RelativeFilePath.of(`${CLIENT_OPTIONS_CLASS_NAME}.cs`)
        );
    }

    private getBaseUrlField(): csharp.Field {
        let defaultEnvironment: SingleBaseUrlEnvironment | undefined = undefined;
        if (
            this.context.ir.environments?.defaultEnvironment != null &&
            this.context.ir.environments?.environments.type === "singleBaseUrl"
        ) {
            const singleBaseUrlDefault = this.context.ir.environments.environments.environments.filter(
                (singleBaseUrl) => {
                    return singleBaseUrl.id === this.context.ir.environments?.defaultEnvironment;
                }
            );
            if (singleBaseUrlDefault[0] != null) {
                defaultEnvironment = singleBaseUrlDefault[0];
            }
        }
        return csharp.field({
            access: "public",
            name: "BaseUrl",
            get: true,
            init: true,
            type: csharp.Type.string(),
            summary: "The Base URL for the API.",
            initializer:
                defaultEnvironment != null
                    ? csharp.codeblock((writer) => {
                          writer.writeNode(this.context.getEnvironmentsClassReference());
                          writer.write(`.${defaultEnvironment?.name.screamingSnakeCase.safeName}`);
                      })
                    : undefined
        });
    }
}
