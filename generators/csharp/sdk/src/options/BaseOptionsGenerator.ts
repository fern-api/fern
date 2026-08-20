import { assertNever } from "@fern-api/core-utils";
import { ast, type LazyResult, lazy, WithGeneration } from "@fern-api/csharp-codegen";

import { FernIr } from "@fern-fern/ir-sdk";

type HttpHeader = FernIr.HttpHeader;
type Literal = FernIr.Literal;

import { SdkGeneratorContext } from "../SdkGeneratorContext.js";

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
        super(context.generation);
    }

    public readonly members: LazyResult<{
        baseUrlSummary: () => string;
    }> = lazy({
        baseUrlSummary: () => "The Base URL for the API."
    });

    private createBaseUrlField(classOrInterface: ast.Interface | ast.Class) {
        classOrInterface.addField({
            access: ast.Access.Public,
            origin: classOrInterface.explicit("BaseUrl"),
            get: true,
            init: true,
            type: this.Primitive.string.asOptional(),
            summary: this.members.baseUrlSummary
        });
    }

    public getHttpClientField(
        classOrInterface: ast.Interface | ast.Class,
        { optional, includeInitializer }: OptionArgs
    ) {
        const type = this.System.Net.Http.HttpClient;
        classOrInterface.addField({
            origin: classOrInterface.explicit("HttpClient"),
            access: ast.Access.Public,
            get: true,
            init: true,
            type: optional ? type.asOptional() : type,
            initializer: includeInitializer
                ? this.csharp.codeblock((writer) => {
                      writer.writeNode(
                          this.csharp.invokeMethod({
                              on: this.Types.DefaultHttpClientFactory,
                              method: "Create",
                              arguments_: []
                          })
                      );
                  })
                : undefined,
            summary: "The http client used to make requests."
        });
    }

    public getHttpHeadersField(
        classOrInterface: ast.Interface | ast.Class,
        { optional, includeInitializer, interfaceReference }: HttpHeadersFieldOptionArgs
    ) {
        const headersReference = this.Types.Headers;
        classOrInterface.addField({
            // Don't use explicit interface implementation so Headers is accessible via options?.Headers
            // Must be internal since Headers type is internal
            origin: classOrInterface.explicit("Headers"),
            access: !interfaceReference ? ast.Access.Internal : undefined,
            get: true,
            init: true,
            type: optional ? headersReference.asOptional() : headersReference,
            initializer: includeInitializer ? this.csharp.codeblock("new()") : undefined,
            summary: "The http headers sent with the request.",
            interfaceReference
        });
    }

    public getMaxRetriesField(
        classOrInterface: ast.Interface | ast.Class,
        { optional, includeInitializer }: OptionArgs
    ) {
        const type = this.Primitive.integer;
        const maxRetries = this.settings.maxRetries ?? 2;
        classOrInterface.addField({
            origin: classOrInterface.explicit("MaxRetries"),
            access: ast.Access.Public,
            get: true,
            init: true,
            type: optional ? type.asOptional() : type,
            initializer: includeInitializer ? this.csharp.codeblock(String(maxRetries)) : undefined,
            summary: "The max number of retries to attempt."
        });
    }

    public getMaxStreamReconnectAttemptsField(classOrInterface: ast.Interface | ast.Class, { optional }: OptionArgs) {
        const type = this.Primitive.integer;
        classOrInterface.addField({
            origin: classOrInterface.explicit("MaxStreamReconnectAttempts"),
            access: ast.Access.Public,
            get: true,
            init: true,
            type: optional ? type.asOptional() : type,
            summary:
                "The max number of reconnection attempts for streaming endpoints.\nOnly applies to SSE streams marked as resumable."
        });
    }

    public getDisableStreamReconnectionField(classOrInterface: ast.Interface | ast.Class, { optional }: OptionArgs) {
        const type = this.Primitive.boolean;
        classOrInterface.addField({
            origin: classOrInterface.explicit("DisableStreamReconnection"),
            access: ast.Access.Public,
            get: true,
            init: true,
            type: optional ? type.asOptional() : type,
            summary:
                "When true, disables automatic reconnection for streaming endpoints.\nOnly applies to SSE streams marked as resumable."
        });
    }

    public getTimeoutField(classOrInterface: ast.Interface | ast.Class, { optional, includeInitializer }: OptionArgs) {
        const type = this.System.TimeSpan;
        const configured = this.settings.defaultTimeoutInMilliseconds;
        const initializer =
            configured === "infinity"
                ? this.csharp.codeblock("System.Threading.Timeout.InfiniteTimeSpan")
                : this.csharp.codeblock(`TimeSpan.FromMilliseconds(${configured ?? 30000})`);
        classOrInterface.addField({
            origin: classOrInterface.explicit("Timeout"),
            access: ast.Access.Public,
            get: true,
            init: true,
            type: optional ? type.asOptional() : type,
            initializer: includeInitializer ? initializer : undefined,
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
        const type = this.System.Collections.Generic.IEnumerable(
            this.System.Collections.Generic.KeyValuePair(this.Primitive.string, this.Primitive.string.asOptional())
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
    ): ast.Field | undefined {
        if (header.valueType.type !== "container" || header.valueType.container.type !== "literal") {
            return undefined;
        }
        return classOrInterface.addField({
            access: ast.Access.Public,
            origin: header,
            get: true,
            init: true,
            type: this.getLiteralRootClientParameterType({
                literal: header.valueType.container.literal
            }),
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
        // Headers property removed - we use HeadersBuilder at endpoint level and AdditionalHeaders for user-facing API
        this.getAdditionalHeadersField(classOrInterface, {
            summary:
                "Additional headers to be sent with the request.\nHeaders previously set with matching keys will be overwritten.",
            includeInitializer: true
        });
        this.getMaxRetriesField(classOrInterface, optionArgs);
        this.getTimeoutField(classOrInterface, optionArgs);
        if (this.context.hasResumableSseEndpoints) {
            this.getMaxStreamReconnectAttemptsField(classOrInterface, optionArgs);
            this.getDisableStreamReconnectionField(classOrInterface, optionArgs);
        }
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
        // Don't add Headers to interface - it's internal and only used by implementation class
        this.getAdditionalHeadersField(iface, {
            summary:
                "Additional headers to be sent with the request.\nHeaders previously set with matching keys will be overwritten.",
            includeInitializer: false
        });
        this.getMaxRetriesField(iface, optionArgs);
        this.getTimeoutField(iface, optionArgs);
        if (this.context.hasResumableSseEndpoints) {
            this.getMaxStreamReconnectAttemptsField(iface, optionArgs);
            this.getDisableStreamReconnectionField(iface, optionArgs);
        }
        this.getQueryParametersField(iface, {
            optional: false,
            includeInitializer: false
        });
        this.getBodyPropertiesField(iface, optionArgs);
    }

    /** Adds a client option for every literal-typed global header, and returns the added fields. */
    public getLiteralHeaderOptions(classOrInterface: ast.Interface | ast.Class, optionArgs: OptionArgs): ast.Field[] {
        const fields: ast.Field[] = [];
        for (const header of this.context.ir.headers) {
            const field = this.maybeGetLiteralHeaderField(classOrInterface, {
                header,
                options: optionArgs
            });
            if (field != null) {
                fields.push(field);
            }
        }
        return fields;
    }

    private getLiteralRootClientParameterType({ literal }: { literal: Literal }): ast.Type {
        switch (literal.type) {
            case "string":
                return this.Primitive.string.asOptional();
            case "boolean":
                return this.Primitive.boolean.asOptional();
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
                      writer.writeNode(this.context.getEnumerableEmptyKeyValuePairsInitializer());
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
