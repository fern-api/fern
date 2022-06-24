import { FailedResponse, Type } from "@fern-api/api";
import { DependencyManager, getTextOfTsNode } from "@fern-typescript/commons";
import { InlinedServiceTypeReference, ModelContext, ServiceTypeReference } from "@fern-typescript/model-context";
import { ModuleDeclaration, OptionalKind, PropertySignatureStructure, SourceFile, ts, Writers } from "ts-morph";
import { ServiceTypesConstants } from "../../constants";
import {
    generateServiceTypeReference,
    ServiceTypeFileWriter,
} from "../service-type-reference/generateServiceTypeReference";
import { generateErrorBody } from "./generateErrorBody";

export declare namespace generateResponse {
    export interface Args<M> {
        modelContext: ModelContext;
        writeServiceTypeFile: ServiceTypeFileWriter<M>;
        dependencyManager: DependencyManager;
        successResponse: {
            docs: string | null | undefined;
            type: Type;
        };
        failedResponse: FailedResponse;
        getTypeReferenceToServiceType: (args: {
            reference: ServiceTypeReference<M>;
            referencedIn: SourceFile;
        }) => ts.TypeNode;
        additionalProperties?: OptionalKind<PropertySignatureStructure>[];
    }

    export interface Return<M> {
        reference: InlinedServiceTypeReference<M>;
        successBodyReference: ServiceTypeReference<M> | undefined;
        errorBodyReference: InlinedServiceTypeReference<M>;
    }
}

export function generateResponse<M>({
    modelContext,
    writeServiceTypeFile,
    dependencyManager,
    successResponse,
    failedResponse,
    getTypeReferenceToServiceType,
    additionalProperties = [],
}: generateResponse.Args<M>): generateResponse.Return<M> {
    const successBodyReference = generateServiceTypeReference({
        typeName: ServiceTypesConstants.Commons.Response.Success.Properties.Body.TYPE_NAME,
        writer: writeServiceTypeFile,
        type: successResponse.type,
        docs: successResponse.docs,
        modelContext,
    });

    const { errorBodyReference } = maybeGenerateErrorBody({
        modelContext,
        failedResponse,
        dependencyManager,
        writeServiceTypeFile,
    });

    const responseMetadata = writeServiceTypeFile(
        ServiceTypesConstants.Commons.Response.TYPE_NAME,
        (responseFile, transformedTypeName) => {
            responseFile.addTypeAlias({
                name: transformedTypeName,
                type: Writers.unionType(
                    getTextOfTsNode(
                        ts.factory.createTypeReferenceNode(
                            ts.factory.createQualifiedName(
                                ts.factory.createIdentifier(transformedTypeName),
                                ts.factory.createIdentifier(ServiceTypesConstants.Commons.Response.Success.TYPE_NAME)
                            ),
                            undefined
                        )
                    ),
                    getTextOfTsNode(
                        ts.factory.createTypeReferenceNode(
                            ts.factory.createQualifiedName(
                                ts.factory.createIdentifier(transformedTypeName),
                                ts.factory.createIdentifier(ServiceTypesConstants.Commons.Response.Error.TYPE_NAME)
                            ),
                            undefined
                        )
                    )
                ),
                isExported: true,
            });

            const responseNamespace = responseFile.addModule({
                name: transformedTypeName,
            });

            addSuccessResponseInterface({
                responseNamespace,
                successBodyReference,
                getTypeReferenceToServiceType,
                additionalProperties,
            });

            addErrorResponseInterface({
                responseNamespace,
                additionalProperties,
                getTypeReferenceToServiceType,
                errorBodyReference,
            });
        }
    );

    return {
        reference: {
            isInlined: true,
            metadata: responseMetadata,
        },
        successBodyReference,
        errorBodyReference,
    };
}

function addSuccessResponseInterface<M>({
    successBodyReference,
    getTypeReferenceToServiceType,
    responseNamespace,
    additionalProperties,
}: {
    successBodyReference: ServiceTypeReference<M> | undefined;
    getTypeReferenceToServiceType: (args: {
        reference: ServiceTypeReference<M>;
        referencedIn: SourceFile;
    }) => ts.TypeNode;
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

function addErrorResponseInterface<M>({
    responseNamespace,
    additionalProperties,
    getTypeReferenceToServiceType,
    errorBodyReference,
}: {
    responseNamespace: ModuleDeclaration;
    additionalProperties: OptionalKind<PropertySignatureStructure>[];
    getTypeReferenceToServiceType: (args: {
        reference: ServiceTypeReference<M>;
        referencedIn: SourceFile;
    }) => ts.TypeNode;
    errorBodyReference: ServiceTypeReference<M>;
}) {
    const properties: OptionalKind<PropertySignatureStructure>[] = [
        ...createBaseResponseProperties({ ok: false }),
        ...additionalProperties,
    ];

    properties.push({
        name: ServiceTypesConstants.Commons.Response.Error.Properties.Body.PROPERTY_NAME,
        type: getTextOfTsNode(
            getTypeReferenceToServiceType({
                reference: errorBodyReference,
                referencedIn: responseNamespace.getSourceFile(),
            })
        ),
    });

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

function maybeGenerateErrorBody<M>({
    modelContext,
    failedResponse,
    dependencyManager,
    writeServiceTypeFile,
}: {
    modelContext: ModelContext;
    failedResponse: FailedResponse;
    dependencyManager: DependencyManager;
    writeServiceTypeFile: ServiceTypeFileWriter<M>;
}): { errorBodyReference: InlinedServiceTypeReference<M> } {
    const errorBodyMetadata = writeServiceTypeFile(
        ServiceTypesConstants.Commons.Response.Error.Properties.Body.TYPE_NAME,
        (errorBodyFile, transformedTypeName) => {
            generateErrorBody({
                failedResponse,
                errorBodyFile,
                errorBodyTypeName: transformedTypeName,
                modelContext,
                dependencyManager,
            });
        }
    );

    return {
        errorBodyReference: {
            isInlined: true,
            metadata: errorBodyMetadata,
        },
    };
}
