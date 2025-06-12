import { go } from "@fern-api/go-ast";

import { HttpEndpoint, HttpMethod } from "@fern-fern/ir-sdk/api";

import { SdkGeneratorContext } from "../SdkGeneratorContext";

export declare namespace Caller {
    export interface CallArgs {
        endpoint: HttpEndpoint;
        clientReference: go.AstNode;
        optionsReference: go.AstNode;
        url: go.AstNode;
        request?: go.AstNode;
        response?: go.AstNode;
    }
}

/**
 * Utility class that helps make calls to the RawClient.
 */
export class Caller {
    public static TYPE_NAME = "Caller";
    public static FIELD_NAME = "caller";
    public static CALL_PARAMS_TYPE_NAME = "CallParams";
    public static CALL_METHOD_NAME = "Call";

    private context: SdkGeneratorContext;

    public constructor(context: SdkGeneratorContext) {
        this.context = context;
    }

    public getTypeReference(): go.TypeReference {
        return go.typeReference({
            name: Caller.TYPE_NAME,
            importPath: this.context.getInternalImportPath()
        });
    }

    public getCallParamsTypeReference(): go.TypeReference {
        return go.typeReference({
            name: Caller.CALL_PARAMS_TYPE_NAME,
            importPath: this.context.getInternalImportPath()
        });
    }

    public getFieldName(): string {
        return Caller.FIELD_NAME;
    }

    public getField(): go.Field {
        return go.field({
            name: this.getFieldName(),
            type: go.Type.reference(this.getTypeReference())
        });
    }

    public instantiate({ fields }: { fields: go.StructField[] }): go.AstNode {
        return go.TypeInstantiation.structPointer({
            typeReference: this.getTypeReference(),
            fields
        });
    }

    public call(args: Caller.CallArgs): go.AstNode {
        const arguments_: go.StructField[] = [
            {
                name: "URL",
                value: go.TypeInstantiation.reference(args.url)
            },
            {
                name: "Method",
                value: go.TypeInstantiation.string("TODO: Add a method to map to the HTTP method type reference.")
            },

            // TODO: Add a function to map all options based on their field name.
            {
                name: "Headers",
                value: go.TypeInstantiation.reference(
                    go.selector({
                        on: args.optionsReference,
                        selector: go.TypeInstantiation.string("Headers")
                    })
                )
            },
            {
                name: "MaxAttempts",
                value: go.TypeInstantiation.reference(
                    go.selector({
                        on: args.optionsReference,
                        selector: go.TypeInstantiation.string("MaxAttempts")
                    })
                )
            }
        ];
        if (args.request != null) {
            arguments_.push({
                name: "Request",
                value: go.TypeInstantiation.reference(args.request)
            });
        }
        if (args.response != null) {
            arguments_.push({
                name: "Response",
                value: go.TypeInstantiation.reference(args.response)
            });
        }
        return go.codeblock((writer) => {
            writer.writeNode(
                go.invokeMethod({
                    on: args.clientReference,
                    method: Caller.CALL_METHOD_NAME,
                    arguments_: [
                        go.TypeInstantiation.structPointer({
                            typeReference: this.getCallParamsTypeReference(),
                            fields: arguments_
                        })
                    ]
                })
            );
        });
    }
}
