import { FailedResponse, Type } from "@fern-api/api";
import { DependencyManager, getOrCreateSourceFile, getTextOfTsNode, TypeResolver } from "@fern-typescript/commons";
import { Directory, OptionalKind, PropertySignatureStructure, SourceFile, ts, Writers } from "ts-morph";
import { ServiceTypesConstants } from "../../constants";
import { generateServiceTypeReference } from "../service-type-reference/generateServiceTypeReference";
import { LocalServiceTypeReference, ServiceTypeReference } from "../service-type-reference/types";
import { generateErrorBody } from "./generateErrorBody";

export declare namespace generateResponse {
    export interface Args {
        directory: Directory;
        modelDirectory: Directory;
        typeResolver: TypeResolver;
        dependencyManager: DependencyManager;
        successResponse: {
            docs: string | null | undefined;
            type: Type;
        };
        failedResponse: FailedResponse;
        getTypeReferenceToServiceType: (args: {
            reference: ServiceTypeReference;
            referencedIn: SourceFile;
        }) => ts.TypeNode;
        additionalProperties?: OptionalKind<PropertySignatureStructure>[];
    }

    export interface Return {
        reference: LocalServiceTypeReference;
        successBodyReference: ServiceTypeReference | undefined;
    }
}

export function generateResponse({
    modelDirectory,
    typeResolver,
    dependencyManager,
    successResponse,
    failedResponse,
    getTypeReferenceToServiceType,
    directory,
    additionalProperties = [],
}: generateResponse.Args): generateResponse.Return {
    const successBodyReference = generateServiceTypeReference({
        typeName: ServiceTypesConstants.Commons.Response.Success.Properties.Body.TYPE_NAME,
        type: successResponse.type,
        docs: successResponse.docs,
        typeDirectory: directory,
        modelDirectory,
        typeResolver,
    });

    const responseFile = directory.createSourceFile(`${ServiceTypesConstants.Commons.Response.TYPE_NAME}.ts`);

    responseFile.addTypeAlias({
        name: ServiceTypesConstants.Commons.Response.TYPE_NAME,
        type: Writers.unionType(
            ServiceTypesConstants.Commons.Response.Success.TYPE_NAME,
            ServiceTypesConstants.Commons.Response.Error.TYPE_NAME
        ),
        isExported: true,
    });

    addSuccessResponseInterface({
        responseFile,
        successBodyReference,
        getTypeReferenceToServiceType,
        additionalProperties,
    });

    const errorBodyFile = getOrCreateSourceFile(
        directory,
        `${ServiceTypesConstants.Commons.Response.Error.Properties.Body.TYPE_NAME}.ts`
    );

    generateErrorBody({
        failedResponse,
        errorBodyFile,
        typeResolver,
        modelDirectory,
        dependencyManager,
    });

    responseFile.addInterface({
        name: ServiceTypesConstants.Commons.Response.Error.TYPE_NAME,
        isExported: true,
        properties: [
            ...createBaseResponseProperties({ ok: false }),
            ...additionalProperties,
            {
                name: ServiceTypesConstants.Commons.Response.Error.Properties.Body.PROPERTY_NAME,
                type: getTextOfTsNode(
                    getTypeReferenceToServiceType({
                        reference: {
                            isLocal: true,
                            typeName: ServiceTypesConstants.Commons.Response.Error.Properties.Body.TYPE_NAME,
                            file: errorBodyFile,
                        },
                        referencedIn: responseFile,
                    })
                ),
            },
        ],
    });

    return {
        reference: {
            isLocal: true,
            typeName: ServiceTypesConstants.Commons.Response.TYPE_NAME,
            file: responseFile,
        },
        successBodyReference,
    };
}

function addSuccessResponseInterface({
    successBodyReference,
    getTypeReferenceToServiceType,
    responseFile,
    additionalProperties,
}: {
    successBodyReference: ServiceTypeReference | undefined;
    getTypeReferenceToServiceType: (args: { reference: ServiceTypeReference; referencedIn: SourceFile }) => ts.TypeNode;
    responseFile: SourceFile;
    additionalProperties: OptionalKind<PropertySignatureStructure>[];
}): void {
    const successResponseBodyReference =
        successBodyReference != null
            ? getTypeReferenceToServiceType({ reference: successBodyReference, referencedIn: responseFile })
            : undefined;

    responseFile.addInterface({
        name: ServiceTypesConstants.Commons.Response.Success.TYPE_NAME,
        isExported: true,
        properties: generateSuccessResponseProperties({
            successResponseBodyReference,
            additionalProperties,
        }),
    });
}

function generateSuccessResponseProperties({
    successResponseBodyReference,
    additionalProperties,
}: {
    successResponseBodyReference: ts.TypeNode | undefined;
    additionalProperties: OptionalKind<PropertySignatureStructure>[];
}): OptionalKind<PropertySignatureStructure>[] {
    const properties = [...createBaseResponseProperties({ ok: true }), ...additionalProperties];

    if (successResponseBodyReference != null) {
        properties.push({
            name: ServiceTypesConstants.Commons.Response.Success.Properties.Body.PROPERTY_NAME,
            type: getTextOfTsNode(successResponseBodyReference),
        });
    }

    return properties;
}

function createBaseResponseProperties({ ok }: { ok: boolean }): OptionalKind<PropertySignatureStructure>[] {
    return [
        {
            name: ServiceTypesConstants.Commons.Response.Properties.OK,
            type: getTextOfTsNode(
                ts.factory.createLiteralTypeNode(ok ? ts.factory.createTrue() : ts.factory.createFalse())
            ),
        },
    ];
}
