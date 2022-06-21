import { FailedResponse, Type } from "@fern-api/api";
import {
    DependencyManager,
    ErrorResolver,
    getOrCreateSourceFile,
    getTextOfTsNode,
    ModelContext,
    TypeResolver,
} from "@fern-typescript/commons";
import {
    Directory,
    ModuleDeclaration,
    OptionalKind,
    PropertySignatureStructure,
    SourceFile,
    ts,
    Writers,
} from "ts-morph";
import { ServiceTypesConstants } from "../../constants";
import { generateServiceTypeReference } from "../service-type-reference/generateServiceTypeReference";
import {
    InlinedServiceTypeReference,
    ServiceTypeMetadata,
    ServiceTypeReference,
} from "../service-type-reference/types";
import { generateErrorBody } from "./generateErrorBody";

export declare namespace generateResponse {
    export interface Args {
        modelDirectory: Directory;
        modelContext: ModelContext;
        responseMetadata: ServiceTypeMetadata;
        successBodyMetadata: ServiceTypeMetadata;
        errorBodyMetadata: ServiceTypeMetadata;
        typeResolver: TypeResolver;
        errorResolver: ErrorResolver;
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
        reference: InlinedServiceTypeReference;
        successBodyReference: ServiceTypeReference | undefined;
        errorBodyReference: ServiceTypeReference | undefined;
    }
}

export function generateResponse({
    modelDirectory,
    modelContext,
    responseMetadata,
    successBodyMetadata,
    errorBodyMetadata,
    typeResolver,
    errorResolver,
    dependencyManager,
    successResponse,
    failedResponse,
    getTypeReferenceToServiceType,
    additionalProperties = [],
}: generateResponse.Args): generateResponse.Return {
    const responseFile = getOrCreateSourceFile(modelDirectory, responseMetadata.filepath);

    responseFile.addTypeAlias({
        name: responseMetadata.typeName,
        type: Writers.unionType(
            getTextOfTsNode(
                ts.factory.createTypeReferenceNode(
                    ts.factory.createQualifiedName(
                        ts.factory.createIdentifier(responseMetadata.typeName),
                        ts.factory.createIdentifier(ServiceTypesConstants.Commons.Response.Success.TYPE_NAME)
                    ),
                    undefined
                )
            ),
            getTextOfTsNode(
                ts.factory.createTypeReferenceNode(
                    ts.factory.createQualifiedName(
                        ts.factory.createIdentifier(responseMetadata.typeName),
                        ts.factory.createIdentifier(ServiceTypesConstants.Commons.Response.Error.TYPE_NAME)
                    ),
                    undefined
                )
            )
        ),
        isExported: true,
    });

    const responseNamespace = responseFile.addModule({
        name: responseMetadata.typeName,
    });

    const successBodyReference = generateServiceTypeReference({
        metadata: successBodyMetadata,
        type: successResponse.type,
        docs: successResponse.docs,
        modelDirectory,
        modelContext,
        typeResolver,
    });
    addSuccessResponseInterface({
        responseNamespace,
        successBodyReference,
        getTypeReferenceToServiceType,
        additionalProperties,
    });

    const { errorBodyReference } = maybeGenerateErrorBody({
        modelDirectory,
        modelContext,
        errorBodyMetadata,
        failedResponse,
        typeResolver,
        errorResolver,
        dependencyManager,
    });

    addErrorResponseInterface({
        responseNamespace,
        additionalProperties,
        getTypeReferenceToServiceType,
        errorBodyReference,
    });

    return {
        reference: {
            isInlined: true,
            metadata: responseMetadata,
            file: responseFile,
        },
        successBodyReference,
        errorBodyReference,
    };
}

function addSuccessResponseInterface({
    successBodyReference,
    getTypeReferenceToServiceType,
    responseNamespace,
    additionalProperties,
}: {
    successBodyReference: ServiceTypeReference | undefined;
    getTypeReferenceToServiceType: (args: { reference: ServiceTypeReference; referencedIn: SourceFile }) => ts.TypeNode;
    responseNamespace: ModuleDeclaration;
    additionalProperties: OptionalKind<PropertySignatureStructure>[];
}): void {
    const successResponseBodyReference =
        successBodyReference != null
            ? getTypeReferenceToServiceType({
                  reference: successBodyReference,
                  referencedIn: responseNamespace.getSourceFile(),
              })
            : undefined;

    responseNamespace.addInterface({
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

function addErrorResponseInterface({
    responseNamespace,
    additionalProperties,
    getTypeReferenceToServiceType,
    errorBodyReference,
}: {
    responseNamespace: ModuleDeclaration;
    additionalProperties: OptionalKind<PropertySignatureStructure>[];
    getTypeReferenceToServiceType: (args: { reference: ServiceTypeReference; referencedIn: SourceFile }) => ts.TypeNode;
    errorBodyReference: ServiceTypeReference | undefined;
}) {
    const properties: OptionalKind<PropertySignatureStructure>[] = [
        ...createBaseResponseProperties({ ok: false }),
        ...additionalProperties,
    ];

    if (errorBodyReference != null) {
        properties.push({
            name: ServiceTypesConstants.Commons.Response.Error.Properties.Body.PROPERTY_NAME,
            type: getTextOfTsNode(
                getTypeReferenceToServiceType({
                    reference: errorBodyReference,
                    referencedIn: responseNamespace.getSourceFile(),
                })
            ),
        });
    }

    responseNamespace.addInterface({
        name: ServiceTypesConstants.Commons.Response.Error.TYPE_NAME,
        isExported: true,
        properties,
    });
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

function maybeGenerateErrorBody({
    modelDirectory,
    modelContext,
    errorBodyMetadata,
    failedResponse,
    typeResolver,
    errorResolver,
    dependencyManager,
}: {
    modelDirectory: Directory;
    modelContext: ModelContext;
    errorBodyMetadata: ServiceTypeMetadata;
    failedResponse: FailedResponse;
    typeResolver: TypeResolver;
    errorResolver: ErrorResolver;
    dependencyManager: DependencyManager;
}): { errorBodyReference: ServiceTypeReference | undefined } {
    if (failedResponse.errors.length === 0) {
        return { errorBodyReference: undefined };
    }

    const errorBodyFile = getOrCreateSourceFile(modelDirectory, errorBodyMetadata.filepath);
    generateErrorBody({
        failedResponse,
        errorBodyFile,
        errorBodyMetadata,
        typeResolver,
        errorResolver,
        modelContext,
        dependencyManager,
    });

    return {
        errorBodyReference: {
            isInlined: true,
            metadata: errorBodyMetadata,
            file: errorBodyFile,
        },
    };
}
