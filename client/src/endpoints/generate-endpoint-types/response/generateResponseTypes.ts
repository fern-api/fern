import { HttpEndpoint, NamedType } from "@fern-api/api";
import { getOrCreateSourceFile, getTextOfTsKeyword, getTextOfTsNode, TypeResolver } from "@fern-typescript/commons";
import { Directory, OptionalKind, PropertySignatureStructure, SourceFile, ts, Writers } from "ts-morph";
import { ClientConstants } from "../../../constants";
import { generateEndpointTypeReference } from "../../generateEndpointTypeReference";
import { generateWireMessageBodyReference } from "../generateWireMessageBodyReference";
import { GeneratedEndpointTypes, WireMessageBodyReference } from "../types";
import { generateReferenceToWireMessageType } from "../utils";
import { generateErrorBody } from "./generateErrorBody";

export declare namespace generateResponseTypes {
    export interface Args {
        serviceName: NamedType;
        endpoint: HttpEndpoint;
        endpointDirectory: Directory;
        modelDirectory: Directory;
        errorsDirectory: Directory;
        servicesDirectory: Directory;
        typeResolver: TypeResolver;
    }

    export type Return = GeneratedEndpointTypes["response"];
}

export function generateResponseTypes({
    serviceName,
    endpoint,
    endpointDirectory,
    modelDirectory,
    errorsDirectory,
    servicesDirectory,
    typeResolver,
}: generateResponseTypes.Args): generateResponseTypes.Return {
    const successBodyReference = generateWireMessageBodyReference({
        typeName: ClientConstants.Service.Endpoint.Types.Response.Success.Properties.Body.TYPE_NAME,
        type: endpoint.response.ok,
        docs: endpoint.response.docs,
        endpointDirectory,
        modelDirectory,
        typeResolver,
    });

    const responseFile = getOrCreateSourceFile(
        endpointDirectory,
        `${ClientConstants.Service.Endpoint.Types.Response.TYPE_NAME}.ts`
    );

    responseFile.addTypeAlias({
        name: ClientConstants.Service.Endpoint.Types.Response.TYPE_NAME,
        type: Writers.unionType(
            ClientConstants.Service.Endpoint.Types.Response.Success.TYPE_NAME,
            ClientConstants.Service.Endpoint.Types.Response.Error.TYPE_NAME
        ),
        isExported: true,
    });

    addSuccessResponseInterface({
        endpoint,
        serviceName,
        responseFile,
        successBodyReference,
        modelDirectory,
        servicesDirectory,
    });

    const errorBodyFile = getOrCreateSourceFile(
        endpointDirectory,
        `${ClientConstants.Service.Endpoint.Types.Response.Error.Properties.Body.TYPE_NAME}.ts`
    );

    generateErrorBody({
        errors: endpoint.response.errors,
        errorBodyFile,
        errorsDirectory,
    });

    responseFile.addInterface({
        name: ClientConstants.Service.Endpoint.Types.Response.Error.TYPE_NAME,
        isExported: true,
        properties: [
            ...createBaseResponseProperties({ ok: false }),
            {
                name: ClientConstants.Service.Endpoint.Types.Response.Error.Properties.Body.PROPERTY_NAME,
                type: getTextOfTsNode(
                    generateEndpointTypeReference({
                        serviceName,
                        endpointId: endpoint.endpointId,
                        typeName: ClientConstants.Service.Endpoint.Types.Response.Error.Properties.Body.TYPE_NAME,
                        referencedIn: responseFile,
                        servicesDirectory,
                    })
                ),
            },
        ],
    });

    return {
        successBodyReference,
        encoding: endpoint.response.encoding,
    };
}

function addSuccessResponseInterface({
    serviceName,
    endpoint,
    successBodyReference,
    responseFile,
    modelDirectory,
    servicesDirectory,
}: {
    serviceName: NamedType;
    endpoint: HttpEndpoint;
    successBodyReference: WireMessageBodyReference | undefined;
    responseFile: SourceFile;
    modelDirectory: Directory;
    servicesDirectory: Directory;
}): void {
    const successResponseBodyReference =
        successBodyReference != null
            ? generateReferenceToWireMessageType({
                  serviceName,
                  endpointId: endpoint.endpointId,
                  reference: successBodyReference,
                  referencedIn: responseFile,
                  servicesDirectory,
                  modelDirectory,
              })
            : undefined;

    responseFile.addInterface({
        name: ClientConstants.Service.Endpoint.Types.Response.Success.TYPE_NAME,
        isExported: true,
        properties: generateSuccessResponseProperties({
            successResponseBodyReference,
        }),
    });
}

function generateSuccessResponseProperties({
    successResponseBodyReference,
}: {
    successResponseBodyReference: ts.TypeNode | undefined;
}): OptionalKind<PropertySignatureStructure>[] {
    const properties = createBaseResponseProperties({ ok: true });

    if (successResponseBodyReference != null) {
        properties.push({
            name: ClientConstants.Service.Endpoint.Types.Response.Success.Properties.Body.PROPERTY_NAME,
            type: getTextOfTsNode(successResponseBodyReference),
        });
    }

    return properties;
}

function createBaseResponseProperties({ ok }: { ok: boolean }): OptionalKind<PropertySignatureStructure>[] {
    return [
        {
            name: ClientConstants.Service.Endpoint.Types.Response.Properties.OK,
            type: getTextOfTsNode(
                ts.factory.createLiteralTypeNode(ok ? ts.factory.createTrue() : ts.factory.createFalse())
            ),
        },
        {
            name: ClientConstants.Service.Endpoint.Types.Response.Properties.STATUS_CODE,
            type: getTextOfTsKeyword(ts.SyntaxKind.NumberKeyword),
        },
    ];
}
