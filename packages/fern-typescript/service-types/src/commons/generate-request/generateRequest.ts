import { Type } from "@fern-api/api";
import { getTextOfTsNode, TypeResolver } from "@fern-typescript/commons";
import { Directory, OptionalKind, PropertySignatureStructure, SourceFile, ts } from "ts-morph";
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
        directory: Directory;
        modelDirectory: Directory;
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
        typeResolver: TypeResolver;
    }
}

export function generateRequest({
    directory,
    modelDirectory,
    getTypeReferenceToServiceType,
    body,
    additionalProperties = [],
    typeResolver,
}: generateRequest.Args): GeneratedRequest {
    if (additionalProperties.length === 0) {
        const requestBodyReference = generateServiceTypeReference({
            // use the request body as the Request (don't generate a RequestBody type at all)
            typeName: ServiceTypesConstants.Commons.Request.TYPE_NAME,
            type: body.type,
            docs: body.docs,
            typeDirectory: directory,
            modelDirectory,
            typeResolver,
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

    const requestFile = directory.createSourceFile(`${ServiceTypesConstants.Commons.Request.TYPE_NAME}.ts`);

    const requestBodyReference = generateServiceTypeReference({
        // put the request body in its own RequestBody type/file
        typeName: ServiceTypesConstants.Commons.Request.Properties.Body.TYPE_NAME,
        type: body.type,
        docs: body.docs,
        typeDirectory: directory,
        modelDirectory,
        typeResolver,
    });

    const properties: OptionalKind<PropertySignatureStructure>[] = [
        ...additionalProperties.map((property) => (typeof property === "function" ? property(requestFile) : property)),
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
        name: ServiceTypesConstants.Commons.Request.TYPE_NAME,
        properties,
        isExported: true,
    });

    return {
        wrapper: {
            reference: {
                isLocal: true,
                typeName: ServiceTypesConstants.Commons.Request.TYPE_NAME,
                file: requestFile,
            },
            propertyName: ServiceTypesConstants.Commons.Request.Properties.Body.PROPERTY_NAME,
        },
        body: requestBodyReference,
    };
}
