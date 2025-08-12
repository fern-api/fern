// import { assertNever } from "@fern-api/core-utils";
import { ruby } from "@fern-api/ruby-ast";

import { HttpHeader, Literal } from "@fern-fern/ir-sdk/api";

import { SdkGeneratorContext } from "../SdkGeneratorContext";

export const BASE_URL_FIELD_NAME = "BaseUrl";
export const BASE_URL_SUMMARY = "The Base URL for the API.";
// const BASE_URL_FIELD = ruby.field({
//     access: ruby.Access.Public,
//     name: BASE_URL_FIELD_NAME,
//     get: true,
//     init: true,
//     type: ruby.Type.optional(ruby.Type.string()),
//     summary: BASE_URL_SUMMARY
// });

export interface OptionArgs {
    optional: boolean;
    includeInitializer: boolean;
}
export interface HttpHeadersFieldOptionArgs {
    optional: boolean;
    includeInitializer: boolean;
    interfaceReference?: ruby.ClassReference;
}

export class BaseOptionsGenerator {
    private context: SdkGeneratorContext;

    constructor(context: SdkGeneratorContext) {
        this.context = context;
    }

    // public getHttpClientField({ optional, includeInitializer }: OptionArgs): ruby.Field {
    //     const type = ruby.Type.reference(
    //         ruby.classReference({
    //             name: "HttpClient",
    //             namespace: "System.Net.Http"
    //         })
    //     );
    //     return ruby.field({
    //         access: ruby.Access.Public,
    //         name: "HttpClient",
    //         get: true,
    //         init: true,
    //         type: optional ? ruby.Type.optional(type) : type,
    //         initializer: includeInitializer ? ruby.codeblock("new HttpClient()") : undefined,
    //         summary: "The http client used to make requests."
    //     });
    // }

    // public getHttpHeadersField({
    //     optional,
    //     includeInitializer,
    //     interfaceReference
    // }: HttpHeadersFieldOptionArgs): ruby.Field {
    //     const headersReference = ruby.Type.reference(this.context.getHeadersClassReference());
    //     return ruby.field({
    //         // Classes implementing internal interface field cannot have an access modifier
    //         access: !interfaceReference ? ruby.Access.Internal : undefined,
    //         name: "Headers",
    //         get: true,
    //         init: true,
    //         type: optional ? ruby.Type.optional(headersReference) : headersReference,
    //         initializer: includeInitializer ? ruby.codeblock("new()") : undefined,
    //         summary: "The http headers sent with the request.",
    //         interfaceReference
    //     });
    // }

    // public getMaxRetriesField({ optional, includeInitializer }: OptionArgs): ruby.Field {
    //     const type = ruby.Type.integer();
    //     return ruby.field({
    //         access: ruby.Access.Public,
    //         name: "MaxRetries",
    //         get: true,
    //         init: true,
    //         type: optional ? ruby.Type.optional(type) : type,
    //         initializer: includeInitializer ? ruby.codeblock("2") : undefined,
    //         summary: "The http client used to make requests."
    //     });
    // }

    // public getTimeoutField({ optional, includeInitializer }: OptionArgs): ruby.Field {
    //     const type = ruby.Types.reference(
    //         ruby.classReference({
    //             name: "TimeSpan",
    //             namespace: "System"
    //         })
    //     );
    //     return ruby.field({
    //         access: ruby.Access.Public,
    //         name: "Timeout",
    //         get: true,
    //         init: true,
    //         type: optional ? ruby.Type.optional(type) : type,
    //         initializer: includeInitializer ? ruby.codeblock("TimeSpan.FromSeconds(30)") : undefined,
    //         summary: "The timeout for the request."
    //     });
    // }

    // public getAdditionalHeadersField({
    //     summary,
    //     includeInitializer
    // }: {
    //     summary: string;
    //     includeInitializer: boolean;
    // }): ruby.Field {
    //     const type = ruby.Type.reference(
    //         ruby.classReference({
    //             name: "IEnumerable",
    //             namespace: "System.Collections.Generic",
    //             generics: [
    //                 ruby.Type.reference(
    //                     this.context.getKeyValuePairsClassReference({
    //                         key: ruby.Type.string(),
    //                         value: ruby.Type.string().toOptionalIfNotAlready()
    //                     })
    //                 )
    //             ]
    //         })
    //     );
    //     return ruby.field({
    //         access: ruby.Access.Public,
    //         name: "AdditionalHeaders",
    //         get: true,
    //         init: true,
    //         type,
    //         initializer: includeInitializer ? ruby.codeblock("[]") : undefined,
    //         summary
    //     });
    // }

    // public maybeGetLiteralHeaderField({
    //     header,
    //     options
    // }: {
    //     header: HttpHeader;
    //     options: OptionArgs;
    // }): ruby.Field | undefined {
    //     if (header.valueType.type !== "container" || header.valueType.container.type !== "literal") {
    //         return undefined;
    //     }
    //     return ruby.field({
    //         access: ruby.Access.Public,
    //         name: header.name.name.pascalCase.safeName,
    //         get: true,
    //         init: true,
    //         type: this.getLiteralRootClientParameterType({ literal: header.valueType.container.literal }),
    //         summary: header.docs,
    //         initializer: options.includeInitializer ? ruby.codeblock("null") : undefined
    //     });
    // }

    // public getRequestOptionFields(): ruby.Field[] {
    //     const optionArgs: OptionArgs = {
    //         optional: true,
    //         includeInitializer: false
    //     };
    //     return [
    //         BASE_URL_FIELD,
    //         this.getHttpClientField(optionArgs),
    //         this.getHttpHeadersField({
    //             optional: false,
    //             includeInitializer: true,
    //             interfaceReference: this.context.getRequestOptionsInterfaceReference()
    //         }),
    //         this.getAdditionalHeadersField({
    //             summary:
    //                 "Additional headers to be sent with the request.\nHeaders previously set with matching keys will be overwritten.",
    //             includeInitializer: true
    //         }),
    //         this.getMaxRetriesField(optionArgs),
    //         this.getTimeoutField(optionArgs),
    //         this.getQueryParametersField({
    //             optional: false,
    //             includeInitializer: true
    //         }),
    //         this.getBodyPropertiesField(optionArgs),
    //         ...this.getLiteralHeaderOptions(optionArgs)
    //     ];
    // }

    // public getRequestOptionInterfaceFields(): ruby.Field[] {
    //     const optionArgs: OptionArgs = {
    //         optional: true,
    //         includeInitializer: false
    //     };
    //     return [
    //         BASE_URL_FIELD,
    //         this.getHttpClientField(optionArgs),
    //         this.getHttpHeadersField({ optional: false, includeInitializer: false, interfaceReference: undefined }),
    //         this.getAdditionalHeadersField({
    //             summary:
    //                 "Additional headers to be sent with the request.\nHeaders previously set with matching keys will be overwritten.",
    //             includeInitializer: false
    //         }),
    //         this.getMaxRetriesField(optionArgs),
    //         this.getTimeoutField(optionArgs),
    //         this.getQueryParametersField({ optional: false, includeInitializer: false }),
    //         this.getBodyPropertiesField(optionArgs)
    //     ];
    // }

    // public getIdempotentRequestOptionFields(): ruby.Field[] {
    //     return this.context.getIdempotencyHeaders().map((header) =>
    //         ruby.field({
    //             access: ruby.Access.Public,
    //             name: header.name.name.pascalCase.safeName,
    //             get: true,
    //             init: true,
    //             type: this.context.csharpTypeMapper.convert({ reference: header.valueType }),
    //             summary: header.docs
    //         })
    //     );
    // }

    // public getLiteralHeaderOptions(optionArgs: OptionArgs): ruby.Field[] {
    //     const fields: ruby.Field[] = [];
    //     for (const header of this.context.ir.headers) {
    //         const field = this.maybeGetLiteralHeaderField({ header, options: optionArgs });
    //         if (field != null) {
    //             fields.push(field);
    //         }
    //     }
    //     return fields;
    // }

    // private getLiteralRootClientParameterType({ literal }: { literal: Literal }): ruby.Type {
    //     switch (literal.type) {
    //         case "string":
    //             return ruby.Type.optional(ruby.Type.string());
    //         case "boolean":
    //             return ruby.Type.optional(ruby.Type.boolean());
    //         default:
    //             assertNever(literal);
    //     }
    // }

    // private getQueryParametersField({ includeInitializer }: OptionArgs): ruby.Field {
    //     return ruby.field({
    //         access: ruby.Access.Public,
    //         name: "AdditionalQueryParameters",
    //         type: this.context.getAdditionalQueryParametersType(),
    //         summary: "Additional query parameters sent with the request.",
    //         get: true,
    //         init: true,
    //         skipDefaultInitializer: true,
    //         initializer: includeInitializer
    //             ? ruby.codeblock((writer) => {
    //                   writer.writeNode(this.context.getEnumerableEmptyKeyValuePairsInitializer());
    //               })
    //             : undefined
    //     });
    // }

    // private getBodyPropertiesField({ includeInitializer }: OptionArgs): ruby.Field {
    //     return ruby.field({
    //         access: ruby.Access.Public,
    //         name: "AdditionalBodyProperties",
    //         type: this.context.getAdditionalBodyPropertiesType(),
    //         summary: "Additional body properties sent with the request.\nThis is only applied to JSON requests.",
    //         get: true,
    //         init: true,
    //         initializer: includeInitializer ? ruby.codeblock("null") : undefined
    //     });
    // }
}
