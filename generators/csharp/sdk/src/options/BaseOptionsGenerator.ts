import { csharp } from "@fern-api/csharp-codegen";
import { SdkGeneratorContext } from "../SdkGeneratorContext";

export const BASE_URL_FIELD_NAME = "BaseUrl";
export const BASE_URL_SUMMARY = "The Base URL for the API.";

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
        const type = csharp.Types.reference(
            csharp.classReference({
                name: "TimeSpan",
                namespace: "System"
            })
        );
        return csharp.field({
            access: "public",
            name: "Timeout",
            get: true,
            init: true,
            type: optional ? csharp.Type.optional(type) : type,
            initializer: includeInitializer ? csharp.codeblock("TimeSpan.FromSeconds(30)") : undefined,
            summary: "The timeout for the request."
        });
    }
}
