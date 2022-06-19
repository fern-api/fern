import { Type } from "@fern-api/api";
import { createSourceFile, getTextOfTsNode, SourceFileManager, TypeResolver } from "@fern-typescript/commons";
import { Directory, OptionalKind, PropertySignatureStructure, ts } from "ts-morph";
import { ClientConstants } from "../../constants";
import { generateServiceTypeReference } from "../service-types/generateServiceTypeReference";
import { ServiceTypeReference } from "../service-types/types";

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
            referencedIn: SourceFileManager;
        }) => ts.TypeNode;
        body: {
            type: Type;
            docs: string | null | undefined;
        };
        additionalProperties?: (
            | OptionalKind<PropertySignatureStructure>
            | ((file: SourceFileManager) => OptionalKind<PropertySignatureStructure>)
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
            typeName: ClientConstants.Commons.Types.Request.TYPE_NAME,
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

    const requestFile = createSourceFile(directory, `${ClientConstants.Commons.Types.Request.TYPE_NAME}.ts`);

    const requestBodyReference = generateServiceTypeReference({
        // put the request body in its own RequestBody type/file
        typeName: ClientConstants.Commons.Types.Request.Properties.Body.TYPE_NAME,
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
            name: ClientConstants.Commons.Types.Request.Properties.Body.PROPERTY_NAME,
            type: getTextOfTsNode(
                getTypeReferenceToServiceType({
                    reference: requestBodyReference,
                    referencedIn: requestFile,
                })
            ),
        });
    }

    requestFile.file.addInterface({
        name: ClientConstants.Commons.Types.Request.TYPE_NAME,
        properties,
        isExported: true,
    });

    return {
        wrapper: {
            reference: {
                isLocal: true,
                typeName: ClientConstants.Commons.Types.Request.TYPE_NAME,
                file: requestFile,
            },
            propertyName: ClientConstants.Commons.Types.Request.Properties.Body.PROPERTY_NAME,
        },
        body: requestBodyReference,
    };
}
