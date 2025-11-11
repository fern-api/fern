import { assertNever } from "@fern-api/core-utils";
import { ast, lazy, WithGeneration } from "@fern-api/csharp-codegen";

import { HttpHeader, Literal } from "@fern-fern/ir-sdk/api";

import { SdkGeneratorContext } from "../SdkGeneratorContext";

export interface OptionArgs {
    optional: boolean;
    includeInitializer: boolean;
}
export interface HttpHeadersFieldOptionArgs {
    optional: boolean;
    includeInitializer: boolean;
    interfaceReference?: ast.ClassReference;
}

export class BaseOptionsGenerator extends WithGeneration {
    constructor(private readonly context: SdkGeneratorContext) {
        super(context);
    }

    public readonly members = lazy({
        baseUrlSummary: () => "The Base URL for the API."
    });

    private createBaseUrlField(classOrInterface: ast.Interface | ast.Class) {
        classOrInterface.addField({
            access: ast.Access.Public,
            origin: classOrInterface.explicit("BaseUrl"),
            get: true,
            init: true,
            type: this.csharp.Type.optional(this.csharp.Type.string),
            summary: this.members.baseUrlSummary
        });
    }

    public getHttpClientField(
        classOrInterface: ast.Interface | ast.Class,
        { optional, includeInitializer }: OptionArgs
    ) {
        const type = this.csharp.Type.reference(this.extern.System.Net.Http.HttpClient);
        classOrInterface.addField({
            origin: classOrInterface.explicit("HttpClient"),
            access: ast.Access.Public,
            get: true,
            init: true,
            type: optional ? this.csharp.Type.optional(type) : type,
            initializer: includeInitializer ? this.csharp.codeblock("new HttpClient()") : undefined,
            summary: "The http client used to make requests."
        });
    }

    public getHttpHeadersField(
        classOrInterface: ast.Interface | ast.Class,
        { optional, includeInitializer, interfaceReference }: HttpHeadersFieldOptionArgs
    ) {
        const headersReference = this.csharp.Type.reference(this.types.Headers);
        classOrInterface.addField({
            // Classes implementing internal interface field cannot have an access modifier
            origin: classOrInterface.explicit("Headers"),
            access: !interfaceReference ? ast.Access.Internal : undefined,
            get: true,
            init: true,
            type: optional ? this.csharp.Type.optional(headersReference) : headersReference,
            initializer: includeInitializer ? this.csharp.codeblock("new()") : undefined,
            summary: "The http headers sent with the request.",
            interfaceReference
        });
    }

    public getMaxRetriesField(
        classOrInterface: ast.Interface | ast.Class,
        { optional, includeInitializer }: OptionArgs
    ) {
        const type = this.csharp.Type.integer;
        classOrInterface.addField({
            origin: classOrInterface.explicit("MaxRetries"),
            access: ast.Access.Public,
            get: true,
            init: true,
            type: optional ? this.csharp.Type.optional(type) : type,
            initializer: includeInitializer ? this.csharp.codeblock("2") : undefined,
            summary: "The http client used to make requests."
        });
    }

    public getTimeoutField(classOrInterface: ast.Interface | ast.Class, { optional, includeInitializer }: OptionArgs) {
        const type = this.csharp.Type.reference(this.extern.System.TimeSpan);
        classOrInterface.addField({
            origin: classOrInterface.explicit("Timeout"),
            access: ast.Access.Public,
            get: true,
            init: true,
            type: optional ? this.csharp.Type.optional(type) : type,
            initializer: includeInitializer ? this.csharp.codeblock("TimeSpan.FromSeconds(30)") : undefined,
            summary: "The timeout for the request."
        });
    }

    public getAdditionalHeadersField(
        classOrInterface: ast.Interface | ast.Class,
        {
            summary,
            includeInitializer
        }: {
            summary: string;
            includeInitializer: boolean;
        }
    ) {
        const type = this.csharp.Type.reference(
            this.extern.System.Collections.Generic.IEnumerable(
                this.csharp.Type.reference(
                    this.extern.System.Collections.Generic.KeyValuePair(
                        this.csharp.Type.string,
                        this.csharp.Type.string.toOptionalIfNotAlready()
                    )
                )
            )
        );
        classOrInterface.addField({
            origin: classOrInterface.explicit("AdditionalHeaders"),
            access: ast.Access.Public,
            get: true,
            init: true,
            type,
            initializer: includeInitializer ? this.csharp.codeblock("[]") : undefined,
            summary
        });
    }

    public maybeGetLiteralHeaderField(
        classOrInterface: ast.Interface | ast.Class,
        {
            header,
            options
        }: {
            header: HttpHeader;
            options: OptionArgs;
        }
    ) {
        if (header.valueType.type !== "container" || header.valueType.container.type !== "literal") {
            return;
        }
        classOrInterface.addField({
            access: ast.Access.Public,
            origin: header,
            get: true,
            init: true,
            type: this.getLiteralRootClientParameterType({ literal: header.valueType.container.literal }),
            summary: header.docs,
            initializer: options.includeInitializer ? this.csharp.codeblock("null") : undefined
        });
    }

    public getRequestOptionFields(classOrInterface: ast.Interface | ast.Class) {
        const optionArgs: OptionArgs = {
            optional: true,
            includeInitializer: false
        };

        this.createBaseUrlField(classOrInterface);
        this.getHttpClientField(classOrInterface, optionArgs);
        this.getHttpHeadersField(classOrInterface, {
            optional: false,
            includeInitializer: true,
            interfaceReference: this.types.RequestOptionsInterface
        });
        this.getAdditionalHeadersField(classOrInterface, {
            summary:
                "Additional headers to be sent with the request.\nHeaders previously set with matching keys will be overwritten.",
            includeInitializer: true
        });
        this.getMaxRetriesField(classOrInterface, optionArgs);
        this.getTimeoutField(classOrInterface, optionArgs);
        this.getQueryParametersField(classOrInterface, {
            optional: false,
            includeInitializer: true
        });
        this.getBodyPropertiesField(classOrInterface, optionArgs);
        this.getLiteralHeaderOptions(classOrInterface, optionArgs);
    }

    public getRequestOptionInterfaceFields(iface: ast.Interface) {
        const optionArgs: OptionArgs = {
            optional: true,
            includeInitializer: false
        };

        this.createBaseUrlField(iface);
        this.getHttpClientField(iface, optionArgs);
        this.getHttpHeadersField(iface, {
            optional: false,
            includeInitializer: false,
            interfaceReference: undefined
        });
        this.getAdditionalHeadersField(iface, {
            summary:
                "Additional headers to be sent with the request.\nHeaders previously set with matching keys will be overwritten.",
            includeInitializer: false
        });
        this.getMaxRetriesField(iface, optionArgs);
        this.getTimeoutField(iface, optionArgs);
        this.getQueryParametersField(iface, { optional: false, includeInitializer: false });
        this.getBodyPropertiesField(iface, optionArgs);
    }

    public getLiteralHeaderOptions(classOrInterface: ast.Interface | ast.Class, optionArgs: OptionArgs) {
        for (const header of this.context.ir.headers) {
            this.maybeGetLiteralHeaderField(classOrInterface, { header, options: optionArgs });
        }
    }

    private getLiteralRootClientParameterType({ literal }: { literal: Literal }): ast.Type {
        switch (literal.type) {
            case "string":
                return this.csharp.Type.optional(this.csharp.Type.string);
            case "boolean":
                return this.csharp.Type.optional(this.csharp.Type.boolean);
            default:
                assertNever(literal);
        }
    }

    private getQueryParametersField(classOrInterface: ast.Interface | ast.Class, { includeInitializer }: OptionArgs) {
        classOrInterface.addField({
            origin: classOrInterface.explicit("AdditionalQueryParameters"),
            access: ast.Access.Public,
            type: this.context.getAdditionalQueryParametersType(),
            summary: "Additional query parameters sent with the request.",
            get: true,
            init: true,
            skipDefaultInitializer: true,
            initializer: includeInitializer
                ? this.csharp.codeblock((writer) => {
                      writer.writeNode(this.context.common.getEnumerableEmptyKeyValuePairsInitializer());
                  })
                : undefined
        });
    }

    private getBodyPropertiesField(classOrInterface: ast.Interface | ast.Class, { includeInitializer }: OptionArgs) {
        classOrInterface.addField({
            origin: classOrInterface.explicit("AdditionalBodyProperties"),
            access: ast.Access.Public,
            type: this.context.getAdditionalBodyPropertiesType(),
            summary: "Additional body properties sent with the request.\nThis is only applied to JSON requests.",
            get: true,
            init: true,
            initializer: includeInitializer ? this.csharp.codeblock("null") : undefined
        });
    }
}
