import { Type } from "@fern-api/api";
import { getTextOfTsNode, ModelContext, ServiceTypeMetadata } from "@fern-typescript/commons";
import { OptionalKind, PropertySignatureStructure, SourceFile, ts } from "ts-morph";
import { ServiceTypesConstants } from "../../constants";
import { generateServiceTypeReference } from "../service-type-reference/generateServiceTypeReference";
import { ServiceTypeReference } from "../service-type-reference/types";

/**
 * TODO this is kinda weird. For endpoints wrapper refers to something the consumer passes in (e.g. it includes query
 * params). in websockets it refers to the wrapper that is never exposed to consumers (e.g. "id", "operation").
 */
export interface GeneratedRequest {
    body: ServiceTypeReference | undefined;
    // if there's additional properties with the request, the body might be wrappd
    wrapper:
        | {
              propertyName: string;
              reference: ServiceTypeReference;
          }
        | undefined;
}

export declare namespace generateRequest {
    export interface Args {
        modelContext: ModelContext;
        requestMetadata: ServiceTypeMetadata;
        requestBodyMetadata: ServiceTypeMetadata;
        getTypeReferenceToServiceType: (args: {
            reference: ServiceTypeReference;
            referencedIn: SourceFile;
        }) => ts.TypeNode;
        body: {
            type: Type;
            docs: string | null | undefined;
        };
        additionalProperties?: (
            | OptionalKind<PropertySignatureStructure>
            | ((file: SourceFile) => OptionalKind<PropertySignatureStructure>)
        )[];
    }
}

export function generateRequest({
    modelContext,
    requestMetadata,
    requestBodyMetadata,
    getTypeReferenceToServiceType,
    body,
    additionalProperties = [],
}: generateRequest.Args): GeneratedRequest {
    if (additionalProperties.length === 0) {
        const requestBodyReference = generateServiceTypeReference({
            // use the request body as the Request (don't generate a RequestBody type at all)
            metadata: requestMetadata,
            type: body.type,
            docs: body.docs,
            modelContext,
        });
        if (requestBodyReference == null) {
            return { body: undefined, wrapper: undefined };
        } else {
            return {
                body: requestBodyReference,
                wrapper: undefined,
            };
        }
    }

    const requestBodyReference = generateServiceTypeReference({
        // put the request body in its own RequestBody type/file
        metadata: requestBodyMetadata,
        type: body.type,
        docs: body.docs,
        modelContext,
    });

    modelContext.addServiceTypeDefinition(requestMetadata, (requestFile) => {
        const properties: OptionalKind<PropertySignatureStructure>[] = [
            ...additionalProperties.map((property) =>
                typeof property === "function" ? property(requestFile) : property
            ),
        ];

        if (requestBodyReference != null) {
            properties.push({
                name: ServiceTypesConstants.Commons.Request.Properties.Body.PROPERTY_NAME,
                type: getTextOfTsNode(
                    getTypeReferenceToServiceType({
                        reference: requestBodyReference,
                        referencedIn: requestFile,
                    })
                ),
            });
        }

        requestFile.addInterface({
            name: requestMetadata.typeName,
            properties,
            isExported: true,
        });
    });

    return {
        wrapper: {
            reference: {
                isInlined: true,
                metadata: requestMetadata,
            },
            propertyName: ServiceTypesConstants.Commons.Request.Properties.Body.PROPERTY_NAME,
        },
        body: requestBodyReference,
    };
}
