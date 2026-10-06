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

    /**
     * Writes `<valueExpression>.nil? ? nil : ` for bodies passed as a single argument, so an omitted
     * optional body stays nil (and the Content-Type header is omitted). `.empty?` is not used because
     * `[]`, `{}`, and `""` are valid explicit bodies and scalars do not respond to it.
     */
    protected writeOptionalValueGuard(writer: ruby.Writer, valueExpression: string): void {
        writer.write(`${valueExpression}.nil? ? nil : `);
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
     * The expression for a body passed as the single `parameterName:` argument. Objects (including
     * optional, nullable, and those nested in lists, sets, and map values) are serialized through
     * their model so fields use their wire names; sets are converted to arrays because
     * `JSON.generate` does not serialize `Set`. Omitted values stay nil.
     */
    protected getBodyArgumentReference(parameterName: FernIr.NameOrString): string {
        return `params[:${this.case.snakeSafe(parameterName)}]`;
    }

    protected getBodyValueExpression(bodyType: FernIr.TypeReference, parameterName: FernIr.NameOrString): string {
        const value = this.getBodyArgumentReference(parameterName);
        return this.getSerializedValueExpression(bodyType, value, { depth: 0, nilable: true }) ?? value;
    }

    /**
     * Returns an expression converting `value` to its wire representation, or undefined when the
     * value can be sent as-is.
     */
    private getSerializedValueExpression(
        typeReference: FernIr.TypeReference,
        value: string,
        { depth, nilable }: { depth: number; nilable: boolean }
    ): string | undefined {
        const resolved = this.resolveAliases(typeReference);
        if (resolved.type === "named") {
            if (this.context.getTypeDeclarationOrThrow(resolved.typeId).shape.type !== "object") {
                return undefined;
            }
            const model = this.context.getReferenceToTypeId(resolved.typeId);
            if (!nilable) {
                return `${model}.new(${value}).to_h`;
            }
            const blockVar = toBlockVariable("value", depth);
            return `${value}&.then { |${blockVar}| ${model}.new(${blockVar}).to_h }`;
        }
        if (resolved.type !== "container") {
            return undefined;
        }
        const container = resolved.container;
        switch (container.type) {
            case "optional":
                return this.getSerializedValueExpression(container.optional, value, { depth, nilable: true });
            case "nullable":
                return this.getSerializedValueExpression(container.nullable, value, { depth, nilable: true });
            case "list":
            case "set": {
                const itemVar = toBlockVariable("item", depth);
                const itemType = container.type === "list" ? container.list : container.set;
                const item = this.getSerializedValueExpression(itemType, itemVar, { depth: depth + 1, nilable: false });
                if (item != null) {
                    return `${value}${nilable ? "&." : "."}map { |${itemVar}| ${item} }`;
                }
                return container.type === "set" ? `${value}${nilable ? "&." : "."}to_a` : undefined;
            }
            case "map": {
                const valueVar = toBlockVariable("value", depth);
                const mapValue = this.getSerializedValueExpression(container.valueType, valueVar, {
                    depth: depth + 1,
                    nilable: false
                });
                return mapValue != null
                    ? `${value}${nilable ? "&." : "."}transform_values { |${valueVar}| ${mapValue} }`
                    : undefined;
            }
            default:
                return undefined;
        }
    }

    private resolveAliases(typeReference: FernIr.TypeReference): FernIr.TypeReference {
        const seen = new Set<FernIr.TypeId>();
        let current = typeReference;
        while (current.type === "named" && !seen.has(current.typeId)) {
            seen.add(current.typeId);
            const shape = this.context.getTypeDeclarationOrThrow(current.typeId).shape;
            if (shape.type !== "alias") {
                break;
            }
            current = shape.aliasOf;
        }
        return current;
    }

    public abstract getQueryParameterCodeBlock(queryParameterBagName: string): QueryParameterCodeBlock | undefined;

    public abstract getHeaderParameterCodeBlock(): HeaderParameterCodeBlock | undefined;

    public abstract getRequestBodyCodeBlock(): RequestBodyCodeBlock | undefined;

    public abstract getRequestType(): RawClient.RequestBodyType | undefined;
}

function toBlockVariable(name: string, depth: number): string {
    return depth === 0 ? name : `${name}${depth}`;
}

export function toRubySymbolArray(names: string[]): string {
    if (names.some((name) => name.includes(" "))) {
        throw GeneratorError.internalError("Symbol array cannot contain spaces");
    }
    return `%i[${names.join(" ")}]`;
}
