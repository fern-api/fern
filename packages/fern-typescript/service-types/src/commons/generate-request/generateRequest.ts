import { Type } from "@fern-api/api";
import { getTextOfTsNode, ModelContext, ServiceTypeReference } from "@fern-typescript/commons";
import { OptionalKind, PropertySignatureStructure, SourceFile, ts } from "ts-morph";
import { ServiceTypesConstants } from "../../constants";
import {
    generateServiceTypeReference,
    ServiceTypeFileWriter,
} from "../service-type-reference/generateServiceTypeReference";

/**
 * TODO this is kinda weird. For endpoints wrapper refers to something the consumer passes in (e.g. it includes query
 * params). in websockets it refers to the wrapper that is never exposed to consumers (e.g. "id", "operation").
 */
export interface GeneratedRequest<M> {
    body: ServiceTypeReference<M> | undefined;
    // if there's additional properties with the request, the body might be wrappd
    wrapper:
        | {
              propertyName: string;
              reference: ServiceTypeReference<M>;
          }
        | undefined;
}

export declare namespace generateRequest {
    export interface Args<M> {
        modelContext: ModelContext;
        writeServiceTypeFile: ServiceTypeFileWriter<M>;
        getTypeReferenceToServiceType: (args: {
            reference: ServiceTypeReference<M>;
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

export function generateRequest<M>({
    writeServiceTypeFile,
    modelContext,
    getTypeReferenceToServiceType,
    body,
    additionalProperties = [],
}: generateRequest.Args<M>): GeneratedRequest<M> {
    if (additionalProperties.length === 0) {
        const requestBodyReference = generateServiceTypeReference({
            // use the request body as the Request (don't generate a RequestBody type at all)
            typeName: ServiceTypesConstants.Commons.Request.TYPE_NAME,
            type: body.type,
            docs: body.docs,
            modelContext,
            writer: writeServiceTypeFile,
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
        typeName: ServiceTypesConstants.Commons.Request.Properties.Body.TYPE_NAME,
        type: body.type,
        docs: body.docs,
        modelContext,
        writer: writeServiceTypeFile,
    });

    const requestMetadata = writeServiceTypeFile(
        ServiceTypesConstants.Commons.Request.TYPE_NAME,
        (requestFile, transformedTypeName) => {
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
                name: transformedTypeName,
                properties,
                isExported: true,
            });
        }
    );

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
