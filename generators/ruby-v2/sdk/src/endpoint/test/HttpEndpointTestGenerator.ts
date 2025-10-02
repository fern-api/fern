import { assertNever } from "@fern-api/core-utils";
import { ruby } from "@fern-api/ruby-ast";
import { HttpEndpoint, HttpResponseBody } from "@fern-fern/ir-sdk/api";
import { SdkGeneratorContext } from "../../SdkGeneratorContext";

export declare namespace HttpEndpointTestGenerator {
    export interface Args {
        context: SdkGeneratorContext;
        endpoint: HttpEndpoint;
    }

    export interface Output {
        returnTypeIdentifier: string;
        returnTypeSampleDef: ruby.Method;
        blockTitle: string;
        tests: Test[];
    }

    export interface Test {
        title: string;
        block: ruby.AstNode[];
    }
}

const QUERY_PARAMETER_BAG_NAME = "_query";
export const HTTP_RESPONSE_VN = "_response";
export const PARAMS_VN = "params";
export const CODE_VN = "code";
export const ERROR_CLASS_VN = "error_class";

export class HttpEndpointTestGenerator {
    private context: SdkGeneratorContext;
    private endpoint: HttpEndpoint;

    public constructor({ context, endpoint }: HttpEndpointTestGenerator.Args) {
        this.context = context;
        this.endpoint = endpoint;
    }

    public generate(): HttpEndpointTestGenerator.Output | null {
        const response = this.endpoint.response;

        if (!response) {
            this.context.logger.warn(`Encountered endpoint without a response, skipping test generation for it`);
            return null;
        }
        let responseBody = response.body;
        if (!responseBody) {
            this.context.logger.warn(`Encountered endpoint without a body, skipping test generation for it`);
            return null;
        }
        let info = this.returnTypeInfo(responseBody);
        if (!info) {
            return null;
        }
        let [returnTypeIdentifier, returnTypeSampleDef] = info;

        return {
            returnTypeIdentifier,
            returnTypeSampleDef: ruby.method({
                name: `sample_${returnTypeIdentifier}`,
                statements: returnTypeSampleDef
            }),
            blockTitle: `#${this.endpoint.name}`,
            tests: []
        };
    }

    private returnTypeInfo(body: HttpResponseBody): [string, ruby.AstNode[]] | null {
        switch (body.type) {
            case "json":
                switch (body.value.type) {
                    case "response":
                        // body.value.responseBodyType;
                        return null;
                    case "nestedPropertyAsResponse":
                        this.context.logger.warn(
                            `Encountered endpoint that returns nested JSON, skipping test generation for it`
                        );
                        return null;
                    default:
                        assertNever(body.value);
                }
                return null; // Compiler doesn't seem to be smart about this?
            case "fileDownload":
            case "text":
            case "bytes":
            case "streaming":
            case "streamParameter":
                this.context.logger.warn(
                    `Encountered endpoint with a ${body.type} return type, skipping test generation for it`
                );
                return null;
            default:
                assertNever(body);
        }
    }
}
