import { csharp } from "@fern-api/csharp-codegen";

import { SdkGeneratorContext } from "../SdkGeneratorContext";

export const BASE_URL_FIELD_NAME = "BaseUrl";
export const BASE_URL_SUMMARY = "The Base URL for the API.";
const BASE_URL_FIELD = csharp.field({
    access: csharp.Access.Public,
    name: BASE_URL_FIELD_NAME,
    get: true,
    init: true,
    type: csharp.Type.optional(csharp.Type.string()),
    summary: BASE_URL_SUMMARY
});

export interface OptionArgs {
    optional: boolean;
    includeInitializer: boolean;
}
export interface HttpHeadersFieldOptionArgs {
    optional: boolean;
    includeInitializer: boolean;
    interfaceReference?: csharp.ClassReference;
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
            access: csharp.Access.Public,
            name: "HttpClient",
            get: true,
            init: true,
            type: optional ? csharp.Type.optional(type) : type,
            initializer: includeInitializer ? csharp.codeblock("new HttpClient()") : undefined,
            summary: "The http client used to make requests."
        });
    }

    public getHttpHeadersField({
        optional,
        includeInitializer,
        interfaceReference
    }: HttpHeadersFieldOptionArgs): csharp.Field {
        const headersReference = csharp.Type.reference(this.context.getHeadersClassReference());
        return csharp.field({
            // Classes implenting internal interface field cannot have an access modifier
            access: !interfaceReference ? csharp.Access.Internal : undefined,
            name: "Headers",
            get: true,
            init: true,
            type: optional ? csharp.Type.optional(headersReference) : headersReference,
            initializer: includeInitializer ? csharp.codeblock("new()") : undefined,
            summary: "The http headers sent with the request.",
            interfaceReference
        });
    }

    public getMaxRetriesField({ optional, includeInitializer }: OptionArgs): csharp.Field {
        const type = csharp.Type.integer();
        return csharp.field({
            access: csharp.Access.Public,
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
            access: csharp.Access.Public,
            name: "Timeout",
            get: true,
            init: true,
            type: optional ? csharp.Type.optional(type) : type,
            initializer: includeInitializer ? csharp.codeblock("TimeSpan.FromSeconds(30)") : undefined,
            summary: "The timeout for the request."
        });
    }

    public getRequestOptionFields(): csharp.Field[] {
        const optionArgs: OptionArgs = {
            optional: true,
            includeInitializer: false
        };
        return [
            BASE_URL_FIELD,
            this.getHttpClientField(optionArgs),
            this.getHttpHeadersField({
                optional: false,
                includeInitializer: true,
                interfaceReference: this.context.getRequestOptionsInterfaceReference()
            }),
            this.getMaxRetriesField(optionArgs),
            this.getTimeoutField(optionArgs)
        ];
    }

    public getRequestOptionInterfaceFields(): csharp.Field[] {
        const optionArgs: OptionArgs = {
            optional: true,
            includeInitializer: false
        };
        return [
            BASE_URL_FIELD,
            this.getHttpClientField(optionArgs),
            this.getHttpHeadersField({ optional: false, includeInitializer: false, interfaceReference: undefined }),
            this.getMaxRetriesField(optionArgs),
            this.getTimeoutField(optionArgs)
        ];
    }

    public getIdepotentRequestOptionFields(): csharp.Field[] {
        return this.context.getIdempotencyHeaders().map((header) =>
            csharp.field({
                access: csharp.Access.Public,
                name: header.name.name.pascalCase.safeName,
                get: true,
                init: true,
                type: this.context.csharpTypeMapper.convert({ reference: header.valueType }),
                summary: header.docs
            })
        );
    }
}
