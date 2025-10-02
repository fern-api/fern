import { ruby } from "@fern-api/ruby-ast";
import { HttpEndpoint } from "@fern-fern/ir-sdk/api";
import { SdkGeneratorContext } from "../../SdkGeneratorContext";

export declare namespace HttpEndpointTestGenerator {
    export interface GenerateArgs {
        endpoint: HttpEndpoint;
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

    public constructor({ context }: { context: SdkGeneratorContext }) {
        this.context = context;
    }

    public generate({ endpoint }: HttpEndpointTestGenerator.GenerateArgs): HttpEndpointTestGenerator.Test[] {
        return [];
    }
}
