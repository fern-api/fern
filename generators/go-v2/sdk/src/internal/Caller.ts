import { go } from "@fern-api/go-ast"

import { HttpEndpoint } from "@fern-fern/ir-sdk/api"

import { SdkGeneratorContext } from "../SdkGeneratorContext"

export declare namespace Caller {
    export interface CallArgs {
        endpoint: HttpEndpoint
        clientReference: go.AstNode
        optionsReference: go.AstNode
        url: go.AstNode
        request?: go.AstNode
        response?: go.AstNode
        errorCodes?: go.AstNode
    }
}

/**
 * Utility class that helps make HTTP calls.
 */
export class Caller {
    public static TYPE_NAME = "Caller"
    public static FIELD_NAME = "caller"
    public static CONSTRUCTOR_FUNC_NAME = "NewCaller"
    public static CALLER_PARAMS_TYPE_NAME = "CallerParams"
    public static CALL_PARAMS_TYPE_NAME = "CallParams"
    public static CALL_METHOD_NAME = "Call"

    private context: SdkGeneratorContext

    public constructor(context: SdkGeneratorContext) {
        this.context = context
    }

    public getTypeReference(): go.TypeReference {
        return go.typeReference({
            name: Caller.TYPE_NAME,
            importPath: this.context.getInternalImportPath()
        })
    }

    public getConstructorTypeReference(): go.TypeReference {
        return go.typeReference({
            name: Caller.CONSTRUCTOR_FUNC_NAME,
            importPath: this.context.getInternalImportPath()
        })
    }

    public getCallerParamsTypeReference(): go.TypeReference {
        return go.typeReference({
            name: Caller.CALLER_PARAMS_TYPE_NAME,
            importPath: this.context.getInternalImportPath()
        })
    }

    public getCallParamsTypeReference(): go.TypeReference {
        return go.typeReference({
            name: Caller.CALL_PARAMS_TYPE_NAME,
            importPath: this.context.getInternalImportPath()
        })
    }

    public getFieldName(): string {
        return Caller.FIELD_NAME
    }

    public getField(): go.Field {
        return go.field({
            name: this.getFieldName(),
            type: go.Type.pointer(go.Type.reference(this.getTypeReference()))
        })
    }

    public instantiate({ client, maxAttempts }: { client: go.AstNode; maxAttempts: go.AstNode }): go.AstNode {
        return go.invokeFunc({
            func: this.getConstructorTypeReference(),
            arguments_: [
                go.TypeInstantiation.structPointer({
                    typeReference: this.getCallerParamsTypeReference(),
                    fields: [
                        {
                            name: "Client",
                            value: go.TypeInstantiation.reference(client)
                        },
                        {
                            name: "MaxAttempts",
                            value: go.TypeInstantiation.reference(maxAttempts)
                        }
                    ]
                })
            ]
        })
    }

    public call(args: Caller.CallArgs): go.AstNode {
        const arguments_: go.StructField[] = [
            {
                name: "URL",
                value: go.TypeInstantiation.reference(args.url)
            },
            {
                name: "Method",
                value: go.TypeInstantiation.reference(this.context.getNetHttpMethodTypeReference(args.endpoint.method))
            },
            {
                name: "Headers",
                value: go.TypeInstantiation.reference(go.codeblock("headers"))
            },
            {
                name: "MaxAttempts",
                value: go.TypeInstantiation.reference(
                    go.selector({
                        on: args.optionsReference,
                        selector: go.codeblock("MaxAttempts")
                    })
                )
            },
            {
                name: "BodyProperties",
                value: go.TypeInstantiation.reference(
                    go.selector({
                        on: args.optionsReference,
                        selector: go.codeblock("BodyProperties")
                    })
                )
            },
            {
                name: "QueryParameters",
                value: go.TypeInstantiation.reference(
                    go.selector({
                        on: args.optionsReference,
                        selector: go.codeblock("QueryParameters")
                    })
                )
            },
            {
                name: "Client",
                value: go.TypeInstantiation.reference(
                    go.selector({
                        on: args.optionsReference,
                        selector: go.codeblock("HTTPClient")
                    })
                )
            }
        ]
        if (args.request != null) {
            arguments_.push({
                name: "Request",
                value: go.TypeInstantiation.reference(args.request)
            })
        }
        if (args.response != null) {
            arguments_.push({
                name: "Response",
                value: go.TypeInstantiation.reference(args.response)
            })
        }
        if (args.errorCodes != null) {
            arguments_.push({
                name: "ErrorDecoder",
                value: go.TypeInstantiation.reference(this.context.callNewErrorDecoder([args.errorCodes]))
            })
        }
        return go.codeblock((writer) => {
            writer.writeNode(
                go.invokeMethod({
                    on: args.clientReference,
                    method: Caller.CALL_METHOD_NAME,
                    arguments_: [
                        this.context.getContextParameterReference(),
                        go.TypeInstantiation.structPointer({
                            typeReference: this.getCallParamsTypeReference(),
                            fields: arguments_
                        })
                    ]
                })
            )
        })
    }
}
