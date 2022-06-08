import { HttpEndpoint, NamedType } from "@fern-api/api";
import { getOrCreateSourceFile, getTextOfTsKeyword, getTextOfTsNode, TypeResolver } from "@fern-typescript/commons";
import { Directory, OptionalKind, PropertySignatureStructure, SourceFile, ts, Writers } from "ts-morph";
import { ClientConstants } from "../../../../constants";
import { generateServiceTypeReference } from "../../../../service-types/generateServiceTypeReference";
import { ServiceTypeReference } from "../../../../service-types/types";
import { getEndpointTypeReference } from "../../getEndpointTypeReference";
import { EndpointTypeName, getLocalEndpointTypeReference } from "../../getLocalEndpointTypeReference";
import { GeneratedEndpointTypes } from "../types";
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
    const successBodyReference = generateServiceTypeReference({
        typeName: ClientConstants.HttpService.Endpoint.Types.Response.Success.Properties.Body.TYPE_NAME,
        type: endpoint.response.ok,
        docs: endpoint.response.docs,
        typeDirectory: endpointDirectory,
        modelDirectory,
        typeResolver,
    });

    const responseFile = getOrCreateSourceFile(
        endpointDirectory,
        `${ClientConstants.HttpService.Endpoint.Types.Response.TYPE_NAME}.ts`
    );

    responseFile.addTypeAlias({
        name: ClientConstants.HttpService.Endpoint.Types.Response.TYPE_NAME,
        type: Writers.unionType(
            ClientConstants.HttpService.Endpoint.Types.Response.Success.TYPE_NAME,
            ClientConstants.HttpService.Endpoint.Types.Response.Error.TYPE_NAME
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
        `${ClientConstants.HttpService.Endpoint.Types.Response.Error.Properties.Body.TYPE_NAME}.ts`
    );

    generateErrorBody({
        errors: endpoint.response.errors,
        errorBodyFile,
        errorsDirectory,
    });

    responseFile.addInterface({
        name: ClientConstants.HttpService.Endpoint.Types.Response.Error.TYPE_NAME,
        isExported: true,
        properties: [
            ...createBaseResponseProperties({ ok: false }),
            {
                name: ClientConstants.HttpService.Endpoint.Types.Response.Error.Properties.Body.PROPERTY_NAME,
                type: getTextOfTsNode(
                    getLocalEndpointTypeReference({
                        serviceName,
                        endpointId: endpoint.endpointId,
                        typeName: ClientConstants.HttpService.Endpoint.Types.Response.Error.Properties.Body.TYPE_NAME,
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
    successBodyReference: ServiceTypeReference<EndpointTypeName> | undefined;
    responseFile: SourceFile;
    modelDirectory: Directory;
    servicesDirectory: Directory;
}): void {
    const successResponseBodyReference =
        successBodyReference != null
            ? getEndpointTypeReference({
                  serviceName,
                  endpointId: endpoint.endpointId,
                  reference: successBodyReference,
                  referencedIn: responseFile,
                  servicesDirectory,
                  modelDirectory,
              })
            : undefined;

    responseFile.addInterface({
        name: ClientConstants.HttpService.Endpoint.Types.Response.Success.TYPE_NAME,
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
            name: ClientConstants.HttpService.Endpoint.Types.Response.Success.Properties.Body.PROPERTY_NAME,
            type: getTextOfTsNode(successResponseBodyReference),
        });
    }

    return properties;
}

function createBaseResponseProperties({ ok }: { ok: boolean }): OptionalKind<PropertySignatureStructure>[] {
    return [
        {
            name: ClientConstants.HttpService.Endpoint.Types.Response.Properties.OK,
            type: getTextOfTsNode(
                ts.factory.createLiteralTypeNode(ok ? ts.factory.createTrue() : ts.factory.createFalse())
            ),
        },
        {
            name: ClientConstants.HttpService.Endpoint.Types.Response.Properties.STATUS_CODE,
            type: getTextOfTsKeyword(ts.SyntaxKind.NumberKeyword),
        },
    ];
}
