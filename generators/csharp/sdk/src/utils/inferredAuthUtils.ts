import { getWireValue } from "@fern-api/base-generator";
import { FernIr } from "@fern-fern/ir-sdk";

type HttpEndpoint = FernIr.HttpEndpoint;
type TypeReference = FernIr.TypeReference;

import { SdkGeneratorContext } from "../SdkGeneratorContext.js";
import { getRequestBodyProperties } from "./requestBodyUtils.js";

export interface InferredAuthCredential {
    /**
     * The field name in camelCase (used for private fields and constructor parameters)
     */
    camelName: string;
    /**
     * The property name in PascalCase (used for request object initializers)
     */
    pascalName: string;
    /**
     * The wire name (used for examples and mock server expectations)
     */
    wireValue: string;
    /**
     * The type reference from the IR
     */
    typeReference: TypeReference;
    /**
     * Optional documentation
     */
    docs?: string;
    /**
     * Whether this credential comes from a header (true) or body property (false)
     */
    isFromHeader: boolean;
    /**
     * Whether the field is optional
     */
    isOptional: boolean;
}

/**
 * Collects all credential parameters from a token endpoint's headers and body.
 * This includes both required and optional parameters, but excludes literal types.
 *
 * @param context - The SDK generator context
 * @param tokenEndpoint - The token endpoint to extract credentials from
 * @returns Array of credential information, with headers first, then body properties
 */
export function collectInferredAuthCredentials(
    context: SdkGeneratorContext,
    tokenEndpoint: HttpEndpoint
): InferredAuthCredential[] {
    const credentials: InferredAuthCredential[] = [];
    const seenNames = new Set<string>();

    for (const header of tokenEndpoint.headers) {
        if (header.valueType.type === "container" && header.valueType.container.type === "literal") {
            continue;
        }

        const camelName = context.case.camelUnsafe(header.name);
        const typeRef = context.csharpTypeMapper.convert({
            reference: header.valueType
        });

        credentials.push({
            camelName,
            pascalName: context.case.pascalSafe(header.name),
            wireValue: getWireValue(header.name),
            typeReference: header.valueType,
            docs: header.docs,
            isFromHeader: true,
            isOptional: typeRef.isOptional
        });

        seenNames.add(camelName);
    }

    for (const prop of getRequestBodyProperties(context, tokenEndpoint.requestBody)) {
        const camelName = context.case.camelUnsafe(prop.name);

        if (seenNames.has(camelName)) {
            continue;
        }

        const typeRef = context.csharpTypeMapper.convert({
            reference: prop.valueType
        });

        credentials.push({
            camelName,
            pascalName: context.case.pascalSafe(prop.name),
            wireValue: getWireValue(prop.name),
            typeReference: prop.valueType,
            docs: prop.docs,
            isFromHeader: false,
            isOptional: typeRef.isOptional
        });

        seenNames.add(camelName);
    }

    return credentials;
}
