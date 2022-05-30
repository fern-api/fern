import { HttpEndpoint } from "@fern-api/api";
import {
    generateTypeReference,
    getOrCreateSourceFile,
    getTextOfTsKeyword,
    getTextOfTsNode,
    TypeResolver,
} from "@fern-typescript/commons";
import { Directory, OptionalKind, PropertySignatureStructure, SourceFile, ts, Writers } from "ts-morph";
import { ClientConstants } from "../../../constants";
import { generateWireMessageBodyReference } from "../generateWireMessageBodyReference";
import { GeneratedEndpointTypes, WireMessageBodyReference } from "../types";
import { generateErrorBodyReference } from "./generateErrorBodyReference";

export declare namespace generateResponseTypes {
    export interface Args {
        endpoint: HttpEndpoint;
        endpointDirectory: Directory;
        modelDirectory: Directory;
        errorsDirectory: Directory;
        typeResolver: TypeResolver;
    }

    export type Return = GeneratedEndpointTypes["response"];
}

export function generateResponseTypes({
    endpoint,
    endpointDirectory,
    modelDirectory,
    errorsDirectory,
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
        responseFile,
        successBodyReference,
        modelDirectory,
    });

    const errorBodyFile = getOrCreateSourceFile(
        endpointDirectory,
        `${ClientConstants.Service.Endpoint.Types.Response.Error.Properties.Body.TYPE_NAME}.ts`
    );
    responseFile.addInterface({
        name: ClientConstants.Service.Endpoint.Types.Response.Error.TYPE_NAME,
        isExported: true,
        properties: [
            ...createBaseResponseProperties({ ok: false }),
            {
                name: ClientConstants.Service.Endpoint.Types.Response.Error.Properties.Body.PROPERTY_NAME,
                type: getTextOfTsNode(
                    generateErrorBodyReference({
                        errors: endpoint.response.errors,
                        errorBodyFile,
                        referencedIn: responseFile,
                        errorsDirectory,
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
    successBodyReference,
    responseFile,
    modelDirectory,
}: {
    successBodyReference: WireMessageBodyReference | undefined;
    responseFile: SourceFile;
    modelDirectory: Directory;
}): void {
    const successResponseBodyReference =
        successBodyReference != null
            ? successBodyReference.isLocal
                ? successBodyReference.generateTypeReference(responseFile)
                : generateTypeReference({
                      reference: successBodyReference.typeReference,
                      referencedIn: responseFile,
                      modelDirectory,
                      factory: ts.factory,
                      SyntaxKind: ts.SyntaxKind,
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
