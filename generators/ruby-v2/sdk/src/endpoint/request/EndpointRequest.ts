import { CaseConverter, GeneratorError } from "@fern-api/base-generator";
import { ruby } from "@fern-api/ruby-ast";
import { FernIr } from "@fern-fern/ir-sdk";
import { SdkGeneratorContext } from "../../SdkGeneratorContext.js";
import { isUrlEncodedRequestBody, unwrapTypeReference } from "../../utils/requestBody.js";
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

    /**
     * Returns the type id of the model the body is built from when the body type (following
     * alias-of-named chains) is a class whose fields are passed as keyword arguments. Returns
     * undefined for bodies passed as a single argument (containers, primitives, enums, and
     * aliases of those), which are sent as the bare value.
     */
    protected getModelBodyTypeId(bodyType: FernIr.TypeReference): FernIr.TypeId | undefined {
        if (bodyType.type !== "named") {
            return undefined;
        }
        const resolvedTypeId = this.resolveNamedTypeId(bodyType.typeId);
        const shape = this.context.getTypeDeclarationOrThrow(resolvedTypeId).shape;
        // Enums and aliases are modules, not classes, so they don't have a .new() method
        if (shape.type === "enum" || shape.type === "alias") {
            return undefined;
        }
        return resolvedTypeId;
    }

    /**
     * The expression for a body passed as the single `parameterName:` argument. Lists and sets of objects are serialized
     * element-wise through the model so fields use their wire names; sets are converted to arrays
     * because `JSON.generate` does not serialize `Set`.
     */
    protected getBodyValueExpression(bodyType: FernIr.TypeReference, parameterName: FernIr.NameOrString): string {
        const value = `params[:${this.case.snakeSafe(parameterName)}]`;
        const container = this.getCollectionContainer(bodyType);
        if (container == null) {
            return value;
        }
        const itemModelTypeId = this.getObjectTypeId(container.itemType);
        if (itemModelTypeId != null) {
            return `${value}&.map { |item| ${this.context.getReferenceToTypeId(itemModelTypeId)}.new(item).to_h }`;
        }
        return container.isSet ? `${value}&.to_a` : value;
    }

    private getCollectionContainer(
        typeReference: FernIr.TypeReference
    ): { itemType: FernIr.TypeReference; isSet: boolean } | undefined {
        const resolved = this.unwrapTypeReference(typeReference);
        if (resolved.type !== "container") {
            return undefined;
        }
        const container = resolved.container;
        if (container.type === "list") {
            return { itemType: container.list, isSet: false };
        }
        if (container.type === "set") {
            return { itemType: container.set, isSet: true };
        }
        return undefined;
    }

    private getObjectTypeId(typeReference: FernIr.TypeReference): FernIr.TypeId | undefined {
        const resolved = this.unwrapTypeReference(typeReference);
        if (resolved.type !== "named") {
            return undefined;
        }
        const shape = this.context.getTypeDeclarationOrThrow(resolved.typeId).shape;
        return shape.type === "object" ? resolved.typeId : undefined;
    }

    private unwrapTypeReference(typeReference: FernIr.TypeReference): FernIr.TypeReference {
        return unwrapTypeReference(typeReference, (typeId) => this.context.getTypeDeclarationOrThrow(typeId));
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
