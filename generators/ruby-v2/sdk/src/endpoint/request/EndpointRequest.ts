import { CaseConverter } from "@fern-api/base-generator";
import { ruby } from "@fern-api/ruby-ast";
import { FernIr } from "@fern-fern/ir-sdk";
import { SdkGeneratorContext } from "../../SdkGeneratorContext.js";
import { RawClient } from "../http/RawClient.js";

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
