import { csharp, CSharpFile, FileGenerator } from "@fern-api/csharp-codegen";
import { join, RelativeFilePath } from "@fern-api/fs-utils";
import { SdkCustomConfigSchema } from "../SdkCustomConfig";
import { SdkGeneratorContext } from "../SdkGeneratorContext";

export const BASE_URL_FIELD = csharp.field({
    access: "public",
    name: "BaseUrl",
    get: true,
    init: true,
    type: csharp.Type.optional(csharp.Type.string()),
    summary: "The Base URL for the API."
});

export const HTTP_CLIENT_FIELD = csharp.field({
    access: "public",
    name: "HttpClient",
    get: true,
    init: true,
    type: csharp.Type.coreClass(
        csharp.coreClassReference({
            name: "HttpClient"
        })
    ),
    initializer: csharp.codeblock({
        value: "new HttpClient()"
    }),
    summary: "The http client used to make requests."
});

export const MAX_RETRIES_FIELD = csharp.field({
    access: "public",
    name: "MaxRetries",
    get: true,
    init: true,
    type: csharp.Type.integer(),
    initializer: csharp.codeblock({
        value: "2"
    }),
    summary: "The http client used to make requests."
});

export const TIMEOUT_IN_SECONDS = csharp.field({
    access: "public",
    name: "TimeoutInSeconds",
    get: true,
    init: true,
    type: csharp.Type.integer(),
    initializer: csharp.codeblock({
        value: "30"
    }),
    summary: "The timeout for the request in seconds."
});

export const CLIENT_OPTIONS_CLASS_NAME = "ClientOptions";

export class ClientOptionsGenerator extends FileGenerator<CSharpFile, SdkCustomConfigSchema, SdkGeneratorContext> {
    public doGenerate(): CSharpFile {
        const class_ = csharp.class_({
            name: CLIENT_OPTIONS_CLASS_NAME,
            namespace: this.context.getNamespace(),
            partial: true,
            access: "public"
        });
        class_.addField(BASE_URL_FIELD);
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
}
