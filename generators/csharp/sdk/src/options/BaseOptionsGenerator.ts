import { assertNever } from "@fern-api/core-utils";
import { ast } from "@fern-api/csharp-codegen";

import { HttpHeader, Literal } from "@fern-fern/ir-sdk/api";

import { SdkGeneratorContext } from "../SdkGeneratorContext";

export const BASE_URL_FIELD_NAME = "BaseUrl";
export const BASE_URL_SUMMARY = "The Base URL for the API.";

export interface OptionArgs {
    optional: boolean;
    includeInitializer: boolean;
}
export interface HttpHeadersFieldOptionArgs {
    optional: boolean;
    includeInitializer: boolean;
    interfaceReference?: ast.ClassReference;
}

export class BaseOptionsGenerator {
    private context: SdkGeneratorContext;

    constructor(context: SdkGeneratorContext) {
        this.context = context;
        this.BASE_URL_FIELD = this.csharp.field({
            access: ast.Access.Public,
            name: BASE_URL_FIELD_NAME,
            get: true,
            init: true,
            type: this.csharp.Type.optional(this.csharp.Type.string()),
            summary: BASE_URL_SUMMARY
        });
    }
    private get csharp() {
        return this.context.csharp;
    }

    BASE_URL_FIELD: ast.Field;

    public getHttpClientField({ optional, includeInitializer }: OptionArgs): ast.Field {
        const type = this.csharp.Type.reference(this.csharp.System.Net.Http.HttpClient);
        return this.csharp.field({
            access: ast.Access.Public,
            name: "HttpClient",
            get: true,
            init: true,
            type: optional ? this.csharp.Type.optional(type) : type,
            initializer: includeInitializer ? this.csharp.codeblock("new HttpClient()") : undefined,
            summary: "The http client used to make requests."
        });
    }

    public getHttpHeadersField({
        optional,
        includeInitializer,
        interfaceReference
    }: HttpHeadersFieldOptionArgs): ast.Field {
        const headersReference = this.csharp.Type.reference(this.context.getHeadersClassReference());
        return this.csharp.field({
            // Classes implementing internal interface field cannot have an access modifier
            access: !interfaceReference ? ast.Access.Internal : undefined,
            name: "Headers",
            get: true,
            init: true,
            type: optional ? this.csharp.Type.optional(headersReference) : headersReference,
            initializer: includeInitializer ? this.csharp.codeblock("new()") : undefined,
            summary: "The http headers sent with the request.",
            interfaceReference
        });
    }

    public getMaxRetriesField({ optional, includeInitializer }: OptionArgs): ast.Field {
        const type = this.csharp.Type.integer();
        return this.csharp.field({
            access: ast.Access.Public,
            name: "MaxRetries",
            get: true,
            init: true,
            type: optional ? this.csharp.Type.optional(type) : type,
            initializer: includeInitializer ? this.csharp.codeblock("2") : undefined,
            summary: "The http client used to make requests."
        });
    }

    public getTimeoutField({ optional, includeInitializer }: OptionArgs): ast.Field {
        const type = this.csharp.Type.reference(this.csharp.System.TimeSpan);
        return this.csharp.field({
            access: ast.Access.Public,
            name: "Timeout",
            get: true,
            init: true,
            type: optional ? this.csharp.Type.optional(type) : type,
            initializer: includeInitializer ? this.csharp.codeblock("TimeSpan.FromSeconds(30)") : undefined,
            summary: "The timeout for the request."
        });
    }

    public getAdditionalHeadersField({
        summary,
        includeInitializer
    }: {
        summary: string;
        includeInitializer: boolean;
    }): ast.Field {
        const type = this.csharp.Type.reference(
            this.csharp.System.Collections.Generic.IEnumerable(
                this.csharp.Type.reference(
                    this.context.getKeyValuePairsClassReference({
                        key: this.csharp.Type.string(),
                        value: this.csharp.Type.string().toOptionalIfNotAlready()
                    })
                )
            )
        );
        return this.csharp.field({
            access: ast.Access.Public,
            name: "AdditionalHeaders",
            get: true,
            init: true,
            type,
            initializer: includeInitializer ? this.csharp.codeblock("[]") : undefined,
            summary
        });
    }

    public maybeGetLiteralHeaderField({
        header,
        options
    }: {
        header: HttpHeader;
        options: OptionArgs;
    }): ast.Field | undefined {
        if (header.valueType.type !== "container" || header.valueType.container.type !== "literal") {
            return undefined;
        }
        return this.csharp.field({
            access: ast.Access.Public,
            name: header.name.name.pascalCase.safeName,
            get: true,
            init: true,
            type: this.getLiteralRootClientParameterType({ literal: header.valueType.container.literal }),
            summary: header.docs,
            initializer: options.includeInitializer ? this.csharp.codeblock("null") : undefined
        });
    }

    public getRequestOptionFields(): ast.Field[] {
        const optionArgs: OptionArgs = {
            optional: true,
            includeInitializer: false
        };
        return [
            this.BASE_URL_FIELD,
            this.getHttpClientField(optionArgs),
            this.getHttpHeadersField({
                optional: false,
                includeInitializer: true,
                interfaceReference: this.context.getRequestOptionsInterfaceReference()
            }),
            this.getAdditionalHeadersField({
                summary:
                    "Additional headers to be sent with the request.\nHeaders previously set with matching keys will be overwritten.",
                includeInitializer: true
            }),
            this.getMaxRetriesField(optionArgs),
            this.getTimeoutField(optionArgs),
            this.getQueryParametersField({
                optional: false,
                includeInitializer: true
            }),
            this.getBodyPropertiesField(optionArgs),
            ...this.getLiteralHeaderOptions(optionArgs)
        ];
    }

    public getRequestOptionInterfaceFields(): ast.Field[] {
        const optionArgs: OptionArgs = {
            optional: true,
            includeInitializer: false
        };
        return [
            this.BASE_URL_FIELD,
            this.getHttpClientField(optionArgs),
            this.getHttpHeadersField({ optional: false, includeInitializer: false, interfaceReference: undefined }),
            this.getAdditionalHeadersField({
                summary:
                    "Additional headers to be sent with the request.\nHeaders previously set with matching keys will be overwritten.",
                includeInitializer: false
            }),
            this.getMaxRetriesField(optionArgs),
            this.getTimeoutField(optionArgs),
            this.getQueryParametersField({ optional: false, includeInitializer: false }),
            this.getBodyPropertiesField(optionArgs)
        ];
    }

    public getIdempotentRequestOptionFields(): ast.Field[] {
        return this.context.getIdempotencyHeaders().map((header) =>
            this.csharp.field({
                access: ast.Access.Public,
                name: header.name.name.pascalCase.safeName,
                get: true,
                init: true,
                type: this.context.csharpTypeMapper.convert({ reference: header.valueType }),
                summary: header.docs
            })
        );
    }

    public getLiteralHeaderOptions(optionArgs: OptionArgs): ast.Field[] {
        const fields: ast.Field[] = [];
        for (const header of this.context.ir.headers) {
            const field = this.maybeGetLiteralHeaderField({ header, options: optionArgs });
            if (field != null) {
                fields.push(field);
            }
        }
        return fields;
    }

    private getLiteralRootClientParameterType({ literal }: { literal: Literal }): ast.Type {
        switch (literal.type) {
            case "string":
                return this.csharp.Type.optional(this.csharp.Type.string());
            case "boolean":
                return this.csharp.Type.optional(this.csharp.Type.boolean());
            default:
                assertNever(literal);
        }
    }

    private getQueryParametersField({ includeInitializer }: OptionArgs): ast.Field {
        return this.csharp.field({
            access: ast.Access.Public,
            name: "AdditionalQueryParameters",
            type: this.context.getAdditionalQueryParametersType(),
            summary: "Additional query parameters sent with the request.",
            get: true,
            init: true,
            skipDefaultInitializer: true,
            initializer: includeInitializer
                ? this.csharp.codeblock((writer) => {
                      writer.writeNode(this.context.getEnumerableEmptyKeyValuePairsInitializer());
                  })
                : undefined
        });
    }

    private getBodyPropertiesField({ includeInitializer }: OptionArgs): ast.Field {
        return this.csharp.field({
            access: ast.Access.Public,
            name: "AdditionalBodyProperties",
            type: this.context.getAdditionalBodyPropertiesType(),
            summary: "Additional body properties sent with the request.\nThis is only applied to JSON requests.",
            get: true,
            init: true,
            initializer: includeInitializer ? this.csharp.codeblock("null") : undefined
        });
    }
}
