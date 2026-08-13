import { CaseConverter, GeneratorError } from "@fern-api/base-generator";
import { ruby } from "@fern-api/ruby-ast";
import { FernIr } from "@fern-fern/ir-sdk";
import { SdkGeneratorContext } from "../../SdkGeneratorContext.js";
import { isUrlEncodedRequestBody } from "../../utils/requestBody.js";
import { RawClient } from "../http/RawClient.js";

export const BODY_BAG_NAME = "body_params";
export const PATH_PARAM_NAMES_VN = "path_param_names";

export interface QueryParameterCodeBlock {
    code: ruby.CodeBlock;
    queryParameterBagReference: string;
}

export interface HeaderParameterCodeBlock {
    code: ruby.CodeBlock;
    headerParameterBagReference: string;
}

export interface RequestBodyCodeBlock {
    code?: ruby.CodeBlock;
    requestBodyReference: ruby.CodeBlock;
    /**
     * True when the body reference evaluates to nil for callers that pass no body,
     * in which case the request must omit the Content-Type header as well.
     */
    omitContentTypeWithoutBody?: boolean;
}

export abstract class EndpointRequest {
    protected readonly case: CaseConverter;

    public constructor(
        protected readonly context: SdkGeneratorContext,
        protected readonly sdkRequest: FernIr.SdkRequest,
        protected readonly endpoint: FernIr.HttpEndpoint
    ) {
        this.case = context.caseConverter;
    }

    public getParameterName(): string {
        return this.case.camelSafe(this.sdkRequest.requestParameterName);
    }

    public getRequestBodyVariableName(): string {
        return "requestBody";
    }

    public abstract getParameterType(): ruby.Type;

    /**
     * True when the IR marks the referenced JSON request body as optional and the generator
     * is configured to let callers omit it entirely. Form-urlencoded bodies are excluded
     * because their request class always sends a form content type.
     */
    protected respectsOptionalRequestBody(): boolean {
        const requestBody = this.endpoint.requestBody;
        return (
            this.context.customConfig.respectOptionalRequestBody === true &&
            requestBody != null &&
            requestBody.type === "reference" &&
            requestBody.required === false &&
            !isUrlEncodedRequestBody(requestBody)
        );
    }

    /**
     * Writes `<bodyVariableName>.empty? ? nil : ` so that an omitted optional body
     * becomes a nil body rather than an empty object.
     */
    protected writeOptionalBodyGuard(writer: ruby.Writer, bodyVariableName: string): void {
        writer.write(`${bodyVariableName}.empty? ? nil : `);
    }

    protected getPathParameterNames(): string[] {
        return this.endpoint.allPathParameters.map((pathParameter) => this.case.snakeSafe(pathParameter.name));
    }

    protected hasPathParameters(): boolean {
        return this.endpoint.allPathParameters.length > 0;
    }

    /**
     * Writes the statements that split the path parameters out of `params`, so that the
     * request body only carries the properties the endpoint actually declares as body fields.
     */
    protected writePathParameterExclusion(writer: ruby.Writer): void {
        writer.writeLine(`${PATH_PARAM_NAMES_VN} = ${toRubySymbolArray(this.getPathParameterNames())}`);
        writer.writeLine(`${BODY_BAG_NAME} = params.except(*${PATH_PARAM_NAMES_VN})`);
    }

    /**
     * Follows alias-of-named chains to the terminal type id so request bodies
     * declared as aliases of objects are serialized through the aliased class
     * (applying wire-name mappings) rather than passed through as a raw hash.
     */
    protected resolveNamedTypeId(typeId: FernIr.TypeId): FernIr.TypeId {
        const seen = new Set<FernIr.TypeId>();
        let currentTypeId = typeId;
        while (!seen.has(currentTypeId)) {
            seen.add(currentTypeId);
            const declaration = this.context.getTypeDeclarationOrThrow(currentTypeId);
            if (declaration.shape.type !== "alias" || declaration.shape.aliasOf.type !== "named") {
                break;
            }
            currentTypeId = declaration.shape.aliasOf.typeId;
        }
        return currentTypeId;
    }

    public abstract getQueryParameterCodeBlock(queryParameterBagName: string): QueryParameterCodeBlock | undefined;

    public abstract getHeaderParameterCodeBlock(): HeaderParameterCodeBlock | undefined;

    public abstract getRequestBodyCodeBlock(): RequestBodyCodeBlock | undefined;

    public abstract getRequestType(): RawClient.RequestBodyType | undefined;
}

export function toRubySymbolArray(names: string[]): string {
    if (names.some((name) => name.includes(" "))) {
        throw GeneratorError.internalError("Symbol array cannot contain spaces");
    }
    return `%i[${names.join(" ")}]`;
}
